'use client';

import {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import { getProfile } from '../../services/authApi';
import axios from 'axios';
import { setUser, logoutUser } from '../../redux/Slices/authSlice';
import { getToken, removeToken } from '../../utils/tokenStorage';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../../Constants/themeColors';
import {Fonts} from '../../Constants/Fonts';
import {SCREENS} from '../../Constants/Screens';
import CustomButton from '../../components/Buttons/customButton';
import {SafeAreaView} from 'react-native';
import {useLogout} from '../../utils/authUtils';

const DoctorDashboard = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {User} = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const logout = useLogout();

  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 5,
    totalPatients: 45,
    todayEarnings: 320,
    monthlyEarnings: 8500,
    pendingAppointments: 3,
    completedToday: 2,
    newPatients: 3, // New patients this week
    activePatients: 42, // Currently active patients
  });

  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;


  useEffect(() => {
    fetchDashboardData();
    fetchAndUpdateUserProfile();
  }, []);

  const fetchAndUpdateUserProfile = async () => {
    try {
      const token = await getToken();
      if (token) {
        const res = await getProfile(token);
        if (res?.data?.data) {
          dispatch(setUser(res.data.data));
        }
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    }
  }

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      const token = await getToken();
      // Optionally, send device token if available
      await axios.post(
        'https://mrvwhr8v-5000.inc1.devtunnels.ms/api/user/logout',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Logout API error:', error);
    }
    await removeToken();
    dispatch(logoutUser());
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // Enhanced stat card with different actions
  const StatCard = ({title, value, icon, color, onPress, subtitle}) => (
    <TouchableOpacity
      style={[styles.statCard, {backgroundColor: theme.secondryColor}]}
      onPress={onPress}>
      <View style={styles.statCardHeader}>
        <Icon name={icon} size={RFPercentage(3)} color={color} />
        <Text style={[styles.statValue, {color}]}>{value}</Text>
      </View>
      <Text style={[styles.statTitle, {color: theme.secondryTextColor}]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, {color: theme.primaryColor}]}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );

  const QuickActionCard = ({title, icon, onPress, color}) => (
    <TouchableOpacity
      style={[styles.quickActionCard, {backgroundColor: theme.secondryColor}]}
      onPress={onPress}>
      <Icon name={icon} size={RFPercentage(4)} color={color} />
      <Text style={[styles.quickActionText, {color: theme.primaryTextColor}]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
      marginBottom: hp(2),
    },
    headerInfo: {
      flex: 1,
    },
    welcomeText: {
      fontSize: RFPercentage(2.8),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    dateText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: theme.secondryTextColor,
    },
    logoutButton: {
      padding: wp(2.5),
      borderRadius: wp(2),
      backgroundColor: theme.secondryColor,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    scrollContainer: {
      padding: wp(4),
    },
    availabilityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.secondryColor,
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
    },
    availabilityText: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: theme.primaryTextColor,
    },
    availabilityStatus: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: Colors.success,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: hp(3),
    },
    statCard: {
      width: '48%',
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
      elevation: 2,
    },
    statCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    statValue: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Bold,
    },
    statTitle: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
    },
    statSubtitle: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.Medium,
      marginTop: hp(0.5),
    },
    sectionTitle: {
      fontSize: RFPercentage(2.4),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
      marginBottom: hp(2),
    },
    quickActionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: hp(3),
    },
    quickActionCard: {
      width: '48%',
      padding: wp(4),
      borderRadius: wp(3),
      alignItems: 'center',
      marginBottom: hp(2),
      elevation: 2,
    },
    quickActionText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
      marginTop: hp(1),
      textAlign: 'center',
    },
    appointmentCard: {
      backgroundColor: theme.secondryColor,
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(1.5),
      elevation: 2,
    },
    appointmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    patientName: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: theme.primaryTextColor,
    },
    appointmentTime: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: theme.secondryTextColor,
    },
    appointmentType: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
      color: theme.primaryColor,
    },
    joinButton: {
      backgroundColor: Colors.success,
      paddingHorizontal: wp(4),
      paddingVertical: hp(1),
      borderRadius: wp(2),
    },
    joinButtonText: {
      color: Colors.white,
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.welcomeText}>
            Welcome back, {User?.name || 'Doctor'}
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon
            name="logout"
            size={RFPercentage(3)}
            color={theme.primaryColor}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.availabilityContainer}>
          <View>
            <Text style={styles.availabilityText}>Availability Status</Text>
            <Text style={styles.availabilityStatus}>Available</Text>
          </View>
          <CustomButton
            text="Go Offline"
            containerStyle={{
              backgroundColor: Colors.error,
              paddingHorizontal: wp(4),
              paddingVertical: hp(1.5),
            }}
            textStyle={{fontSize: RFPercentage(1.8)}}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Today's Appointments"
            value={dashboardStats.todayAppointments}
            icon="calendar-today"
            color={theme.primaryColor}
            onPress={() => navigation.navigate(SCREENS.DOCTOR_APPOINTMENTS)}
          />

          <StatCard
            title="Patient Analytics"
            value={dashboardStats.totalPatients}
            subtitle={`+${dashboardStats.newPatients} this week`}
            icon="account-group"
            color={Colors.success}
            onPress={() =>
              navigation.navigate(SCREENS.DOCTOR_PATIENTS, {
                filter: 'analytics',
                title: 'Patient Analytics',
              })
            }
          />

          {/* <StatCard
            title="Today's Earnings"
            value={`$${dashboardStats.todayEarnings}`}
            icon="currency-usd"
            color={Colors.success}
            onPress={() =>
              navigation.navigate(SCREENS.DOCTOR_EARNINGS, {
                defaultTab: 'daily',
                title: 'Daily Earnings Report',
              })
            }
          />
          <StatCard
            title="Monthly Earnings"
            value={`$${dashboardStats.monthlyEarnings}`}
            icon="chart-line"
            color={theme.primaryColor}
            onPress={() =>
              navigation.navigate(SCREENS.DOCTOR_EARNINGS, {
                defaultTab: 'monthly',
                title: 'Monthly Earnings Report',
              })
            }
          /> */}
        </View>

        {/*-----------------Quick Actions-----------------*/}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <QuickActionCard
            title="Manage Availability"
            icon="calendar-clock"
            color={theme.primaryColor}
            onPress={() => navigation.navigate(SCREENS.MANAGE_AVAILABILITY)}
          />

          <QuickActionCard
            title="My Patients"
            icon="account-multiple"
            color={Colors.success}
            onPress={() => navigation.navigate(SCREENS.DOCTOR_PATIENTS)}
          />

          <QuickActionCard
            title="Consultation Notes"
            icon="note-text"
            color={Colors.error}
            onPress={() => navigation.navigate(SCREENS.CONSULTATION_NOTES)}
          />
          <QuickActionCard
            title="Earnings Report"
            icon="chart-bar"
            color={theme.primaryColor}
            onPress={() => navigation.navigate(SCREENS.DOCTOR_EARNINGS)}
          />
        </View>

        <Text style={styles.sectionTitle}>Today's Appointments</Text>
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <View>
              <Text style={styles.patientName}>John Doe</Text>
              <Text style={styles.appointmentTime}>10:00 AM</Text>
              <Text style={styles.appointmentType}>Video Consultation</Text>
            </View>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => navigation.navigate(SCREENS.CALL)}>
              <Text style={styles.joinButtonText}>Join Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorDashboard;
