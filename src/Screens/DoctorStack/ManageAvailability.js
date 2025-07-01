import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Colors} from '../../Constants/themeColors';
import {Fonts} from '../../Constants/Fonts';
import StackHeader from '../../components/Header/StackHeader';
import CustomButton from '../../components/Buttons/customButton';
import {useAlert} from '../../Providers/AlertContext';

const ManageAvailability = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {showAlert} = useAlert();
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const [availability, setAvailability] = useState({
    monday: {enabled: true, startTime: '09:00', endTime: '17:00'},
    tuesday: {enabled: true, startTime: '09:00', endTime: '17:00'},
    wednesday: {enabled: true, startTime: '09:00', endTime: '17:00'},
    thursday: {enabled: true, startTime: '09:00', endTime: '17:00'},
    friday: {enabled: true, startTime: '09:00', endTime: '17:00'},
    saturday: {enabled: false, startTime: '09:00', endTime: '17:00'},
    sunday: {enabled: false, startTime: '09:00', endTime: '17:00'},
  });

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  const toggleDay = day => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const handleSave = () => {
    // Save availability settings
    console.log('Saving availability:', availability);
    showAlert('Availability updated successfully', 'success');
    navigation.goBack();
  };

  const DayCard = ({day}) => (
    <View style={[styles.dayCard, {backgroundColor: theme.secondryColor}]}>
      <View style={styles.dayHeader}>
        <Text style={[styles.dayName, {color: theme.primaryTextColor}]}>
          {dayNames[day]}
        </Text>
        <Switch
          value={availability[day].enabled}
          onValueChange={() => toggleDay(day)}
          trackColor={{false: '#767577', true: theme.primaryColor}}
          thumbColor={availability[day].enabled ? Colors.white : '#f4f3f4'}
        />
      </View>

      {availability[day].enabled && (
        <View style={styles.timeContainer}>
          <View style={styles.timeSlot}>
            <Text style={[styles.timeLabel, {color: theme.secondryTextColor}]}>
              Start Time
            </Text>
            <TouchableOpacity
              style={[styles.timeButton, {borderColor: theme.BorderGrayColor}]}>
              <Text style={[styles.timeText, {color: theme.primaryTextColor}]}>
                {availability[day].startTime}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeSlot}>
            <Text style={[styles.timeLabel, {color: theme.secondryTextColor}]}>
              End Time
            </Text>
            <TouchableOpacity
              style={[styles.timeButton, {borderColor: theme.BorderGrayColor}]}>
              <Text style={[styles.timeText, {color: theme.primaryTextColor}]}>
                {availability[day].endTime}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    scrollContainer: {
      padding: wp(4),
    },
    title: {
      fontSize: RFPercentage(2.4),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
      marginBottom: hp(2),
      textAlign: 'center',
    },
    dayCard: {
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
      elevation: 2,
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    dayName: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(1),
    },
    timeSlot: {
      flex: 0.48,
    },
    timeLabel: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
      marginBottom: hp(0.5),
    },
    timeButton: {
      borderWidth: 1,
      borderRadius: wp(2),
      padding: wp(3),
      alignItems: 'center',
    },
    timeText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
    },
    buttonContainer: {
      marginTop: hp(3),
      marginBottom: hp(5),
      alignItems: 'center',
    },

    saveAvailabilityButton: {
      backgroundColor: Colors.success,
      paddingVertical: hp(2),
      paddingHorizontal: wp(5),
      borderRadius: wp(2),
        alignItems: 'center',
        width: wp(80),
      marginVertical: hp(2),
    },

    saveAvailabilityButtonText: {
      color: Colors.white,
      fontSize: RFPercentage(1.9),
      fontFamily: Fonts.Bold,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Manage Availability" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingBottom: hp(5)}}>
        <Text style={styles.title}>Set Your Weekly Schedule</Text>

        {days.map(day => (
          <DayCard key={day} day={day} />
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveAvailabilityButton}
            onPress={handleSave}>
            <Text style={styles.saveAvailabilityButtonText}>
              Save Availability
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageAvailability;
