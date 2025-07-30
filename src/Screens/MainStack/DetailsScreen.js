import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Details from './Details'
import { Images } from '../../assets/Images/images'
import { SCREENS } from '../../Constants/Screens'
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage } from 'react-native-responsive-fontsize'
import { useSelector } from 'react-redux'
import { Colors } from '../../Constants/themeColors'
import { Fonts } from '../../Constants/Fonts'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAlert } from '../../Providers/AlertContext'
import appointmentApi from '../../services/appointmentApi';
import FullLoader from '../../components/Loaders';
import DisplayRating from '../../components/Rating/DisplayRating';

const DetailsScreen = ({ navigation, route }) => {
  const who = route.params.who;
  const doctorId = route.params.doctorId;
  const { isDarkMode } = useSelector((store) => store.theme);
  const { showAlert } = useAlert();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (who === 'doctor' && doctorId) {
      console.log('Fetching doctor profile for ID:', doctorId);
      setLoading(true);
      setError('');
      appointmentApi.getDoctorPublicProfile(doctorId)
        .then(res => {
          console.log('Doctor data received:', res.data);
          setDoctor(res.data.data);
        })
        .catch(err => {
          console.error('Error fetching doctor:', err);
          setError(err.response?.data?.message || 'Failed to load doctor details.');
        })
        .finally(() => {
          console.log('Loading finished');
          setLoading(false);
        });
    } else if (who === 'doctor' && !doctorId) {
      // Handle case when no doctor ID is provided
      setError('No doctor ID provided');
      setLoading(false);
    } else {
      // For non-doctor cases, just set loading to false
      setLoading(false);
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp(5) }}>
        <Text style={{ 
          color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
          fontSize: RFPercentage(2),
          textAlign: 'center',
          marginBottom: hp(2)
        }}>
          {error}
        </Text>
        <CustomButton 
          text="Go Back" 
          onPress={() => navigation.goBack()}
          containerStyle={{
            backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
            paddingHorizontal: wp(6),
            paddingVertical: hp(1.5),
            borderRadius: wp(2)
          }}
          textStyle={{
            color: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
            fontSize: RFPercentage(2)
          }}
        />
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
            { 
              icon: <DisplayRating 
                rating={doctor.doctorProfile?.averageRating || 0}
                totalReviews={doctor.doctorProfile?.totalReviews || 0}
                size={18}
                showCount={false}
              />, 
              value: `${doctor.doctorProfile?.averageRating?.toFixed(1) || '0.0'} (${doctor.doctorProfile?.totalReviews || 0})`, 
              label: 'Ratings', 
              iconColor: '#f7c481' 
            },
            ...(doctor.agreedFee && doctor.earningNegotiationStatus === 'agreed' ? [{
              icon: <MaterialCommunityIcons name={'currency-usd'} size={RFPercentage(3)} color={'#28a745'} />,
              value: `${doctor.currency || 'PKR'} ${doctor.agreedFee}`,
              label: 'Consultation Fee',
              iconColor: '#28a745'
            }] : [])
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
            }
          ]}
          buttonLabel="New Appointment"
          buttonAction={() => navigation.navigate(SCREENS.NEWAPPOINTMENT, { title: 'New Appointment', doctor: doctor })}
          doctor={doctor}
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

    </View>
  )
}

export default DetailsScreen
