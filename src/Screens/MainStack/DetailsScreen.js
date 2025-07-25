import { StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import Details from './Details'
import { Images } from '../../assets/Images/images'
import { SCREENS } from '../../Constants/Screens'
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure you install react-native-vector-icons
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure you install react-native-vector-icons
import { RFPercentage } from 'react-native-responsive-fontsize'
import CRBSheetComponent from '../../components/BottomSheets/CRBSheetComponent'
import CameraBottomSheet from '../../components/BottomSheets/CameraBottomSheet'
import { useSelector } from 'react-redux'
import { Colors } from '../../Constants/themeColors'
import { Fonts } from '../../Constants/Fonts'
import CustomRating from '../../components/CustomRating/CustomRating'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TxtInput from '../../components/TextInput/Txtinput'
import CustomButton from '../../components/Buttons/customButton'
import { useAlert } from '../../Providers/AlertContext'
import appointmentApi from '../../services/appointmentApi';
import FullLoader from '../../components/Loaders';

const DetailsScreen = ({ navigation, route }) => {
  const who = route.params.who;
  const doctorId = route.params.doctorId;
  const reviewSheet_Ref = useRef();
  const { isDarkMode } = useSelector((store) => store.theme);
  const [review, setReview] = useState('');
  const { showAlert } = useAlert();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (who === 'doctor' && doctorId) {
      setLoading(true);
      setError('');
      appointmentApi.getDoctorPublicProfile(doctorId)
        .then(res => setDoctor(res.data.data))
        .catch(err => setError(err.response?.data?.message || 'Failed to load doctor details.'))
        .finally(() => setLoading(false));
        console.log(doctor);
        
    }
  }, [who, doctorId]);

  const styles = StyleSheet.create({
    sheatHeading: {
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(2.4),
      fontFamily: Fonts.Bold,
      alignSelf: 'center'
    },
    btn: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: hp(2),
      marginHorizontal: wp(4)
      // borderColor:  isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      // borderWidth: scaleHeight(2)
    },
    btnText: {
      color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: RFPercentage(2),

    },
  })
  if (loading && who === 'doctor') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <FullLoader loading={true} />
      </View>
    );
  }
  if (error && who === 'doctor') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} >
      {
        who === 'doctor' && doctor ? <Details
          navigation={navigation}
          title={doctor.name}
          subtitle={doctor.specialization}
          profileImage={doctor.avatar ? { uri: doctor.avatar } : Images.dr2}
          stats={[
            { icon: <Icon name={'workspace-premium'} size={RFPercentage(3)} color={'#e8899e'} />, value: doctor.qualifications || 'N/A', label: 'Qualifications', iconColor: '#e8899e' },
            { icon: <Icon name={'star-outline'} size={RFPercentage(3)} color={'#f7c481'} />, value: doctor.rating || 'N/A', label: 'Ratings', iconColor: '#f7c481' },
          ]}
          aboutText={doctor.qualifications || 'No additional information.'}
          workingTime={doctor.availability && doctor.availability.length > 0 ? 'Available for appointments' : 'No availability set.'}
          communicationOptions={[
            {
              iconName: 'chat',
              title: 'Messaging',
              subtitle: 'Chat me up, share photos',
              backgroundColor: '#e8899e',
              onPress: () => navigation.navigate(SCREENS.CHAT),
            },
            {
              iconName: 'star',
              title: 'Add Review',
              subtitle: 'Tap to review',
              backgroundColor: '#7acefa',
              onPress: () => reviewSheet_Ref.current.open(),
            },
          ]}
          buttonLabel="New Appointment"
          buttonAction={() => navigation.navigate(SCREENS.NEWAPPOINTMENT, { title: 'New Appointment', doctor: doctor })}
        /> : who === 'pharmacy' ? <Details
          navigation={navigation}
          title="London Bridge Pharmacy"
          subtitle="Pharmacy"
          profileImage={Images.pharmacy}
          stats={[
            { icon: <MaterialCommunityIcons name={'source-branch'} size={RFPercentage(3)} color={'#7acefa'} />, value: '50+', label: 'Branches', iconColor: '#7acefa' },
            { icon: <MaterialCommunityIcons name={'camera-timer'} size={RFPercentage(3)} color={'#e8899e'} />, value: '24/7', label: 'Availability', iconColor: '#e8899e' },
            { icon: <Icon name={'star-outline'} size={RFPercentage(3)} color={'#f7c481'} />, value: '4.5', label: 'Ratings', iconColor: '#f7c481' },
          ]}
          aboutText="London Bridge Pharmacy is a trusted name in pharmaceutical care, offering a wide range of high-quality medications and health products. Known for its customer-centric approach and professional service, it ensures prompt and reliable solutions for all your healthcare needs. Open for private consultations and guidance."
          workingTime="Mon - Sat (08:30 AM - 09:00 PM)"
          communicationOptions={[
            {
              iconName: 'chat',
              title: 'Messaging',
              subtitle: 'Chat me up, share photos',
              backgroundColor: '#e8899e',
              onPress: () => navigation.navigate(SCREENS.CHAT),
            },

          ]}
          buttonLabel="New Appointment"
          buttonAction={() => navigation.navigate(SCREENS.NEWAPPOINTMENT, { title: 'New Appointment' })}
        />
          : who === 'hospital' ? <Details
            navigation={navigation}
            title="London Bridge Hospital"
            subtitle="Hospital"
            profileImage={Images.hospital}
            stats={[
              { icon: <MaterialCommunityIcons name={'source-branch'} size={RFPercentage(3)} color={'#7acefa'} />, value: '50+', label: 'Branches', iconColor: '#7acefa' },
              { icon: <MaterialCommunityIcons name={'camera-timer'} size={RFPercentage(3)} color={'#e8899e'} />, value: '24/7', label: 'Availability', iconColor: '#e8899e' },
              { icon: <Icon name={'star-outline'} size={RFPercentage(3)} color={'#f7c481'} />, value: '4.5', label: 'Ratings', iconColor: '#f7c481' },
            ]}
            aboutText="London Bridge Hospital is a leading healthcare institution located in the heart of London. Renowned for its exceptional medical services and advanced facilities, it has received numerous accolades for excellence in patient care. The hospital is committed to providing world-class treatment and personalized attention to every patient."
            workingTime="Mon - Sat (08:30 AM - 09:00 PM)"
            communicationOptions={[
              {
                iconName: 'chat',
                title: 'Messaging',
                subtitle: 'Chat me up, share photos',
                backgroundColor: '#e8899e',
                onPress: () => navigation.navigate(SCREENS.CHAT),
              },
            ]}
            buttonLabel="New Appointment"
            buttonAction={() => navigation.navigate(SCREENS.NEWAPPOINTMENT, { title: 'New Appointment' })}
          /> : who == 'ambulance' && <Details
            navigation={navigation}
            title="SwiftCare Ambulance Service"
            subtitle="Ambulance Service"
            profileImage={Images.ambulance} // Replace with the image for ambulance
            stats={[
              // { iconName: 'car-outline', value: '50+', label: 'Vehicles', iconColor: '#7acefa' },
              // { iconName: 'time-outline', value: '24/7', label: 'Availability', iconColor: '#e8899e' },
              // { iconName: 'medkit-outline', value: '4.8', label: 'Ratings', iconColor: '#f7c481' },
              { icon: <MaterialCommunityIcons name={'car-outline'} size={RFPercentage(3)} color={'#7acefa'} />, value: '50+', label: 'Vehicles', iconColor: '#7acefa' },
              { icon: <MaterialCommunityIcons name={'camera-timer'} size={RFPercentage(3)} color={'#e8899e'} />, value: '24/7', label: 'Availability', iconColor: '#e8899e' },
              { icon: <Icon name={'star-outline'} size={RFPercentage(3)} color={'#f7c481'} />, value: '4.5', label: 'Ratings', iconColor: '#f7c481' },
            ]}
            aboutText="SwiftCare Ambulance Service provides 24/7 emergency and non-emergency transportation. Our modern fleet is equipped with advanced life-saving equipment and trained paramedics to ensure patient safety during transit."
            workingTime="Mon - Sun (24/7)"
            communicationOptions={[
              {
                iconName: 'call',
                title: 'Emergency Call',
                subtitle: 'Call now for immediate assistance',
                backgroundColor: '#7acefa',
                onPress: () => console.log('Emergency Call'),
              },
              {
                iconName: 'chat',
                title: 'Messaging',
                subtitle: 'Chat with our support team',
                backgroundColor: '#e8899e',
                onPress: () => navigation.navigate(SCREENS.CHAT),
              },
            ]}
            buttonLabel="Book Ambulance"
          // buttonAction={() => navigation.navigate(SCREENS.BOOKAMBULANCE)}
          />
      }



      <CRBSheetComponent refRBSheet={reviewSheet_Ref} content={<View style={{ flex: 1, }} >
        <Text style={styles.sheatHeading} >Add Review</Text>
        <View style={{ marginTop: hp(3) }} >
          <CustomRating
            count={5}
            defaultRating={4}
            size={RFPercentage(4)}
            readonly={false}
            starColor={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor}
            emptyStarColor={isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor}
            onFinishRating={value => {
              // setRating(value);
            }}
          />

        </View>


        <TxtInput placeholder={'Add Comment'} style={{ flex: 1, width: wp(80),marginTop: hp(2) }} value={review} onChangeText={setReview} containerStyle={{ paddingHorizontal: wp(3), borderWidth: 1, borderColor: isDarkMode? Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor, borderRadius: wp(2), }} multiline={true} numberOfLines={5} />

        <CustomButton containerStyle={styles.btn} text={'Add Review'} textStyle={[styles.btnText]} onPress={() => {
          showAlert('Review Added Successfully', 'success');
          reviewSheet_Ref.current.close();
        
        }} />

      </View>} />
      {/* <CameraBottomSheet/> */}


    </View>
  )
}

export default DetailsScreen
