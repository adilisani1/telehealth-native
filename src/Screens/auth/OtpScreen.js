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

const OtpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {isDarkMode} = useSelector(store => store.theme);
  const {showAlert} = useAlert();

  const {emailOrPhone, userType, userData} = route.params || {
    emailOrPhone: 'user@example.com',
    userType: 'patient',
  };

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

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
      // Use your actual API endpoint
      const response = await fetch(
        'http://localhost:5000/api/auth/verify-email',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email: emailOrPhone, // Your backend expects email
            otp: otpCode,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showAlert('Email verified successfully!', 'success');
        setTimeout(() => {
          if (userType === 'doctor') {
            navigation.navigate(SCREENS.PROGRESS);
          } else {
            navigation.navigate(SCREENS.DASHBOARD);
          }
        }, 1500);
      } else {
        showAlert(data.message || 'Invalid OTP', 'error');
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      showAlert('Failed to verify OTP. Please try again.', 'error');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!isResendDisabled) {
      try {
        // You might need to create a resend endpoint or call register again
        const response = await fetch(
          'http://localhost:5000/api/auth/register',
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData), // Resend with original user data
          },
        );

        const data = await response.json();

        if (data.success) {
          setResendTimer(30);
          setIsResendDisabled(true);
          setOtp(['', '', '', '', '', '']);
          inputRefs[0].current.focus();
          showAlert(`OTP resent to ${emailOrPhone}`, 'success');
        } else {
          showAlert(data.message || 'Failed to resend OTP', 'error');
        }
      } catch (error) {
        console.error('Resend OTP Error:', error);
        showAlert('Failed to resend OTP.', 'error');
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
      color: theme.secondryTextColor,
      textAlign: 'center',
      marginBottom: hp(4),
      lineHeight: RFPercentage(2.8),
    },
    phoneNumber: {
      color: theme.primaryColor,
      fontFamily: Fonts.Medium,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(4),
      paddingHorizontal: wp(4),
    },
    otpInput: {
      width: wp(12),
      height: wp(12),
      borderWidth: 2,
      borderColor: theme.BorderGrayColor,
      borderRadius: wp(2),
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Bold,
      textAlign: 'center',
      backgroundColor: theme.secondryColor,
      color: theme.primaryTextColor,
    },
    otpInputFilled: {
      borderColor: theme.primaryColor,
      backgroundColor: theme.primaryColor + '20',
    },
    button: {
      backgroundColor: theme.primaryBtn.BtnColor,
      paddingVertical: hp(2),
      borderRadius: wp(2),
      alignItems: 'center',
      marginBottom: hp(3),
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.primaryBtn.TextColor,
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
    },
    resendContainer: {
      alignItems: 'center',
    },
    resendButton: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    resendText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Medium,
      color: theme.primaryColor,
    },
    resendTextDisabled: {
      color: theme.secondryTextColor,
    },
    timerText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: theme.secondryTextColor,
      marginTop: hp(1),
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Verify OTP" onBackPress={() => navigation.goBack()} />

      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Icon
            name="message-text-outline"
            size={RFPercentage(8)}
            color={theme.primaryColor}
          />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit verification code sent to{'\n'}
          <Text style={styles.phoneNumber}>{emailOrPhone}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
              selectionColor={theme.primaryColor}
            />
          ))}
        </View>

        <CustomButton
          containerStyle={[
            styles.button,
            otp.join('').length !== 6 && styles.buttonDisabled,
          ]}
          text="Get Started"
          textStyle={styles.buttonText}
          onPress={handleVerifyOtp}
          disabled={otp.join('').length !== 6}
        />

        <View style={styles.resendContainer}>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendOtp}
            disabled={isResendDisabled}>
            <Text
              style={[
                styles.resendText,
                isResendDisabled && styles.resendTextDisabled,
              ]}>
              {isResendDisabled ? 'Resend Code' : 'Resend Code'}
            </Text>
          </TouchableOpacity>

          {isResendDisabled && (
            <Text style={styles.timerText}>
              Resend available in {resendTimer}s
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OtpScreen;
