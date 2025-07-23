'use client';

import {useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SCREENS} from '../../../Constants/Screens';
import {Colors} from '../../../Constants/themeColors';
import {useDispatch, useSelector} from 'react-redux';
import StackHeader from '../../../components/Header/StackHeader';
import {Fonts} from '../../../Constants/Fonts';
import RBSheetConfirmation from '../../../components/BottomSheets/RBSheetConfirmation';
import {Svgs} from '../../../assets/Svgs/Svg';
import {Images} from '../../../assets/Images/images';
import {useLogout} from '../../../utils/authUtils'; // Use logout with navigation

const Profile = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {User} = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const logout_Ref = useRef();
  const delete_Ref = useRef();
  const logout = useLogout(); // Use logout with navigation

  const handleLogout = () => {
    logout_Ref.current.close();
    logout(navigation); // Pass navigation to logout
  };

  const handleDeleteAccount = () => {
    delete_Ref.current.close();
    // Add delete account logic here
    logout(navigation); // Pass navigation to logout
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: wp('4%'),
    },
    headerTitle: {
      fontSize: RFPercentage(2.8),
      fontWeight: 'bold',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginLeft: wp('4%'),
    },
    profileContainer: {
      alignItems: 'center',
    },
    profileImage: {
      width: wp('25%'),
      height: wp('25%'),
      borderRadius: wp('12.5%'),
      marginBottom: hp('1%'),
    },
    editIcon: {
      position: 'absolute',
      bottom: wp(10.2),
      right: wp('33%'),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderRadius: wp('5%'),
      padding: wp('2%'),
      borderWidth: wp(0.5),
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
    },
    profileName: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Bold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp('1%'),
    },
    optionsList: {
      marginTop: hp('3%'),
      paddingHorizontal: wp('4%'),
      paddingBottom: hp(3),
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp('2%'),
      borderBottomWidth: wp(0.5),
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      marginLeft: wp(2),
    },
    optionIcon: {
      marginRight: wp('4%'),
    },
    optionText: {
      flex: 1,
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.Regular,
    },
  });

  const renderOption = ({item, index}) => (
    <TouchableOpacity
      style={styles.optionContainer}
      onPress={() =>
        item.button ? item.action() : navigation.navigate(item.screen)
      }>
      {item.id === '6' ? (
        <MaterialCommunityIcons
          name={item.icon}
          size={RFPercentage(3.2)}
          color={
            isDarkMode
              ? Colors.darkTheme.primaryColor
              : Colors.lightTheme.primaryColor
          }
          style={styles.optionIcon}
        />
      ) : (
        <Icon
          name={item.icon}
          size={RFPercentage(3.2)}
          color={
            isDarkMode
              ? Colors.darkTheme.primaryColor
              : Colors.lightTheme.primaryColor
          }
          style={styles.optionIcon}
        />
      )}
      <Text style={styles.optionText}>{item.name}</Text>
      <Icon
        name="chevron-right"
        size={RFPercentage(3)}
        color={
          isDarkMode
            ? Colors.darkTheme.primaryColor
            : Colors.lightTheme.primaryColor
        }
      />
    </TouchableOpacity>
  );

  const profileOptions = [
    {
      id: '1',
      name: 'Profile',
      icon: 'person-outline',
      screen: SCREENS.UPDATEPROFILE,
    },
    {
      id: '2',
      name: 'Favorites',
      icon: 'favorite-outline',
      screen: SCREENS.FAVORITES,
    },
    {
      id: '3',
      name: 'Help Center',
      icon: 'help-outline',
      screen: SCREENS.HELPCENTER,
    },
    {
      id: '4',
      name: 'Privacy Policy',
      icon: 'security',
      screen: SCREENS.TERMSANDCONDITION,
    },
    {
      id: '5',
      name: 'App Preference',
      icon: 'settings',
      screen: SCREENS.NOTIFICATIONSETTINGS,
    },
    {
      id: '7',
      name: 'Payment Options',
      icon: 'payment',
      screen: SCREENS.PAYMENTOPTION,
    },
    {
      id: '8',
      name: 'Password Manager',
      icon: 'lock-outline',
      screen: SCREENS.PASSWORDMANAGER,
    },
    {
      id: '9',
      name: 'Log out',
      icon: 'logout',
      button: true,
      action: () => logout_Ref.current.open(),
    },
    {
      id: '10',
      name: 'Delete Account',
      icon: 'delete-outline',
      button: true,
      action: () => delete_Ref.current.open(),
    },
  ];

  return (
    <View style={styles.container}>
      <StackHeader title={'Profile'} />

      <View style={styles.profileContainer}>
        <Image source={Images.dr2} style={styles.profileImage} />
        <TouchableOpacity style={styles.editIcon}>
          <Icon name="edit" size={RFPercentage(2)} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.profileName}>
          {User?.name || 'Adewole Abdulazeez'}
        </Text>
      </View>

      <FlatList
        data={profileOptions}
        keyExtractor={item => item.id}
        renderItem={renderOption}
        contentContainerStyle={styles.optionsList}
      />

      <RBSheetConfirmation
        tittleStyle={{fontFamily: Fonts.Medium}}
        descriptionStyle={{
          borderTopColor: isDarkMode
            ? Colors.darkTheme.BorderGrayColor
            : Colors.lightTheme.BorderGrayColor,
          borderTopWidth: 1,
          paddingTop: hp(2),
        }}
        refRBSheet={logout_Ref}
        title={'Logout'}
        cancelText={'Cancel'}
        okText={'Yes, Logout'}
        height={hp(22)}
        description={'Are you sure you want to logout?'}
        onCancel={() => logout_Ref.current.close()}
        onOk={handleLogout}
      />

      <RBSheetConfirmation
        component={<Svgs.DeleteMSVG height={hp(10)} />}
        tittleStyle={{fontFamily: Fonts.Medium}}
        descriptionStyle={{
          borderTopColor: Colors.darkTheme.BorderGrayColor,
          borderTopWidth: 1,
          paddingTop: hp(2),
        }}
        refRBSheet={delete_Ref}
        title={'Delete'}
        cancelText={'Cancel'}
        okText={'Yes, Delete'}
        okBtnColor={'#F21515'}
        height={hp(33)}
        description={'Are you sure you want to Delete Your Account?'}
        onCancel={() => delete_Ref.current.close()}
        onOk={handleDeleteAccount}
      />
    </View>
  );
};

export default Profile;