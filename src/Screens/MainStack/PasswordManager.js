import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import StackHeader from '../../components/Header/StackHeader'
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { SCREENS } from '../../Constants/Screens';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Fonts } from '../../Constants/Fonts';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import TxtInput from '../../components/TextInput/Txtinput';
import CustomButton from '../../components/Buttons/customButton';
import { useAlert } from '../../Providers/AlertContext';

const PasswordManager = ({navigation}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
    const { showAlert } = useAlert();




  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
      alignItems: 'center',
    },
    label: {
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      marginTop: hp(1),
      textAlign: 'left',
      marginBottom: hp(0.5)
    },
    btn: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(2),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: hp(3),
      // borderColor:  isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      // borderWidth: hp(2)
    },
    btnText: {
      color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: RFPercentage(2),

    },
    forgetText: {
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
      marginTop: hp(1),
      textAlign: 'right',
      textDecorationLine: 'underline'
    },
  })




  return (
    <View style={styles.container} >
       <StackHeader title={'Password Manager'}/>
      <View>
        {/* <Text style={styles.label} >Current Password</Text>
        <TxtInput placeholder={'Current Password'} style={{ width: wp(90) }} value={currentPassword} secureTextEntry={true} onChangeText={setCurrentPassword} containerStyle={{ paddingHorizontal: wp(2) }} />
        <CustomButton text={'Forget Password?'} textStyle={styles.forgetText} containerStyle={{ width: wp(40), alignSelf: 'flex-end' }} onPress={() => navigation.navigate(SCREENS.FORGET)} /> */}
        <Text style={styles.label} >Password</Text>
        <TxtInput placeholder={'New Password'} style={{ width: wp(90) }} inputStyle={{}} value={newPassword} onChangeText={setNewPassword} secureTextEntry={true} containerStyle={{ paddingHorizontal: wp(2) }} />
        <Text style={[styles.label, {marginTop: hp(2)}]} >Confirm New Password</Text>
        <TxtInput placeholder={'Confirm Password'} style={{ width: wp(90) }} inputStyle={{}} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} containerStyle={{ paddingHorizontal: wp(2) }} />
        <CustomButton containerStyle={styles.btn} text={'Change Password'} textStyle={[styles.btnText, {color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,}]} onPress={()=> {
           showAlert('Password Updated Successfully', 'success');
           setTimeout(() => {
             navigation.goBack()
           }, 2500);
        }} />

      </View>

    </View>
  )
}

export default PasswordManager

