import { StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import StackHeader from '../../components/Header/StackHeader';
import { ScrollView } from 'react-native';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../utils/responsive';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import { useSelector } from 'react-redux';
import TxtInput from '../../components/TextInput/Txtinput';
import CustomButton from '../../components/Buttons/customButton';
import { useAlert } from '../../Providers/AlertContext';
// import OTPInputView from '@twotalltotems/react-native-otp-input';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { SCREENS } from '../../Constants/Screens';
const CELL_COUNT = 4;

const ForgetPassword = ({navigation}) => {
  const { isDarkMode } = useSelector((store) => store.theme);
  const { showAlert } = useAlert();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [Email, setEmail] = useState('');
  const [index, setIndex] = useState(0); // 0 = forget password screen, 1 = verify code screen
  const [value, setValue] = useState('');


  // Ref for OTPInputView

  // Validation function
  const validatePhoneNumber = () => {
    if (!Email || Email.length === 0) {
      showAlert('Please Enter Email Address', 'error');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(Email)) {
      showAlert('Please Enter a Valid Email Address', 'error');
      return false;
    }
    return true;
  };
  const validatePassword = () => {
    // Check if password is empty
    if (!password || password.trim().length === 0) {
      showAlert('Please enter a password', 'error');
      return false;
    }
  
    // Check if confirm password is empty
    if (!confirmPassword || confirmPassword.trim().length === 0) {
      showAlert('Please confirm your password', 'error');
      return false;
    }
  
    // Check password length (minimum 8 characters)
    if (password.length < 8) {
      showAlert('Password must be at least 8 characters long', 'error');
      return false;
    }
  
    // Check for at least one uppercase letter, one lowercase letter, and one digit
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      showAlert('Password must include at least one uppercase letter, one lowercase letter, and one number', 'error');
      return false;
    }
  
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'error');
      return false;
    }
  
    // If all validations pass
    return true;
  };
  

  // Handlers
  const handleSendCode = () => {
    if (validatePhoneNumber()) {
      setIndex(1); // Switch to verification screen
    }
  };

  const handleVerifyCode = () => {
    if (!value || value.length === 0) {
      showAlert('Please Enter OTP Code', 'error');
      return;
    }
    console.log('Code verified:', value);
    setIndex(2)

    // Add your verification logic here
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    screenTitleContainer: { paddingTop: scaleHeight(40) },
    screenTitle: {
      fontFamily: Fonts.Bold,
      fontSize: normalizeFontSize(20),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    screenDesc: {
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.Regular,
      fontSize: normalizeFontSize(14),
      textAlign: 'center',
      lineHeight: 20,
      marginTop: 10,
      marginBottom: scaleHeight(50),
    },
    btn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: scaleHeight(13),
      borderRadius: scaleWidth(6),
      justifyContent: 'center',
      alignItems: 'center',
      // marginTop: scaleHeight(30),
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: normalizeFontSize(14),
    },
    underlineStyleBase: {
      color: Colors.Text,
      fontSize: 24,
      fontFamily: Fonts.Inter_Medium,
      width: 48,
      height: 50,
      borderRadius: 30,
      borderWidth: 0,
      backgroundColor: '#F5F6FA',
    },
    underlineStyleHighLighted: {
      borderColor: Colors.primary_color,
      borderRadius: 30,
      borderWidth: 1,
    },
    codeFieldRoot: { marginTop: scaleHeight(20) },
    cell: {
      width: scaleWidth(50),
      height: scaleHeight(60),
      lineHeight: 55,
      fontSize: normalizeFontSize(20),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.white,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      // borderColor: Colors.text,
      borderWidth: 1,
      textAlign: "center",
      borderRadius: 3,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      marginLeft: scaleWidth(10),
    },
    focusCell: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.white,
      borderWidth: 1,
      lineHeight: 55,
      borderRadius: 3,
      width: scaleWidth(50),
      height: scaleHeight(60),
      borderColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
    },
    label: {
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontSize: normalizeFontSize(16),
      fontFamily: Fonts.Regular,
      marginTop: scaleHeight(10),
      textAlign: 'left',
      marginBottom: scaleHeight(5)
    },
  });
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });


  // UI for Forget Password screen
  const ForgetPasswordUI = () => {

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1, alignItems: 'center', }}>
          <View style={styles.screenTitleContainer}>
            <Text style={styles.screenTitle}>Forget Password</Text>
            <Text style={[styles.screenDesc, { width: scaleWidth(300) }]}>
              Please enter your email below. We will send you a 4-digit code to reset your password.
            </Text>
          </View>

          <TxtInput
            rightIcon={'email'}
            rightIconSize={normalizeFontSize(25)}
            rightIconColor={
              isDarkMode
                ? Colors.darkTheme.secondryTextColor
                : Colors.lightTheme.secondryTextColor
            }
            placeholder={'Email Address'}
            style={{ width: scaleWidth(330) }}
            containerStyle={{ paddingHorizontal: scaleWidth(10) }}
            value={Email}
            onChangeText={setEmail}
          />
        </View>

        <View style={{ flex: 1, paddingBottom: scaleHeight(30), paddingHorizontal: scaleWidth(30), }}>
          <CustomButton
            containerStyle={styles.btn}
            text={'Send Code'}
            textStyle={styles.btnText}
            onPress={handleSendCode}
          />
        </View>
      </View>
    )
  }

  // UI for Verify Code screen
  const VerifyCodeUI = () => {

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1, alignItems: 'center' }}>
          <View style={styles.screenTitleContainer}>
            <Text style={styles.screenTitle}>Phone Verification</Text>
            <Text style={[styles.screenDesc, { width: scaleWidth(300) }]}>
              We'll send a code to your email to confirm you own it.
            </Text>
          </View>

          <CodeField
            ref={ref}
            {...props}
            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            )}
          />
        </View>

        <View style={{ flex: 1, paddingHorizontal: scaleWidth(30), justifyContent: 'flex-start' }}>
          <CustomButton
            containerStyle={styles.btn}
            text={'Verify Code'}
            textStyle={styles.btnText}
            onPress={handleVerifyCode}
          />
        </View>
      </View>
    )
  }
  const handleResetPassword = () => {
    if (validatePassword()) {
      showAlert('Password Reset Successfully', 'success');
      setTimeout(() => {
        navigation.navigate(SCREENS.LOGIN)
      }, 2500);
     
    }
  }

  const ResetPassword = () => {

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1, alignItems: 'center' }}>
          <Text style={styles.screenTitle}>Set Password</Text>
          <Text style={[styles.screenDesc, { width: scaleWidth(300) }]}>
            Your new password must be different from previously used password
          </Text>
          <View>
            <Text style={styles.label} >Password</Text>
            <TxtInput placeholder={'Enter Password'} style={{ width: scaleWidth(330) }} inputStyle={{}} value={password} onChangeText={setPassword} secureTextEntry={true} containerStyle={{ paddingHorizontal: scaleWidth(10) }} />
            <Text style={styles.label} >Confirm Password</Text>
            <TxtInput placeholder={'Confirm Password'} style={{ width: scaleWidth(330) }} inputStyle={{}} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} containerStyle={{ paddingHorizontal: scaleWidth(10) }} />
          </View>



        </View>

        <View style={{ flex: 1, paddingHorizontal: scaleWidth(30), justifyContent: 'flex-start' }}>
          <CustomButton
            containerStyle={styles.btn}
            text={'Create New Password'}
            textStyle={styles.btnText}
            onPress={handleResetPassword}
          />
        </View>
      </View>
    )
  }

  const renderView = () => {
    switch (index) {
      case 1:
        return (
          VerifyCodeUI()
        );
      case 2:
        return (
          ResetPassword()
        );

      default:
        return (
          ForgetPasswordUI()
        );
    }

  }


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <StackHeader title={''} headerView={{ marginLeft: scaleWidth(20) }} />
        {renderView()}
      </ScrollView>
    </View>
  );
};

export default ForgetPassword;
