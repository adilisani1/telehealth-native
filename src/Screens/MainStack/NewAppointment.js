import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StackHeader from '../../components/Header/StackHeader';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import TxtInput from '../../components/TextInput/Txtinput';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import CRBSheetComponent from '../../components/BottomSheets/CRBSheetComponent';
import CustomCalender from '../../components/Calender/CustomCalender';
import CustomDropDown from '../../components/DropDown/CustomDropDown';
import RBSheetConfirmation from '../../components/BottomSheets/RBSheetConfirmation';
import CustomButton from '../../components/Buttons/customButton';
import { useAlert } from '../../Providers/AlertContext';
import { SCREENS } from '../../Constants/Screens';
import appointmentApi from '../../services/appointmentApi';
import HealthRecordsUpload from '../../components/HealthRecords/HealthRecordsUpload';
import healthRecordsApi from '../../services/healthRecordsApi';

const NewAppointment = ({navigation, route}) => {
  const { title, doctor } = route.params;
  const doctorAvailability = doctor.availability || [];
  
  // Debug: Log doctor availability data
  useEffect(() => {
    console.log('Doctor Availability Data:', JSON.stringify(doctorAvailability, null, 2));
  }, []);

  // Set initial selected date to first available day
  useEffect(() => {
    if (availableDays.length > 0) {
      // Find the first available date for the current month
      const today = moment();
      const currentMonth = today.month();
      const currentYear = today.year();
      
      // Look for the first available day starting from today
      for (let day = today.date(); day <= today.daysInMonth(); day++) {
        const checkDate = moment().year(currentYear).month(currentMonth).date(day);
        const dayName = checkDate.format('dddd');
        
        if (availableDays.includes(dayName)) {
          setSelectedDate(checkDate.toDate());
          break;
        }
      }
    }
  }, [doctorAvailability]);

  // Helper: Get available days from doctor's availability (only days with slots)
  const availableDays = useMemo(() => {
    return doctorAvailability
      .filter(a => a.slots && a.slots.length > 0)
      .map(a => a.day);
  }, [doctorAvailability]);

  // Helper: Get available slots for selected day
  const getAvailableSlotsForDay = useCallback((day) => {
    const dayObj = doctorAvailability.find(a => a.day === day);
    // Only return slots if the day exists and has actual slots
    return dayObj && dayObj.slots && dayObj.slots.length > 0 ? dayObj.slots : [];
  }, [doctorAvailability]);

  // State for selected date and day
  const [selectedDate, setSelectedDate] = useState(moment().toDate());
  const [selectedDay, setSelectedDay] = useState(moment().format('dddd'));
  
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const { isDarkMode } = useSelector(store => store.theme);
  const { User } = useSelector(store => store.auth); // Get user data from Redux
  
  // Auto-populate patient details from user profile
  const [pName, setPName] = useState(User?.name || '');
  const [ageGroup, setAgeGroup] = useState('');
  const reff = useRef();
  const { showAlert } = useAlert();
  
  // Auto-populate gender from user profile
  useEffect(() => {
    if (User?.gender) {
      const genderMap = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Others'
      };
      setSelectedGender(genderMap[User.gender.toLowerCase()] || '');
    }
  }, [User]);

  // Auto-populate age group based on user's date of birth
  useEffect(() => {
    if (User?.dob) {
      const age = moment().diff(moment(User.dob), 'years');
      let ageGroupValue = '';
      
      if (age >= 1 && age <= 5) ageGroupValue = '01 - 05';
      else if (age >= 6 && age <= 10) ageGroupValue = '06 - 10';
      else if (age >= 11 && age <= 15) ageGroupValue = '11 - 15';
      else if (age >= 16 && age <= 20) ageGroupValue = '16 - 20';
      else if (age >= 21 && age <= 30) ageGroupValue = '21 - 30';
      else if (age >= 31 && age <= 35) ageGroupValue = '31 -35';
      else if (age >= 36 && age <= 40) ageGroupValue = '36 - 40';
      else if (age >= 41 && age <= 44) ageGroupValue = '41 - 55';
      else if (age >= 45 && age <= 50) ageGroupValue = '45 - 50';
      else if (age >= 51 && age <= 55) ageGroupValue = '51- 55';
      else if (age >= 56 && age <= 60) ageGroupValue = '56 - 60';
      else if (age >= 61 && age <= 65) ageGroupValue = '61 - 65';
      else if (age >= 66 && age <= 70) ageGroupValue = '66 - 70';
      else if (age >= 71 && age <= 75) ageGroupValue = '71 - 75';
      else if (age >= 76 && age <= 80) ageGroupValue = '76 - 80';
      else if (age >= 81 && age <= 85) ageGroupValue = '81 - 85';
      else if (age >= 86 && age <= 90) ageGroupValue = '86 - 90';
      else if (age >= 91 && age <= 95) ageGroupValue = '91 - 95';
      else if (age >= 96 && age <= 100) ageGroupValue = '96 - 100';
      
      setAgeGroup(ageGroupValue);
    }
  }, [User]);
  
  const Genders = [
     'Male', 'Female','Others', 'Preferred not to say',
  ];
  const Ages = [
     '01 - 05', '06 - 10','11 - 15', '16 - 20', '21 - 30', '31 -35', '36 - 40', '41 - 55', '45 - 50', '51- 55', '56 - 60', '61 - 65', '66 - 70', '71 - 75', '76 - 80', '81 - 85', '86 - 90', '91 - 95', '96 - 100',
  ];
  const [problem, setProblem] = useState('');
  const [healthRecordsData, setHealthRecordsData] = useState(null); // Store health records data
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Stable callback for health records data changes
  const handleHealthRecordsChange = useCallback((data) => {
    console.log('🔍 DEBUG: NewAppointment received health records data:', data);
    setHealthRecordsData(data);
  }, []);




  const getDayAndDate = (timestamp) => {
    // Extract the date and short day name
    const date = moment(timestamp).format('D'); // Day of the month without leading zero
    const shortDay = moment(timestamp).format('ddd').toUpperCase(); // Short day name in uppercase

    return { date, shortDay };
  };
const renderDateItem = (timestamp) => {


    const { date, shortDay } = getDayAndDate(timestamp);
    // console.log({ date, shortDay });
    

    return (


      <TouchableOpacity
        style={[
          styles.dateButton,
          // selectedDate === parseInt(item.day) && styles.selectedDateButton,
        ]}
        // onPress={() => setSelectedDate(parseInt(item.day))}
      >
        <Text style={[
          styles.dateText,
        // selectedDate === parseInt(item.day) && styles.seletedDateText
        ]}>{shortDay}</Text>
        <Text style={[
          styles.dateLabel,
          // selectedDate === parseInt(item.day) && styles.seletedDateText
        ]}>{date}</Text>
      </TouchableOpacity>
    )
  };

  const renderTimeItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.timeButton,
        selectedTime === item && styles.selectedTimeButton,
      ]}
      onPress={() => setSelectedTime(item)}
    >
      <Text
        style={[
          styles.timeText,
          selectedTime === item && styles.selectedTimeText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );


 
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor
    },
    monthTitle: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1.5%'),
      alignSelf:'flex-start'

    },
    flatList: {
      marginBottom: hp('2%'),
    },
    dateButton: {
      alignItems: 'center', 
      paddingHorizontal: wp('1%'),
      // paddingVertical: hp('1.2%'),
      // marginHorizontal: wp('0.5%'),
      // borderRadius: wp('2%'),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.primaryColor,
      // width: wp(20)
      // borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      // borderWidth: wp(0.4)
    },
    selectedDateButton: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      borderColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      borderWidth: wp(0.4)
    },
    seletedDateText: {
      color: Colors.white
    },
    dateText: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    dateLabel: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      // marginTop: hp('1.5%'),
    },
    sectionTitle: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1%'),
    },
    subSectionTitle: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1%'),
    },
    timeButton: {
      padding: wp('3%'),
      marginHorizontal: wp('1%'),
      alignItems: 'center',
      borderRadius: wp('2%'),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      borderWidth: wp(0.4)
    },
    selectedTimeButton: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      borderColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      borderWidth: wp(0.4)
    },
    timeText: {
      fontSize: RFPercentage(1.7),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    selectedTimeText: {
      color: Colors.darkTheme.primaryTextColor,
      fontFamily: Fonts.Bold
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: wp('2%'),
      padding: wp('3%'),
      fontSize: RFPercentage(2),
      marginBottom: hp('2%'),
      color: '#000',
    },
    problemInput: {
      height: hp('10%'),
      textAlignVertical: 'top',
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp('1%'),
    },
    genderButton: {
      flex: 1,
      marginHorizontal: wp('1%'),
      padding: wp('3%'),
      alignItems: 'center',
      borderRadius: wp('2%'),
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      borderWidth: wp(0.4),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
    },
    selectedGenderButton: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      borderColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      borderWidth: wp(0.4)
    },
    genderText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    selectedGenderText: {
      color: Colors.white,
      fontFamily: Fonts.Bold
    },
    label: {
      fontFamily: Fonts.Regular,
      fontSize: RFPercentage(2),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
      marginVertical: wp(2)
    },
    rowView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      // marginBottom: hp(1),
    },
    addDate: {
      fontFamily: Fonts.PlusJakartaSans_SemiBold,
      color: Colors.primary_text,
      fontSize: RFPercentage(2),
  
    },
       btn: {
                backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
                paddingVertical: hp(1.5),
                borderRadius: wp(2),
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: hp(2),
                marginHorizontal: wp(4)
                // borderColor:  isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
                // borderWidth: scaleHeight(2)
            },
            btnText: {
                color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,
                fontFamily: Fonts.Bold,
                fontSize: RFPercentage(2),
    
            },
            feeContainer: {
                backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
                borderRadius: wp(3),
                padding: wp(4),
                marginVertical: hp(2),
                borderWidth: 1,
                borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
            },
            feeRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: hp(1),
            },
            feeLabel: {
                fontSize: RFPercentage(2),
                fontFamily: Fonts.Regular,
                color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            },
            feeValue: {
                fontSize: RFPercentage(2.2),
                fontFamily: Fonts.Bold,
                color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
            },
            feeNote: {
                fontSize: RFPercentage(1.6),
                fontFamily: Fonts.Regular,
                color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
                fontStyle: 'italic',
            },
  });


  // Update selectedDay when selectedDate changes and reset selected time
  useEffect(() => {
    const newDay = moment(selectedDate).format('dddd');
    setSelectedDay(newDay);
    setSelectedTime(''); // Reset selected time when date changes
    
    // Debug: Log selected day and available slots
    console.log(`Selected Date: ${moment(selectedDate).format('YYYY-MM-DD')}`);
    console.log(`Selected Day: ${newDay}`);
    const slots = getAvailableSlotsForDay(newDay);
    console.log(`Available Slots:`, slots);
  }, [selectedDate, doctorAvailability]);

  // Use available slots for selected day (memoized to prevent render loops)
  const availableSlots = useMemo(() => {
    return getAvailableSlotsForDay(selectedDay);
  }, [selectedDay, getAvailableSlotsForDay]);
  
  // Debug: Log available slots for rendering (moved to useEffect to prevent render loop)
  useEffect(() => {
    console.log(`=== RENDER DEBUG ===`);
    console.log(`Selected Day: ${selectedDay}`);
    console.log(`Available Days: [${availableDays.join(', ')}]`);
    console.log(`Available Slots Length: ${availableSlots.length}`);
    console.log(`Available Slots:`, availableSlots);
    console.log(`===================`);
  }, [selectedDay, availableDays, availableSlots]);

  // Helper: Upload health records after appointment booking
  const uploadHealthRecords = async () => {
    console.log('🔍 DEBUG: uploadHealthRecords called');
    console.log('🔍 DEBUG: healthRecordsData:', JSON.stringify(healthRecordsData, null, 2));
    
    if (!healthRecordsData || !healthRecordsData.hasData) {
      console.log('❌ DEBUG: No health records to upload - healthRecordsData:', healthRecordsData);
      return;
    }

    try {
      console.log('📤 Starting health records upload...');
      console.log('📤 Upload data:', {
        type: healthRecordsData.type,
        description: healthRecordsData.description,
        hasFiles: healthRecordsData.files?.length || 0,
        hasNoteData: !!healthRecordsData.noteData
      });
      
      const uploadPromises = [];
      
      if (healthRecordsData.type === 'note') {
        // Upload note
        console.log('📝 Uploading note...');
        uploadPromises.push(
          healthRecordsApi.uploadHealthRecord({
            type: 'note',
            description: healthRecordsData.description,
            noteData: healthRecordsData.noteData,
          })
        );
      } else {
        // Upload files
        console.log('📁 Uploading files...');
        healthRecordsData.files.forEach((file, index) => {
          console.log(`📁 File ${index + 1}:`, {
            name: file.name,
            size: file.size,
            type: file.type
          });
          uploadPromises.push(
            healthRecordsApi.uploadHealthRecord({
              type: healthRecordsData.type,
              description: healthRecordsData.description,
              file,
            })
          );
        });
      }

      console.log(`📤 Making ${uploadPromises.length} API calls...`);
      const results = await Promise.all(uploadPromises);
      console.log('✅ Health records uploaded successfully:', results);
      showAlert(`Successfully uploaded ${results.length} health record${results.length > 1 ? 's' : ''}`, 'success');
      
      return results;
    } catch (error) {
      console.error('❌ Health records upload error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      showAlert('Health records could not be uploaded, but your appointment has been scheduled successfully.', 'warning');
      return null;
    }
  };

  // Helper: Validate inputs
  const validateInputs = () => {
    if (!doctor._id) return 'Doctor not selected.';
    if (!selectedDate) return 'Please select a date.';
    if (!selectedTime) return 'Please select a time slot.';
    if (!pName.trim()) return 'Please enter your full name.';
    if (!ageGroup) return 'Please select your age group.';
    if (!selectedGender) return 'Please select your gender.';
    if (!problem.trim()) return 'Please describe your problem.';
    return '';
  };

  return (
    <ScrollView style={styles.container} >
      <StackHeader title={title} />
      <View style={{ paddingHorizontal: wp(5) }} >
        {/* Calendar: highlight available days */}
        <CustomCalender
          onDateSelected={date => setSelectedDate(date)}
          highlightDays={availableDays}
        />
        <Text style={styles.sectionTitle}>Available Time</Text>
        {availableSlots.length === 0 && (
          <Text style={{ color: Colors.error, fontSize: RFPercentage(2), marginBottom: hp(1), textAlign: 'center' }}>
            Sorry, there are no available times on {moment(selectedDate).format('dddd, MMMM Do')}. Please choose another day.
          </Text>
        )}
        {availableSlots.length > 0 && (
          <FlatList
            horizontal
            data={availableSlots}
            renderItem={renderTimeItem}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            style={styles.flatList}
          />
        )}
        
        {/* Consultation Fee Display */}
        {doctor?.agreedFee && doctor?.earningNegotiationStatus === 'agreed' && (
          <View style={styles.feeContainer}>
            <Text style={styles.sectionTitle}>Consultation Fee</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Doctor's Fee:</Text>
              <Text style={styles.feeValue}>
                {doctor.currency || 'PKR'} {doctor.agreedFee}
              </Text>
            </View>
            <Text style={styles.feeNote}>
              * This is the agreed consultation fee for this doctor
            </Text>
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Patient Details</Text>
        <Text style={[styles.label, { marginTop: wp(0) }]} >Full Name</Text>
        <TxtInput placeholder={'John Doe'} style={{ flex: 1, }} value={pName} onChangeText={setPName} containerStyle={{ paddingHorizontal: wp(3) }} />
        <Text style={styles.label} >Age</Text>
        {/* <TxtInput placeholder={'26 - 30'} style={{ flex: 1, }} value={age} onChangeText={setAge} containerStyle={{ paddingHorizontal: wp(3) }} leftIcon={'chevron-down'} leftIconColor={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor} leftIconSize={wp(7)} /> */}
        <CustomDropDown
                    data={Ages}
                    selectedValue={ageGroup}
                    onValueChange={setAgeGroup}
                    placeholder="Select Age Group..."
                    textStyle={{color: ageGroup ?isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor}}
                />
        <Text style={styles.label} >Gender</Text>
        <CustomDropDown
                    data={Genders}
                    selectedValue={selectedGender}
                    onValueChange={setSelectedGender}
                    placeholder="Select Gender..."
                    textStyle={{color: selectedGender ?isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor}}

                />
        {/* <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              selectedGender === 'Male' && styles.selectedGenderButton,
            ]}
            onPress={() => setSelectedGender('Male')}
          >
            <Text
              style={[
                styles.genderText,
                selectedGender === 'Male' && styles.selectedGenderText,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              selectedGender === 'Female' && styles.selectedGenderButton,
            ]}
            onPress={() => setSelectedGender('Female')}
          >
            <Text
              style={[
                styles.genderText,
                selectedGender === 'Female' && styles.selectedGenderText,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View> */}
        <Text style={styles.label} >Write your problem</Text>
        <TxtInput placeholder={'Describe your problem'} style={{ flex: 1, marginBottom: hp(4), }} value={problem} onChangeText={setProblem} containerStyle={{ paddingHorizontal: wp(3), }} multiline={true} numberOfLines={5} />
        
        {/* Health Records Upload Component */}
        <HealthRecordsUpload 
          onHealthRecordsChange={handleHealthRecordsChange}
          containerStyle={{ marginBottom: hp(2) }}
        />
        
        <CustomButton containerStyle={styles.btn} text={title} textStyle={[styles.btnText]} onPress={() => reff.current.open()} />

      </View>


      <RBSheetConfirmation
        tittleStyle={{ fontFamily: Fonts.Medium }}
        descriptionStyle={{ borderTopColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor, borderTopWidth: 1, paddingTop: hp(2) }}
        refRBSheet={reff}
        title={'Confirm'}
        cancelText={'Cancel'}
        okText={'Yes, Confirm'}
        height={hp(25)}
        description={
          healthRecordsData?.hasData 
            ? 'Are you sure you want to schedule an appointment? Your health records will also be uploaded.'
            : 'Are you sure you want to schedule an appointment?'
        }
        onCancel={() => reff.current.close()}
        onOk={async () => {
          if (booking) return; // Prevent double submit
          setErrorMsg('');
          setSuccessMsg('');
          const validationError = validateInputs();
          if (validationError) {
            setErrorMsg(validationError);
            showAlert(validationError, 'error');
            return;
          }
          
          setBooking(true);
          
          try {
            // First validate the appointment slot
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            const validationPayload = {
              doctorId: doctor._id,
              date: formattedDate,
              slot: selectedTime
            };
            
            const validationRes = await appointmentApi.validateAppointmentSlot(validationPayload);
            
            if (validationRes.data && validationRes.data.success) {
              // Slot is valid, proceed to payment
              reff.current.close();
              
              const appointmentData = {
                doctorId: doctor._id,
                date: formattedDate,
                slot: selectedTime,
                patientName: pName,
                ageGroup,
                gender: selectedGender,
                problem,
                doctor: doctor,
                healthRecordsData: healthRecordsData,
                title: title
              };
              
              // Navigate to payment screen
              navigation.navigate(SCREENS.PAYMENTOPTION, { 
                appointmentData: appointmentData,
                amount: doctor?.agreedFee || 0,
                currency: doctor?.currency || 'PKR'
              });
            } else {
              setErrorMsg(validationRes.data.message || 'Slot validation failed');
              showAlert(validationRes.data.message || 'Slot validation failed', 'error');
            }
          } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to validate appointment slot';
            setErrorMsg(errorMessage);
            showAlert(errorMessage, 'error');
          } finally {
            setBooking(false);
          }
        }}
      />
      {errorMsg ? (
        <Text style={{ color: Colors.error, textAlign: 'center', marginVertical: hp(1) }}>{errorMsg}</Text>
      ) : null}
      {successMsg ? (
        <Text style={{ color: Colors.success, textAlign: 'center', marginVertical: hp(1) }}>{successMsg}</Text>
      ) : null}

    </ScrollView>
  );
};



export default NewAppointment;