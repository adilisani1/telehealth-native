import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useSelector} from 'react-redux';
import {Colors} from '../../Constants/themeColors';
import StackHeader from '../../components/Header/StackHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import {SCREENS} from '../../Constants/Screens';
import {Fonts} from '../../Constants/Fonts';

const DoctorPaymentOptions = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);

  const paymentOptions = [
    {
      category: 'Bank Account',
      options: [
        {
          id: 1,
          name: 'Add Bank Account',
          icon: 'bank', 
        },
      ],
    },
   
    {
      category: 'Withdraw',
      options: [
        {
          id: 3,
          name: 'Withdraw Funds',
          icon: 'cash',
        },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp('5%'),
      paddingVertical: hp('2%'),
    },
    section: {
      marginBottom: hp('3%'),
    },
    category: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1.5%'),
    },
    option: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp('2%'),
      padding: wp('4%'),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp('1%'),
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Thin,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    addText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
  });

  return (
    <View style={styles.container}>
      <StackHeader
        title={'Doctor Payment Options'}
        headerStyle={{paddingLeft: 0, paddingBottom: hp(2)}}
      />
      {paymentOptions.map(section => (
        <View key={section.category} style={styles.section}>
          <Text style={styles.category}>{section.category}</Text>
          {section.options.map(option => (
            <View key={option.id} style={styles.option}>
              <View style={styles.optionContent}>
                <Icon
                  name={option.icon}
                  size={20}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.primaryColor
                      : Colors.lightTheme.primaryColor
                  }
                  style={{marginRight: wp(2)}}
                />
                <Text style={styles.optionText}>{option.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  /* add navigation or function here */
                }}>
                <Text style={styles.addText}>Select</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default DoctorPaymentOptions;
