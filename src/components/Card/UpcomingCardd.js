import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
// import Image from '../../assets/Images/PngImage.png';

const UpcomingCard = () => {
    const { isDarkMode } = useSelector(store => store.theme);


    const styles = StyleSheet.create({
        cardContainer: {
          flexDirection: 'row',
          backgroundColor: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor, // Match the green background color
          borderRadius: wp(3),
          padding: wp(4),
          elevation: 2, // For shadow on Android
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        textContainer: {
          flex: 1,
        },
        doctorName: {
          fontSize: RFPercentage(2.4),
          color: isDarkMode? Colors.lightTheme.primaryTextColor: Colors.white,
          fontFamily: Fonts.Bold
        },
        specialization: {
          fontSize: RFPercentage(2),
          color: isDarkMode? Colors.lightTheme.primaryTextColor: Colors.white,
          fontFamily: Fonts.Medium,
          marginVertical: hp(0.5),
        },
        scheduleContainer: {
          backgroundColor: Colors.white,
          borderRadius: wp(2),
          paddingHorizontal: wp(3),
          paddingVertical: hp(0.8),
          marginTop: hp(1),
          flexDirection: 'row',
          alignItems: 'center',
          width: wp(40)
        },
        scheduleText: {
          fontSize: RFPercentage(1.8),
          color:  Colors.darkTheme.secondryTextColor,
        },
        clockIcon: {
          fontWeight: 'bold',
        },
        doctorImage: {
          width: wp(20),
          height: wp(20),
        //   borderRadius: wp(10),
        },
      });
  return (
    <View style={styles.cardContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.doctorName}>Dr. Rasheed Idris</Text>
        <Text style={styles.specialization}>Cardiovascular</Text>
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleText}>
            <Text style={styles.clockIcon}>⏰</Text> Nov 24, 9:00am
          </Text>
        </View>
      </View>
      <Image
        source={require('../../assets/Images/PngImage.png')} // Replace with the actual image URL
        style={styles.doctorImage}
      />
    </View>
  );
};



export default UpcomingCard;
