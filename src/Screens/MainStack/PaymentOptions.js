import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import StackHeader from '../../components/Header/StackHeader';
import  Icon  from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import { SCREENS } from '../../Constants/Screens';
import { Fonts } from '../../Constants/Fonts';
const PaymentOptions = ({navigation}) => {
  const { isDarkMode } = useSelector(store => store.theme);

  const paymentOptions = [
    {
      category: 'Credit & Debit Card',
      options: [
        {
          id: 1,
          name: 'Add New Card',
          icon: 'credit-card', // Replace with your local icon path
        },
      ],
    },
//    {
//      category: 'Crypto Payment',
//      options: [
//        {
//          id: 2,
//          name: 'Bitcoin Payment',
//          icon: 'bitcoin',
//        },
//      ],
//    },
    {
      category: 'More Payment Options',
      options: [
        {
          id: 3,
          name: 'Paypal',
         icon: 'paypal'
        },
//        {
//          id: 4,
//          name: 'Apple Pay',
//          icon: 'apple-pay',
//        },
      ],
    },
  ];


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp('5%'),
      paddingVertical: hp('2%'),
    },

    section: {
      marginBottom: hp('3%'),
    },
    category: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1.5%'),
    },
    option: {
      backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.secondryColor,
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
    icon: {
      width: wp('8%'),
      height: wp('8%'),
      resizeMode: 'contain',
      marginRight: wp('4%'),
    },
    optionText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Thin,
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.secondryTextColor,
    },
    addText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor,
    },
  });
  return (
    <View style={styles.container}>
      <StackHeader title={'Payment Options'} headerStyle={{ paddingLeft: 0, paddingBottom: hp(2) }} />

      {paymentOptions.map((section) => (
        <View key={section.category} style={styles.section}>
          <Text style={styles.category}>{section.category}</Text>
          {section.options.map((option) => (
            <View key={option.id} style={styles.option}>
              <View style={styles.optionContent}>
                {/* <Image source={option.icon} style={styles.icon} /> */}
                {
                  section.category === 'More Payment Options' ? <FontAwesome5Pro name={option.icon} size={option.icon === 'apple-pay' ?20 : 20 } style={{marginRight: wp(2)}} color={ option.icon === 'paypal' ?  '#003087': 'black'} /> : <Icon name={option.icon} size={20} color={option.icon === 'bitcoin' ? '#F7931A' : isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor} style={{marginRight: wp(2)}} />
                }

                <Text style={styles.optionText}>{option.name}</Text>
              </View>
              <TouchableOpacity onPress={()=>  navigation.navigate(SCREENS.ADDCARD)} >
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};



export default PaymentOptions;