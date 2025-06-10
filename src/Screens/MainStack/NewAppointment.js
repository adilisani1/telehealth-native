import React, { useRef, useState } from 'react';
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

const NewAppointment = ({navigation, route}) => {
  const title = route.params.title
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const { isDarkMode } = useSelector(store => store.theme);
  const [pName, setPName] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const reff = useRef()
    const { showAlert } = useAlert();
  
  
      const Genders = [
         'Male', 'Female','Others', 'Preferred not to say',
      ];
      const Ages = [
         '01 - 05', '06 - 10','11 - 15', '16 - 20', '21 - 30', '31 -35', '36 - 40', '41 - 55', '45 - 50', '51- 55', '56 - 60', '61 - 65', '66 - 70', '71 - 75', '76 - 80', '81 - 85', '86 - 90', '91 - 95', '96 - 100',
      ];
  const [problem, setProblem] = useState('')


  const morningTimes = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM'];
  const afternoonTimes = ['12:00 PM', '12:30 PM', '01:30 PM', '02:00 PM'];
  const eveningTimes = ['03:00 PM', '04:30 PM', '05:00 PM'];




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
  });


  return (
    <ScrollView style={styles.container} >
      {/* <View style={styles.header}>
        <Icon name="arrow-back" size={RFPercentage(3)} color="#000" />
        <Text style={styles.headerTitle}>New Appointment</Text>
      </View> */}
      <StackHeader title={title} />
      <View style={{ paddingHorizontal: wp(5) }} >
        {/* <FlatList
          horizontal
          data={dates}
          renderItem={renderDateItem}
          keyExtractor={(item) => item.day}
          showsHorizontalScrollIndicator={false}
          style={styles.flatList}
        /> */}
        <CustomCalender/>
        {/* <CalendarStrip
          calendarAnimation={{ type: 'sequence', duration: 30 }}
          daySelectionAnimation={{ type: 'border', duration: 200, borderWidth: 1, borderHighlightColor: 'white', }}
          style={{ height: 100, paddingBottom: 10, }}
          calendarHeaderStyle={[styles.monthTitle]}
          
          // calendarHeaderContainerStyle ={{justifyContent: 'flex-start', alignItems:'flex-start',backgroundColor: 'yellow', }}
          dayComponentHeight={100}
          dayContainerStyle={{ height: hp(7), marginTop: hp(3), width: wp(11), borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,borderWidth: wp(0.4), borderRadius: wp(2), }}
          // calendarColor={'#7743CE'}
          dateNumberStyle={styles.dateLabel}
          dateNameStyle={styles.dateText}
          highlightDateNumberStyle={[styles.dateText,{color: isDarkMode ? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor}]}
          highlightDateNameStyle={[styles.dateText,{color: isDarkMode ? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor}]}
          disabledDateNameStyle={{ color: 'grey' }}
          disabledDateNumberStyle={{ color: 'grey' }}
          scrollable={true}
          iconContainer={{ flex: 0.1 }}
          // dayComponent={({ date, state }) => {
          //   console.log(state);

          //   return (
          //     renderDateItem(date)
          //   )

          // }}
        /> */}
        <Text style={styles.sectionTitle}>Available Time</Text>
        {/* <Text style={styles.subSectionTitle}>Morning</Text> */}
        <FlatList
          horizontal
          data={morningTimes}
          renderItem={renderTimeItem}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.flatList}
        />
        {/* <Text style={styles.subSectionTitle}>Afternoon</Text> */}
        <FlatList
          horizontal
          data={afternoonTimes}
          renderItem={renderTimeItem}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.flatList}
        />
        {/* <Text style={styles.subSectionTitle}>Evening</Text> */}
        <FlatList
          horizontal
          data={eveningTimes}
          renderItem={renderTimeItem}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.flatList}
        />
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
        <CustomButton containerStyle={styles.btn} text={title} textStyle={[styles.btnText]} onPress={() => reff.current.open()} />

      </View>


      <RBSheetConfirmation tittleStyle={{ fontFamily: Fonts.Medium }} descriptionStyle={{ borderTopColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor, borderTopWidth: 1, paddingTop: hp(2) }} refRBSheet={reff} title={'Confirm'} cancelText={'Cancel'} okText={'Yes, Confirm'} height={hp(25)} description={'Are you sure you want to scehedule an appointment?'} onCancel={() => reff.current.close()} onOk={() => {
           reff.current.close()
          // showAlert('Appointment Scheduled Successfully', 'success');
              setTimeout(() => {
                title === 'Reschedule Appointment'?navigation.navigate(SCREENS.MYAPPOINTMENT) :navigation.navigate(SCREENS.REVIEWSUMMARY)
                
              }, 2500);
      }} />

    </ScrollView>
  );
};



export default NewAppointment;
