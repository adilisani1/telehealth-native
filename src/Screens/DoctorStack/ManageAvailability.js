import React, {useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, Alert } from 'react-native';
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
import { updateDoctorAvailability } from '../../services/doctorService';
import { getToken } from '../../utils/tokenStorage';

const ManageAvailability = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {showAlert} = useAlert();
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const [availability, setAvailability] = useState({
    monday: { enabled: true, slots: [{ start: '09:00', end: '10:00' }] },
    tuesday: { enabled: true, slots: [{ start: '09:00', end: '10:00' }] },
    wednesday: { enabled: true, slots: [{ start: '09:00', end: '10:00' }] },
    thursday: { enabled: true, slots: [{ start: '09:00', end: '10:00' }] },
    friday: { enabled: true, slots: [{ start: '09:00', end: '10:00' }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  });
  const [timezone, setTimezone] = useState(Intl?.DateTimeFormat().resolvedOptions().timeZone || '');
  const [picker, setPicker] = useState({ visible: false, day: null, idx: null, field: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        slots: !prev[day].enabled && prev[day].slots.length === 0 ? [{ start: '09:00', end: '10:00' }] : prev[day].slots,
      },
    }));
  };

  const addSession = day => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: '09:00', end: '10:00' }],
      },
    }));
  };

  const removeSession = (day, idx) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== idx),
      },
    }));
  };

  const updateSession = (day, idx, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === idx ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const showTimePicker = (day, idx, field) => {
    setPicker({
      visible: true,
      day,
      idx,
      field,
      // Pass the current value for the picker
      value: availability[day].slots[idx][field],
    });
  };

  const onTimeChange = (event, selectedDate) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setPicker({ visible: false, day: null, idx: null, field: null });
      return;
    }
    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    updateSession(picker.day, picker.idx, picker.field, time);
    setPicker({ visible: false, day: null, idx: null, field: null });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      // Convert to backend format: [{ day: 'Monday', slots: ['09:00-10:00', ...] }, ...]
      const availabilityArray = Object.keys(availability).map(dayKey => ({
        day: dayNames[dayKey],
        slots: availability[dayKey].enabled
          ? availability[dayKey].slots
              .filter(slot => slot.start && slot.end)
              .map(slot => `${slot.start}-${slot.end}`)
          : [],
      }));
      if (!timezone) throw new Error('Timezone is required');
      const token = await getToken();
      await updateDoctorAvailability(token, availabilityArray, timezone);
      showAlert('Availability updated successfully', 'success');
      navigation.goBack();
    } catch (e) {
      setError(e?.message || 'Failed to update availability.');
      showAlert(e?.message || 'Failed to update availability.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const DayCard = ({ day }) => (
    <View style={[styles.dayCard, { backgroundColor: theme.secondryColor }]}> 
      <View style={styles.dayHeader}>
        <Text style={[styles.dayName, { color: theme.primaryTextColor }]}>
          {dayNames[day]}
        </Text>
        <Switch
          value={availability[day].enabled}
          onValueChange={() => toggleDay(day)}
          trackColor={{ false: '#767577', true: theme.primaryColor }}
          thumbColor={availability[day].enabled ? Colors.white : '#f4f3f4'}
        />
      </View>
      {availability[day].enabled && (
        <View>
          {availability[day].slots.map((slot, idx) => (
            <View key={idx} style={[styles.timeContainer, { alignItems: 'center' }]}> 
              <View style={styles.timeSlot}>
                <Text style={[styles.timeLabel, { color: theme.secondryTextColor }]}>Start Time</Text>
                <TouchableOpacity
                  style={[styles.timeButton, { borderColor: theme.BorderGrayColor }]}
                  onPress={() => showTimePicker(day, idx, 'start')}
                >
                  <Text style={[styles.timeText, { color: theme.primaryTextColor }]}>{slot.start}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeSlot}>
                <Text style={[styles.timeLabel, { color: theme.secondryTextColor }]}>End Time</Text>
                <TouchableOpacity
                  style={[styles.timeButton, { borderColor: theme.BorderGrayColor }]}
                  onPress={() => showTimePicker(day, idx, 'end')}
                >
                  <Text style={[styles.timeText, { color: theme.primaryTextColor }]}>{slot.end}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ marginLeft: 8, marginTop: 18 }}
                onPress={() => removeSession(day, idx)}
                disabled={availability[day].slots.length === 1}
              >
                <Text style={{ color: Colors.error, fontSize: RFPercentage(2) }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={{ marginTop: 8, alignSelf: 'flex-start' }}
            onPress={() => addSession(day)}
          >
            <Text style={{ color: theme.primaryColor, fontFamily: Fonts.Medium, fontSize: RFPercentage(1.8) }}>+ Add Session</Text>
          </TouchableOpacity>
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
        <View style={{ marginBottom: hp(2) }}>
          <Text style={{ color: theme.primaryTextColor, fontFamily: Fonts.Medium, fontSize: RFPercentage(2) }}>Timezone</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: theme.BorderGrayColor,
              borderRadius: wp(2),
              padding: wp(3),
              color: theme.primaryTextColor,
              fontFamily: Fonts.Medium,
              marginTop: 4,
            }}
            value={timezone}
            onChangeText={setTimezone}
            placeholder="e.g. Asia/karachi"
            autoCapitalize="none"
          />
        </View>

        {days.map(day => (
          <DayCard key={day} day={day} />
        ))}

        <View style={styles.buttonContainer}>
          {error ? (
            <Text style={{ color: Colors.error, marginBottom: hp(1), fontFamily: Fonts.Medium }}>{error}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.saveAvailabilityButton, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveAvailabilityButtonText}>
              {loading ? 'Saving...' : 'Save Availability'}
            </Text>
          </TouchableOpacity>
        </View>
      {picker.visible && (
        <DateTimePicker
          value={(() => {
            // Try to parse the current value, fallback to 09:00
            if (picker.value && /^\d{2}:\d{2}$/.test(picker.value)) {
              const [h, m] = picker.value.split(':');
              return new Date(0, 0, 0, parseInt(h, 10), parseInt(m, 10));
            }
            return new Date(0, 0, 0, 9, 0);
          })()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageAvailability;
