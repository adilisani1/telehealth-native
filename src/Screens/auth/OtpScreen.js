'use client';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Colors} from '../../Constants/themeColors';
import {Fonts} from '../../Constants/Fonts';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import StackHeader from '../../components/Header/StackHeader';
import CustomButton from '../../components/Buttons/customButton';
import {SCREENS} from '../../Constants/Screens';
import {useAlert} from '../../Providers/AlertContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import authApi from '../../services/authApi';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/Slices/authSlice';
import { storeToken, getToken } from '../../utils/tokenStorage';

const OtpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {isDarkMode} = useSelector(store => store.theme);
  const {showAlert} = useAlert();
  const dispatch = useDispatch();

  const {emailOrPhone, userType, userData} = route.params || {
    emailOrPhone: 'user@example.com',
    userType: 'patient',
    userData: null,
  };

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const [otpFocusIndex, setOtpFocusIndex] = useState(-1);
  // Handle resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [resendTimer]);

  const handleOtpChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < 5) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      showAlert('Please enter a valid 6-digit OTP.', 'error');
      return;
    }

    try {
      // Use axios for consistent API calls
      const res = await authApi.verifyEmail({ email: emailOrPhone, otp: otpCode });
      const data = res.data || {};
      console.log('verifyEmail response:', data);
      if (data.success) {
        showAlert('Email verified successfully!', 'success');
        // Use token and user from verifyEmail response if present, else fallback to userData
        let token = data.token || (userData && userData.token);
        let refreshToken = data.refreshToken;
        let expiresIn = data.expiresIn;
        let userObj = data.user || (userData && userData.user);
        let userRole = userType;

        if (token) {
          // Store token with new secure manager
          try {
            const { tokenManager } = await import('../../utils/tokenStorage');
            await tokenManager.storeToken({
              token,
              refreshToken,
              expiresAt: Date.now() + (expiresIn * 1000), // Convert seconds to milliseconds
              tokenType: 'Bearer'
            });
          } catch (e) {
            console.error('Failed to store token:', e);
            // Fallback to legacy method
            await storeToken(token);
          }
          
          // If userObj is missing, fetch profile
          if (!userObj) {
            try {
              const profileRes = await authApi.getProfile(token);
              console.log('getProfile after verify:', profileRes.data);
              if (profileRes.data && profileRes.data.user && (profileRes.data.user._id || profileRes.data.user.id)) {
                userObj = profileRes.data.user;
              } else {
                showAlert('Could not fetch user data after verification. Raw: ' + JSON.stringify(profileRes.data), 'error');
                return;
              }
            } catch (err) {
              showAlert('Could not fetch user data after verification (profile error). ' + (err?.message || ''), 'error');
              return;
            }
          }
          // Set userRole from userObj if available
          if (userObj && userObj.role) {
            userRole = userObj.role;
          }
          console.log('Dispatching loginUser with:', { userObj, userRole });
          if (userObj) {
            dispatch(loginUser({ user: { ...userObj, _id: userObj._id || userObj.id }, userType: userRole, token }));
            
            // Skip manual refresh since router will handle verification
            // try {
            //   const { refreshUserProfile } = await import('../../utils/authRefresh');
            //   await refreshUserProfile(dispatch, token);
            // } catch (refreshError) {
            //   console.log('Profile refresh after OTP failed:', refreshError);
            // }
            
            // Reset navigation to home/tab/dashboard based on user role
            if (userRole === 'doctor') {
              console.log('Navigating to DOCTOR_DASHBOARD');
              if (SCREENS.DOCTOR_DASHBOARD) {
                navigation.reset({ index: 0, routes: [{ name: SCREENS.DOCTOR_DASHBOARD }] });
              } else {
                showAlert('Navigation error: SCREENS.DOCTOR_DASHBOARD is not defined.', 'error');
              }
            } else {
              console.log('Navigating to TABS (main home)');
              if (SCREENS.TABS) {
                navigation.reset({ index: 0, routes: [{ name: SCREENS.TABS }] });
              } else {
                showAlert('Navigation error: SCREENS.TABS is not defined.', 'error');
              }
            }
            return;
          } else {
            showAlert('Could not fetch user data after verification (no user object).', 'error');
            return;
          }
        } else {
          showAlert('No token returned after verification. Please ensure the backend verifyEmail endpoint returns a token and user object.', 'error');
          return;
        }
      } else {
        showAlert((data.message || 'Invalid OTP') + '\nRaw: ' + JSON.stringify(data), 'error');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to verify OTP. Please try again.';
      showAlert(msg, 'error');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!isResendDisabled) {
      try {
        const res = await authApi.resendOtp({ email: emailOrPhone });
        const data = res.data || {};
        if (data.success) {
          setResendTimer(30);
          setIsResendDisabled(true);
          setOtp(['', '', '', '', '', '']);
          if (inputRefs[0] && inputRefs[0].current) {
            inputRefs[0].current.focus();
          }
          showAlert(`OTP resent to ${emailOrPhone}`, 'success');
        } else {
          showAlert(data.message || 'Failed to resend OTP', 'error');
        }
      } catch (error) {
        const msg = error.response?.data?.message || error.message || 'Failed to resend OTP.';
        showAlert(msg, 'error');
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: wp(6),
      paddingTop: hp(4),
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: hp(3),
    },
    title: {
      fontSize: RFPercentage(3),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    subtitle: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: theme.secondaryTextColor,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: hp(2),
      gap: wp(2),
    },
    otpInput: {
      width: wp(10),
      height: wp(12),
      borderWidth: 1.5,
      borderColor: theme.primaryColor,
      borderRadius: 10,
      textAlign: 'center',
      fontSize: RFPercentage(2.5),
      color: '#222', // Always dark for visibility
      backgroundColor: '#fff',
      marginHorizontal: wp(1),
    },
    otpInputFilled: {
      borderColor: theme.successColor,
      backgroundColor: '#e6f7ef',
    },
    otpInputFocused: {
      borderColor: theme.primaryColor,
      backgroundColor: '#f0f8ff',
      elevation: 2,
      shadowColor: theme.primaryColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
    },
    button: {
      marginTop: hp(3),
      marginBottom: hp(1.5),
      alignSelf: 'center',
      width: '70%',
      borderRadius: 12,
      backgroundColor: theme.primaryColor,
      paddingVertical: hp(1.2),
      shadowColor: theme.primaryColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 3,
    },
    buttonText: {
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.Bold,
      color: '#fff',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    resendButton: {
      paddingHorizontal: 18,
      paddingVertical: 7,
      borderWidth: 1.5,
      borderColor: theme.primaryColor,
      borderRadius: 8,
      backgroundColor: '#fff',
      marginLeft: 0,
      marginRight: 0,
    },
    resendText: {
      color: theme.primaryColor,
      fontFamily: Fonts.Bold,
      fontSize: RFPercentage(2),
      textAlign: 'center',
    },
    resendTextDisabled: {
      color: theme.disabledColor,
    },
    timerText: {
      marginLeft: 10,
      color: theme.secondaryTextColor,
      fontSize: RFPercentage(2),
    },
    buttonGroup: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: hp(2.5),
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="OTP Verification" />
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Icon name="shield-check" size={48} color={theme.primaryColor} />
        </View>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Please enter the 6-digit code sent to {emailOrPhone}
        </Text>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                otpFocusIndex === index && styles.otpInputFocused,
              ]}
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
              selectionColor={theme.primaryColor}
              onFocus={() => setOtpFocusIndex(index)}
              onBlur={() => setOtpFocusIndex(-1)}
            />
          ))}
        </View>
        <View style={styles.buttonGroup}>
          <CustomButton
            containerStyle={[
              styles.button,
              otp.join('').length !== 6 && styles.buttonDisabled,
            ]}
            text="Verify & Continue"
            textStyle={styles.buttonText}
            onPress={handleVerifyOtp}
            disabled={otp.join('').length !== 6}
          />
          <View style={styles.resendContainer}>
            <TouchableOpacity
              style={[styles.resendButton, isResendDisabled && styles.buttonDisabled]}
              onPress={handleResendOtp}
              disabled={isResendDisabled}>
              <Text
                style={[
                  styles.resendText,
                  isResendDisabled && styles.resendTextDisabled,
                ]}>
                Resend Code
              </Text>
            </TouchableOpacity>
            {isResendDisabled && (
              <Text style={styles.timerText}>
                {`Resend in ${resendTimer}s`}
              </Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OtpScreen;
