import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';

const UpcomingCard = ({ appointment }) => {
    const { isDarkMode } = useSelector(store => store.theme);

    // Default values if no appointment data
    const doctorName = appointment?.doctor?.name || 'No upcoming appointment';
    const specialization = appointment?.doctor?.specialization || '';
    const appointmentDate = appointment?.date ? new Date(appointment.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }) : 'Schedule your next visit';
    const doctorImage = appointment?.doctor?.avatar || require('../../assets/Images/PngImage.png');


    const styles = StyleSheet.create({
      cardContainer: {
        flexDirection: 'row',
        backgroundColor: isDarkMode
          ? Colors.darkTheme.primaryColor
          : Colors.lightTheme.primaryColor,
        borderRadius: wp(3),
        padding: wp(4),
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      textContainer: {
        flex: 1,
      },
      doctorName: {
        fontSize: RFPercentage(2.4),
        color: isDarkMode ? Colors.lightTheme.primaryTextColor : Colors.white,
        fontFamily: Fonts.Bold,
      },
      specialization: {
        fontSize: RFPercentage(2),
        color: isDarkMode ? Colors.lightTheme.primaryTextColor : Colors.white,
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
        width: wp(40),
      },
      scheduleText: {
        fontSize: RFPercentage(1.8),
        color: Colors.darkTheme.secondryTextColor,
      },
      clockIcon: {
        fontWeight: 'bold',
      },
      doctorImage: {
        width: wp(20),
        height: wp(20),
      },
    }); 
    if (!appointment) {
      return (
        <View style={styles.cardContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.doctorName}>No upcoming appointment scheduled</Text>
            <Text style={styles.specialization}>Tap "See all" or "Find Doctors near you" to book your next appointment.</Text>
          </View>
        </View>
      );
    }  return (
    <View style={styles.cardContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.doctorName}>{doctorName}</Text>
        {specialization && <Text style={styles.specialization}>{specialization}</Text>}
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleText}>
            <Text style={styles.clockIcon}>⏰</Text> {appointmentDate}
          </Text>
        </View>
      </View>
      <Image
        source={typeof doctorImage === 'string' ? { uri: doctorImage } : doctorImage}
        style={styles.doctorImage}
      />
    </View>
  );
};



export default UpcomingCard;