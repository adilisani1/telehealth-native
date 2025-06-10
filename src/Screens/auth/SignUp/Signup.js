import React, { useState, useCallback } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors } from '../../../Constants/themeColors';
import { useAlert } from '../../../Providers/AlertContext';
import { Fonts } from '../../../Constants/Fonts';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../../../utils/responsive';
import StackHeader from '../../../components/Header/StackHeader';
import { Svgs } from '../../../assets/Svgs/Svg';
import TxtInput from '../../../components/TextInput/Txtinput';
import CustomButton from '../../../components/Buttons/customButton';
import { SCREENS } from '../../../Constants/Screens';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CustomDropDown from '../../../components/DropDown/CustomDropDown';
import { Images } from '../../../assets/Images/images';
import CameraBottomSheet from '../../../components/BottomSheets/CameraBottomSheet';
import { useRef } from 'react';
const CompleteProfile = React.memo(({ name, setName, gender, setGender, email, setEmail, password, setPassword, isDarkMode, handleNext, styles, navigation, image, cameraSheet_ref }) => {
  const Genders = [
    'Male', 'Female', 'Others', 'Preferred not to say',
  ];


  return (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.heading}>Complete your Profile</Text>
      <Text style={styles.subText}>
        Don't worry only you can see your personal info{'\n'}no one else will be able to see it
      </Text>
      <View style={styles.profileContainer}>
        {
          image?  <Image
          source={{ uri: image.path }} // Replace with actual image
          style={styles.profileImage}
        />:
        <Image
          source={Images.profile} // Replace with actual image
          style={styles.profileImage}
        />

        }
        
        
        <TouchableOpacity style={styles.editIcon} onPress={()=> cameraSheet_ref.current.open()} >
          <Icon name="edit" size={RFPercentage(2.5)} color={isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor} />
        </TouchableOpacity>
      </View>
      <TxtInput
        placeholder={'Full Name'}
        style={{ width: wp(88), marginBottom: hp(2.3) }}
        containerStyle={{ paddingHorizontal: wp(3) }}
        value={name}
        onChangeText={setName}
      />
      <CustomDropDown
        data={Genders}
        selectedValue={gender}
        onValueChange={setGender}
        placeholder="Select Gender..."
        textStyle={{ color: gender ? isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor : isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor }}
      />
      <TxtInput
        placeholder={'Email'}
        style={{ width: wp(88), marginVertical: hp(2.3) }}
        containerStyle={{ paddingHorizontal: wp(3) }}
        value={email}
        onChangeText={setEmail}
      />
      <TxtInput
        placeholder={'Password'}
        style={{ width: wp(88), marginBottom: hp(2.3) }}
        containerStyle={{ paddingHorizontal: wp(3) }}
        value={password}
        secureTextEntry={true}
        onChangeText={setPassword}
      />
      <Text style={styles.subText}>
        By tapping "Next" you agree to our{' '}
        <Text style={{ color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor }}>
          Terms & Conditions
        </Text>{' '}
        and{' '}
        <Text style={{ color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor }}>
          Privacy Policy.
        </Text>
      </Text>
      <CustomButton
        containerStyle={styles.btn}
        text={'Next'}
        textStyle={[
          styles.btnText,
          { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor },
        ]}
        onPress={handleNext}
      />
      {/* <Text style={styles.OrTxt}>Or sign up with</Text> */}
      {/* <View style={[styles.rowView, { height: scaleHeight(40) }]}>
        <CustomButton svg={<Svgs.Facebook height={scaleHeight(40)} width={scaleWidth(40)} />} />
        <CustomButton svg={<Svgs.Google height={scaleHeight(40)} width={scaleWidth(40)} />} />
      </View> */}
      <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: hp(2.3) }} >
        <Text style={[styles.OrTxt, { textAlign: 'center' }]}>
          Already have an account?
        </Text>
        <CustomButton
          text={' Sign In'}
          onPress={() => navigation.navigate(SCREENS.LOGIN)}
          textStyle={[styles.OrTxt, { textAlign: 'center', color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor }]}
        />
      </View>
    </ScrollView>
  );
});

const SignUp1 = React.memo(({ phone_no, setPhone_no, isDarkMode, handleSignUp, navigation, styles }) => {
  return (
    <View style={styles.contentContainer}>
      <Text style={[styles.heading, { marginTop: hp(4) }]}>Enter Your Phone Number</Text>
      <TxtInput
        rightIcon={'phone'}
        rightIconSize={normalizeFontSize(25)}
        rightIconColor={isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor}
        placeholder={'Phone Number'}
        style={{ width: wp(88) }}
        containerStyle={{ paddingHorizontal: wp(3) }}
        value={phone_no}
        onChangeText={setPhone_no}
      />
      <CustomButton
        containerStyle={styles.btn}
        text={'Sign Up'}
        textStyle={[
          styles.btnText,
          { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor },
        ]}
        onPress={handleSignUp}
      />
      <Text style={styles.OrTxt}>Or sign up with</Text>
      {/* <View style={[styles.rowView, { height: scaleHeight(40) }]}> */}
      {/* <CustomButton svg={<Svgs.Facebook height={scaleHeight(40)} width={scaleWidth(40)} />} /> */}
      <CustomButton svg={<Svgs.Google height={scaleHeight(40)} width={scaleWidth(40)} />} containerStyle={{ alignSelf: 'center' }} />
      {/* </View> */}
      <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: hp(2.3) }} >
        <Text style={[styles.OrTxt, { textAlign: 'center' }]}>
          Already have an account?
        </Text>
        <CustomButton
          text={' Sign In'}
          onPress={() => navigation.navigate(SCREENS.LOGIN)}
          textStyle={[styles.OrTxt, { textAlign: 'center', color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor }]}
        />
      </View>
    </View>
  );
});

const Signup = ({ navigation }) => {
  const { isDarkMode } = useSelector((store) => store.theme);
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone_no, setPhone_no] = useState('');
  const [index, setIndex] = useState(0);
  const [image, setImage] = useState('');

  const cameraSheet_ref = useRef()



  const validate = useCallback(() => {

    if (!name || name.length === 0) {
      showAlert('Please Enter Name', 'error');
      return false;
    } else if (name.length < 3) {
      showAlert('Name must be at least 3 characters long', 'error');
      return false;
    }
    if (!gender || gender.length === 0) {
      showAlert('Please Enter Gender', 'error');
      return false;
    }
    if (!email || email.length === 0) {
      showAlert('Please Enter Email Address', 'error');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      showAlert('Please Enter a Valid Email Address', 'error');
      return false;
    }
    if (!password || password.length === 0) {
      showAlert('Please Enter Password', 'error');
      return false;
    } else if (password.length < 8) {
      showAlert('Password must be at least 8 characters long', 'error');
      return false;
    }


    return true;
  }, [name, gender, email, password, showAlert]);
  const validate2 = () => {
    if (!phone_no || phone_no.trim().length === 0) {
      showAlert('Please enter a phone number', 'error');
      return false;
    }

    // Updated regex for 10-15 digits
    if (!/^\d{10,15}$/.test(phone_no)) {
      showAlert('Please enter a valid phone number (10-15 digits)', 'error');
      return false;
    }

    // If all validations pass
    return true;
  };


  const handleNext = useCallback(() => {
    console.log('handleNext');


    if (validate()) {
      setIndex(1);
    }


  }, [validate]);


  const handleSignUp = useCallback(() => {
    showAlert('Signed Up Successfully', 'success');
    setTimeout(() => {
      navigation.navigate(SCREENS.PROGRESS)
    }, 2500);
  }, [])
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
      // alignItems: 'center',
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'space-between',
      // backgroundColor: 'green',
      height: hp(2.3),
      width: wp(35)

    },
    profileContainer: {
      alignItems: 'center',
      marginVertical: hp('3%'),

    },
    profileImage: {
      width: wp('25%'),
      height: wp('25%'),
      borderRadius: wp('12.5%'),
      marginBottom: hp('1%'),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColors
    },
    editIcon: {
      position: 'absolute',
      bottom: 0,
      right: wp('30%'),
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      borderRadius: wp('5%'),
      padding: wp('2%'),
      borderWidth: wp(0.5),
      borderColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor
    },
    seprator: {
      height: hp(0.4),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.BorderGrayColor,
      width: wp(14),
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: wp(5.7),
    },
    heading: {
      fontSize: RFPercentage(2.5),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.Bold,
      marginTop: RFPercentage(1.6),
      marginBottom: RFPercentage(1.6),
    },
    subText: {
      fontSize: RFPercentage(1.7),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    btn: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.7),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: hp(4),
      // borderColor:  isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      // borderWidth: scaleHeight(2)
    },
    btnText: {
      color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: normalizeFontSize(14),

    },
    OrTxt: {
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      textAlign: 'center',
      marginTop: scaleHeight(15),
      marginBottom: scaleHeight(15),

    },
    signInText: {
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      fontSize: normalizeFontSize(14),
      fontFamily: Fonts.Regular,
      // paddingTop:  RFPercentage(1.6)
    },

  })

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title={'Sign Up'} headerView={{ marginLeft: scaleWidth(20) }} headerStyle={{ paddingLeft: 0 }} onBackPress={()=> index === 1? setIndex(0): navigation.goBack() } />
      <View style={styles.rowView}>
        <TouchableOpacity
          style={[
            styles.seprator,
            index === 0 && { backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor },
          ]}
          onPress={() => setIndex(0)}
        />
        <TouchableOpacity
          style={[
            styles.seprator,
            index === 1 && { backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor },
          ]}
          onPress={() => setIndex(1)}
        />
      </View>
      {index === 0 ? (
        <CompleteProfile
          name={name}
          setName={setName}
          gender={gender}
          setGender={setGender}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isDarkMode={isDarkMode}
          handleNext={handleNext}
          styles={styles}
          navigation={navigation}
          image={image}
          cameraSheet_ref = {cameraSheet_ref}

        />
      ) : (
        <SignUp1
          phone_no={phone_no}
          setPhone_no={setPhone_no}
          isDarkMode={isDarkMode}
          handleSignUp={handleSignUp}
          navigation={navigation}
          styles={styles}
        />
      )}



      <CameraBottomSheet
        refRBSheet={cameraSheet_ref}
        onPick = {(image) => setImage(image)}
        // onCameraPick={img => {
        //   img && handleUploadImage(img);
        // }}
        // onGalleryPick={img => {
        //   img && handleUploadImage(img);
        // }}
      />
    </SafeAreaView>
  );
};

export default Signup;
