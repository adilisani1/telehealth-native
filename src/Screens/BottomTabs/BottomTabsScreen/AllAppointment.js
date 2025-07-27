import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar, TabBarItem } from 'react-native-tab-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Colors } from '../../../Constants/themeColors';
import StackHeader from '../../../components/Header/StackHeader';
import { Fonts } from '../../../Constants/Fonts';
import CustomButton from '../../../components/Buttons/customButton';
import { SCREENS } from '../../../Constants/Screens';
import { Images } from '../../../assets/Images/images';
import { title } from 'process';
import CRBSheetComponent from '../../../components/BottomSheets/CRBSheetComponent';
import appointmentApi from '../../../services/appointmentApi';
import patientApi from '../../../services/patientApi';
import { useAlert } from '../../../Providers/AlertContext';
import FullLoader from '../../../components/Loaders';
import { useFocusEffect } from '@react-navigation/native';
import WriteReviewModal from '../../../components/Review/WriteReviewModal';
import { createReview, getPatientReviews } from '../../../services/reviewApi';

const AllAppointment = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const { isDarkMode } = useSelector(store => store.theme);
  const { User } = useSelector(store => store.auth);
  const { showAlert } = useAlert();
  const reviewSheet_Ref = useRef();
  
  const [routes] = useState([
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'completed', title: 'Completed' },
    { key: 'cancelled', title: 'Cancelled' },
  ]);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState({
    upcoming: [],
    completed: [],
    cancelled: [],
  });

  // Review Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewedAppointments, setReviewedAppointments] = useState(new Set());

  const fetchAppointments = async () => {
    try {
      const [upcomingRes, historyRes, reviewsRes] = await Promise.all([
        patientApi.getUpcomingAppointments(),
        patientApi.getAppointmentHistory(),
        getPatientReviews({ limit: 100 }).catch(() => ({ data: { success: false } })) // Get all patient reviews, ignore errors
      ]);

      const upcoming = upcomingRes.data.data.upcoming || [];
      const history = historyRes.data.data.history || [];
      
      // Separate completed and cancelled from history
      const completed = history.filter(apt => apt.status === 'completed');
      const cancelled = history.filter(apt => apt.status === 'cancelled');

      // Track which appointments have been reviewed
      const reviewedSet = new Set();
      if (reviewsRes.data.success && reviewsRes.data.data.reviews) {
        reviewsRes.data.data.reviews.forEach(review => {
          if (review.appointment) {
            reviewedSet.add(review.appointment);
          }
        });
      }
      setReviewedAppointments(reviewedSet);

      setAppointmentData({
        upcoming: upcoming.map(formatAppointment),
        completed: completed.map(formatAppointment),
        cancelled: cancelled.map(formatAppointment),
      });
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load appointments', 'error');
      setAppointmentData({ upcoming: [], completed: [], cancelled: [] });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
    }, [])
  );

  useEffect(() => {
    if (loading) {
        fetchAppointments();
    }
  }, [loading, User]);

  const formatAppointment = (appointment) => ({
    id: appointment._id,
    name: appointment.doctor?.name || 'Doctor Name',
    specialty: appointment.doctor?.specialization || 'General Practitioner',
    date: new Date(appointment.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    bookingId: `#${appointment._id.slice(-8).toUpperCase()}`,
    status: appointment.status,
    image: appointment.doctor?.avatar ? { uri: appointment.doctor.avatar } : Images.dr1,
    rawData: appointment,
  });

  const cancelAppointment = async (appointmentId) => {
    setActionLoading(true);
    try {
      await appointmentApi.cancelAppointment(appointmentId, {});
      showAlert('Appointment cancelled successfully', 'success');
      setLoading(true);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to cancel appointment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Review Functions
  const handleAddReview = (appointment) => {
    setSelectedAppointmentForReview(appointment);
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setReviewLoading(true);
      
      // If reviewData doesn't have appointmentId but we have a selected appointment, add it
      const reviewPayload = {
        ...reviewData
      };
      
      // Ensure appointmentId is set if we have a pre-selected appointment
      if (!reviewPayload.appointmentId && selectedAppointmentForReview?._id) {
        reviewPayload.appointmentId = selectedAppointmentForReview._id;
      }

      const response = await createReview(reviewPayload);
      
      if (response.data.success) {
        showAlert('Review submitted successfully!', 'success');
        setReviewModalVisible(false);
        
        // Add the appointment to reviewed set
        setReviewedAppointments(prev => new Set(prev).add(selectedAppointmentForReview._id));
        
        setSelectedAppointmentForReview(null);
        // Optionally refresh appointments to get updated data
        setLoading(true);
      }
    } catch (error) {
      console.error('Review submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      showAlert(errorMessage, 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCloseReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedAppointmentForReview(null);
  };

  const Card = ({ item, actionButtons, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.date}>{item.date}</Text>
      <View style={styles.cardContent}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          {
            item.status && <View style={{ flexDirection: 'row' }} >
              <Icon name='map-marker' size={RFPercentage(2.3)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
              <Text style={styles.specialty}>{item.status}</Text>

            </View>
          }

          <Text style={styles.bookingId}>Booking ID : <Text style={styles.bookingIdHighlight}>{item.bookingId}</Text></Text>
        </View>
      </View>
      <View style={styles.actions}>{actionButtons}</View>
    </TouchableOpacity>
  );
  const UpcomingTab = () => (
    appointmentData.upcoming.length === 0 ? (
      <View style={{alignItems: 'center', marginVertical: 20}}>
        <Text>No upcoming appointments found.</Text>
      </View>
    ) : (
      <FlatList
        data={appointmentData.upcoming}
        style={{ paddingTop: hp(3) }}
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate(SCREENS.MYAPPOINTMENT, { appointment: item.rawData })}
            item={item}
            actionButtons={
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: wp(78) }}>
                <CustomButton containerStyle={[styles.btn]} mode={true} text={'Cancel'} textStyle={[styles.btnText]} onPress={()=>cancelAppointment(item.id)} />
                <CustomButton containerStyle={[styles.btn]} text={'Reschedule'} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]}  onPress={()=> navigation.navigate(SCREENS.NEWAPPOINTMENT, {title: 'Reschedule Appointment', doctor: item.rawData.doctor})}/>
              </View>
            }
          />
        )}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => setLoading(true)}
      />
    )
  );
  const CompletedTab = () => (
    appointmentData.completed.length === 0 ? (
      <View style={{alignItems: 'center', marginVertical: 20}}>
        <Text>No completed appointments found.</Text>
      </View>
    ) : (
      <FlatList
        data={appointmentData.completed}
        style={{ paddingTop: hp(3) }}
        renderItem={({ item }) => {
          const hasBeenReviewed = reviewedAppointments.has(item.rawData._id);
          
          return (
            <Card
              item={item}
              onPress={() => navigation.navigate(SCREENS.MYAPPOINTMENT, { appointment: item.rawData })}
              actionButtons={
                <>
                  <CustomButton containerStyle={[styles.btn]} mode={true} text={'Re-Book'} textStyle={[styles.btnText]}  onPress={()=> navigation.navigate(SCREENS.NEWAPPOINTMENT, {title: 'Re-Book Appointment', doctor: item.rawData.doctor})}/>
                  {hasBeenReviewed ? (
                    <View style={[styles.btn, { opacity: 0.5 }]}>
                      <Text style={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor }]}>
                        Review Added
                      </Text>
                    </View>
                  ) : (
                    <CustomButton 
                      containerStyle={[styles.btn]} 
                      text={'Add a Review'} 
                      textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} 
                      onPress={() => handleAddReview(item.rawData)}
                    />
                  )}
                </>
              }
            />
          );
        }}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => setLoading(true)}
      />
    )
  );

  const CancelledTab = () => (
    appointmentData.cancelled.length === 0 ? (
      <View style={{alignItems: 'center', marginVertical: 20}}>
        <Text>No cancelled appointments found.</Text>
      </View>
    ) : (
      <FlatList
        data={appointmentData.cancelled}
        style={{ paddingTop: hp(3) }}
        renderItem={({ item }) => {
          // Check if review button should be shown for cancelled appointments
          // Only show if cancelled by doctor (not by patient)
          const canReview = item.rawData.status === 'cancelled' 
            ? item.rawData.cancelledBy && item.rawData.cancelledBy !== User._id
            : true; // For completed appointments, always allow review
            
          const hasBeenReviewed = reviewedAppointments.has(item.rawData._id);

          return (
            <Card
              item={item}
              onPress={() => navigation.navigate(SCREENS.MYAPPOINTMENT, { appointment: item.rawData })}
              actionButtons={
                hasBeenReviewed ? (
                  <View style={[styles.btn, { width: wp(80), opacity: 0.5 }]}>
                    <Text style={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor }]}>
                      Review Added
                    </Text>
                  </View>
                ) : canReview ? (
                  <CustomButton 
                    containerStyle={[styles.btn, { width: wp(80) }]} 
                    text={'Add a Review '} 
                    textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} 
                    onPress={() => handleAddReview(item.rawData)}
                  />
                ) : (
                  <View style={[styles.btn, { width: wp(80), opacity: 0.5 }]}>
                    <Text style={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor }]}>
                      Review not available
                    </Text>
                  </View>
                )
              }
            />
          );
        }}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => setLoading(true)}
      />
    )
  );

  const renderScene = SceneMap({
    upcoming: UpcomingTab,
    completed: CompletedTab,
    cancelled: CancelledTab,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
    },
    card: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderRadius: wp(2.5),
      padding: wp(4),
      marginVertical: hp(1.2),
      marginHorizontal: wp(5),
      // shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: wp(2),
      elevation: wp(1),
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    image: {
      width: wp(15),
      height: wp(15),
      borderRadius: wp(7.5),
      marginRight: wp(4),
    },
    details: {
      flex: 1,
    },
    name: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
    },
    specialty: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
      marginVertical: hp(0.3),
      fontFamily: Fonts.Regular
    },
    bookingId: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.Regular

    },
    bookingIdHighlight: {
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      fontFamily: Fonts.Regular
    },
    date: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      paddingBottom: hp(1),
      borderBottomColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 2,
      marginBottom: hp(1)
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: hp(1.5),
      marginTop: hp(1.5),
      borderTopColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 2,
      // paddingVertical: hp(1),
    },
    btn: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      // marginVertical: hp(2),
      // marginHorizontal: wp(4),
      width: wp(38)
      // borderColor:  isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      // borderWidth: scaleHeight(2)
    },
    btnText: {
      color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: RFPercentage(2),

    },
  });

  const refreshAppointments = async () => {
    if (!User?.token) return;
    setLoading(true);
  };

  return (
    <View style={styles.container}>
      <FullLoader loading={loading} />
      <StackHeader title={'All Appointments'} headerStyle={{ paddingBottom: hp(1) }} rightIcon={<Icon name='magnify' size={wp(8)} color={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor} />} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: wp('100%') }}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={{
              backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,

              // marginTop: -hp(4),
              // elevation: 4,
            }}
            tabStyle={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
            renderTabBarItem={({ key, ...tabBarProps }) => (
              <TabBarItem key={key} {...tabBarProps} activeColor={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} inactiveColor={isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor} />
            )}
            indicatorStyle={{
              height: 4,
              backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
              alignSelf: 'center',
              borderTopEndRadius: 5,
              borderTopStartRadius: 5
            }}
          // pressOpacity={0,}
          />
        )}
      />

      {/* Write Review Modal */}
      <WriteReviewModal
        visible={reviewModalVisible}
        onClose={handleCloseReviewModal}
        onSubmit={handleSubmitReview}
        doctorInfo={selectedAppointmentForReview?.doctor}
        preSelectedAppointment={selectedAppointmentForReview}
        loading={reviewLoading}
      />

    </View>
  );
};



export default AllAppointment;