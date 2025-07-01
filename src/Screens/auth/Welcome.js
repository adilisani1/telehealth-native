// import { StyleSheet, Text, View, Image } from 'react-native'
// import React from 'react'
// import { Svgs } from '../../assets/Svgs/Svg'
// import { useDispatch, useSelector } from 'react-redux';
// import { SafeAreaView } from 'react-native';
// import CustomLayout from '../../components/CustomLayout'
// import { Colors } from '../../Constants/themeColors';
// // import { normalizeFontSize, scaleHeight, scaleWidth } from '../../utils/responsive';
// import { Fonts } from '../../Constants/Fonts';
// import CustomButton from '../../components/Buttons/customButton';
// import { setDarkMode } from '../../redux/Slices/Theme';
// import { SCREENS } from '../../Constants/Screens';
// import { RFPercentage } from 'react-native-responsive-fontsize';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import {
//   scaleHeight,
//   scaleWidth,
//   normalizeFontSize,
// } from '../../utils/responsive';

// import {Images} from '../../assets/Images/images'
// const Welcome = ({navigation}) => {
//   const { isDarkMode } = useSelector(store => store.theme);
//   const dispatch = useDispatch()
//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: isDarkMode? Colors.darkTheme.backgroundColor: Colors.lightTheme.backgroundColor,
//       justifyContent: 'center'
//     },
//     contentContainer:{
//       alignItems: 'center',
//     },
//     heading:{
//       color: isDarkMode ? Colors.darkTheme.primaryTextColor :Colors.lightTheme.primaryTextColor,
//       fontSize : RFPercentage(2.5),
//       fontFamily: Fonts.Medium,
//       // width: wp(100),
//       textAlign: 'center',
//       letterSpacing: 1
//     },
//     highlightedText:{
//       color:isDarkMode? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor
//     },
//     subHeading:{
//       color: isDarkMode? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
//       fontSize : RFPercentage(1.6),
//       fontFamily: Fonts.Regular,
//       textAlign: 'center',
//       width: wp(100),
//       marginVertical: hp(2.1)
//     },
//  btn: {
//       backgroundColor: isDarkMode? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
//       paddingVertical: hp(1.7),
//       borderRadius: wp(2),
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     btnText:{
//       color: isDarkMode? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,
//       fontFamily: Fonts.Bold,
//       fontSize: RFPercentage(1.9),
//     }

//   })
//   return (
//     <SafeAreaView style={styles.container} >
//       <View style={styles.contentContainer}  >
//         {/* <Svgs.Welcome height={hp(55)} width={wp(150)} /> */}
//        <Image source={Images.welcomeAppointment} style={{ width: scaleWidth(300), height: scaleHeight(300) }}/>

//       <Text style={styles.heading} >Your <Text style={styles.highlightedText} >Everyday Doctor</Text> Appointment Medical App</Text>
//       <Text style={styles.subHeading} >Talk to doctors, buy medications or request an ambulance with ease.</Text>
//       </View>
//       <View style={{paddingHorizontal: wp(7),}}>
//       <CustomButton containerStyle={styles.btn} text={'Sign Up'} textStyle={styles.btnText} onPress={()=>navigation.navigate(SCREENS.SIGNUP) }   />
//       <CustomButton containerStyle={[styles.btn,{marginTop: hp(2)}]}  text={'Login '} textStyle={[styles.btnText, {color :isDarkMode? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryTextColor}]} mode={true} borderColor={Colors.lightTheme.BorderGrayColor} onPress={()=>navigation.navigate(SCREENS.LOGIN)} />
//       </View>
//     </SafeAreaView>
//   )
// }

// export default Welcome

import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useState} from 'react';
import {Svgs} from '../../assets/Svgs/Svg';
import {useDispatch, useSelector} from 'react-redux';
import {SafeAreaView} from 'react-native';
import CustomLayout from '../../components/CustomLayout';
import {Colors} from '../../Constants/themeColors';
import {Fonts} from '../../Constants/Fonts';
import CustomButton from '../../components/Buttons/customButton';
import {setDarkMode} from '../../redux/Slices/Theme';
import {SCREENS} from '../../Constants/Screens';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  scaleHeight,
  scaleWidth,
  normalizeFontSize,
} from '../../utils/responsive';
import {Images} from '../../assets/Images/images';
import {setUserType} from '../../redux/Slices/authSlice';

const Welcome = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const dispatch = useDispatch();
  const [selectedUserType, setSelectedUserType] = useState('patient'); // Default to patient

  const handleUserTypeSelection = userType => {
    setSelectedUserType(userType);
    dispatch(setUserType(userType));
  };

  const handleSignUp = () => {
    navigation.navigate(SCREENS.SIGNUP, {userType: selectedUserType});
  };

  const handleLogin = () => {
    navigation.navigate(SCREENS.LOGIN, {userType: selectedUserType});
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      justifyContent: 'center',
    },
    contentContainer: {
      alignItems: 'center',
    },
    heading: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Medium,
      textAlign: 'center',
      letterSpacing: 1,
    },
    highlightedText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    subHeading: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
      textAlign: 'center',
      width: wp(100),
      marginVertical: hp(2.1),
    },
    userTypeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(3),
      paddingHorizontal: wp(7),
    },
    userTypeButton: {
      flex: 0.48,
      paddingVertical: hp(2),
      borderRadius: wp(2),
      alignItems: 'center',
      borderWidth: 2,
    },
    selectedUserType: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    unselectedUserType: {
      backgroundColor: 'transparent',
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    userTypeText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Medium,
    },
    selectedUserTypeText: {
      color: Colors.white,
    },
    unselectedUserTypeText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    btn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.7),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: RFPercentage(1.9),
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          source={Images.welcomeAppointment}
          style={{width: scaleWidth(300), height: scaleHeight(300)}}
        />

        <Text style={styles.heading}>
          Your <Text style={styles.highlightedText}>Everyday Doctor</Text>{' '}
          Appointment Medical App
        </Text>
        <Text style={styles.subHeading}>
          Talk to doctors, buy medications or request an ambulance with ease.
        </Text>

        {/* <Text
          style={[
            styles.heading,
            {fontSize: RFPercentage(2.2), marginBottom: hp(2)},
          ]}>
          I am a:
        </Text> */}
        {/* User Type Selection */}
        <View style={styles.userTypeContainer}>
          <CustomButton
            containerStyle={[
              styles.userTypeButton,
              selectedUserType === 'patient'
                ? styles.selectedUserType
                : styles.unselectedUserType,
            ]}
            text="Patient"
            textStyle={[
              styles.userTypeText,
              selectedUserType === 'patient'
                ? styles.selectedUserTypeText
                : styles.unselectedUserTypeText,
            ]}
            onPress={() => handleUserTypeSelection('patient')}
          />
          <CustomButton
            containerStyle={[
              styles.userTypeButton,
              selectedUserType === 'doctor'
                ? styles.selectedUserType
                : styles.unselectedUserType,
            ]}
            text="Doctor"
            textStyle={[
              styles.userTypeText,
              selectedUserType === 'doctor'
                ? styles.selectedUserTypeText
                : styles.unselectedUserTypeText,
            ]}
            onPress={() => handleUserTypeSelection('doctor')}
          />
        </View>
      </View>

      <View style={{paddingHorizontal: wp(7)}}>
        <CustomButton
          containerStyle={styles.btn}
          text={'Sign Up'}
          textStyle={styles.btnText}
          onPress={handleSignUp}
        />
        <CustomButton
          containerStyle={[styles.btn, {marginTop: hp(2)}]}
          text={'Login'}
          textStyle={[
            styles.btnText,
            {
              color: isDarkMode
                ? Colors.darkTheme.primaryBtn.TextColor
                : Colors.lightTheme.primaryTextColor,
            },
          ]}
          mode={true}
          borderColor={Colors.lightTheme.BorderGrayColor}
          onPress={handleLogin}
        />
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
