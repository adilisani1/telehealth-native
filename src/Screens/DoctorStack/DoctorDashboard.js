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
import { getDoctorUpcomingAppointments, getDoctorAppointmentHistory, getDoctorOwnReviews } from '../../services/doctorService';
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
    upcomingAppointments: 0,
    totalPatients: 0,
    newPatients: 0,
    activePatients: 0,
    averageAge: 0,
    commonConditions: [],
  });
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  // Add a loading state for profile
  const [profileLoading, setProfileLoading] = useState(true);

  // On mount, fetch and set user profile first
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      await fetchAndUpdateUserProfile();
      setProfileLoading(false);
    };
    fetchProfile();
  }, []);

  // Only fetch dashboard data when User is loaded, role is doctor, and profile is not loading
  useEffect(() => {
    if (!profileLoading && User && User.role === 'doctor') {
      // Reset upcomingAppointments to 0 before fetching
      setDashboardStats(prev => ({
        ...prev,
        upcomingAppointments: 0,
      }));
      fetchDashboardData();
    }
  }, [User, profileLoading]);

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
    try {
      const token = await getToken();
      if (token) {
        // Fetch both completed and upcoming appointments
        const [upcomingRes, historyRes, reviewsRes] = await Promise.all([
          getDoctorUpcomingAppointments(token),
          getDoctorAppointmentHistory(token),
          getDoctorOwnReviews(token, 1, 1), // Just get stats, no need for all reviews
        ]);
        const upcomingAppointments = Array.isArray(upcomingRes?.data?.appointments)
          ? upcomingRes.data.appointments
          : [];
        const completedAppointments = Array.isArray(historyRes?.data?.history)
          ? historyRes.data.history
          : [];

        // Total Patients: unique patients in completed appointments
        const patientIds = new Set(completedAppointments.map(a => a.patient?._id || a.patient));
        // New This Week: patients whose FIRST completed appointment is in this week
        const now = new Date();
        // Always use local time, set weekStart to Monday 00:00:00
        const weekStart = new Date(now);
        const currentDay = weekStart.getDay(); // 0=Sunday, 1=Monday, ...
        // If Sunday, go back 6 days; else go back (currentDay-1) days
        weekStart.setDate(weekStart.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        weekStart.setHours(0, 0, 0, 0);
        // Map patientId to earliest completed appointment date
        const patientFirstAppt = {};
        completedAppointments.forEach(a => {
          const pid = a.patient?._id || a.patient;
          const d = new Date(a.date);
          if (!patientFirstAppt[pid] || d < patientFirstAppt[pid]) {
            patientFirstAppt[pid] = d;
          }
        });
        const newThisWeekIds = new Set(
          Object.entries(patientFirstAppt)
            .filter(([_, d]) => d >= weekStart && d <= now)
            .map(([pid, _]) => pid)
        );
        // Active Patients: unique patients with upcoming appointments who have never had a completed appointment with a prescription
        // Build a set of patientIds who have ever been prescribed
        const prescribedPatientIds = new Set();
        completedAppointments.forEach(a => {
          const pid = a.patient?._id || a.patient;
          if (a.prescription && a.prescription.diagnosis) {
            prescribedPatientIds.add(pid);
          }
        });
        const activePatientIds = new Set(
          upcomingAppointments
            .filter(a => {
              const pid = a.patient?._id || a.patient;
              return a.patient && !prescribedPatientIds.has(pid);
            })
            .map(a => a.patient?._id || a.patient)
        );
        // Average Age: from completed appointments
        const ages = completedAppointments
          .map(a => a.patient?.dob)
          .filter(Boolean)
          .map(dob => Math.floor((Date.now() - new Date(dob)) / (365.25*24*60*60*1000)));
        const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
        // Common Conditions: diagnosis counts from prescriptions
        const diagnosisCounts = {};
        completedAppointments.forEach(a => {
          const diag = a.prescription?.diagnosis;
          if (diag) diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
        });
        const commonConditions = Object.entries(diagnosisCounts).map(([name, count]) => ({ name, count }));

        setDashboardStats(prev => ({
          ...prev,
          upcomingAppointments: upcomingAppointments.length,
          totalPatients: patientIds.size,
          newPatients: newThisWeekIds.size,
          activePatients: activePatientIds.size,
          averageAge,
          commonConditions,
        }));

        // Set rating stats
        if (reviewsRes?.data?.ratingStats) {
          setRatingStats(reviewsRes.data.ratingStats);
        }

        // Filter today's appointments
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        const todays = upcomingAppointments.filter(a => {
          const apptDate = new Date(a.date);
          return apptDate >= todayStart && apptDate <= todayEnd;
        });
        setTodaysAppointments(todays);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard analytics:', e);
    }
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
    navigation.reset({
      index: 0,
      routes: [{ name: SCREENS.LOGIN }],
    });
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
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.secondryColor,
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
    },
    ratingText: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: theme.primaryTextColor,
      marginBottom: hp(1),
    },
    ratingInfo: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    starsContainer: {
      flexDirection: 'row',
      marginBottom: hp(0.5),
    },
    ratingValue: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.SemiBold,
      color: theme.primaryColor,
      marginBottom: hp(0.2),
    },
    reviewCount: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.Regular,
      color: theme.secondryTextColor,
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
        <View style={styles.ratingContainer}>
          <View>
            <Text style={styles.ratingText}>My Rating</Text>
            <View style={styles.ratingInfo}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name={star <= Math.round(ratingStats.averageRating) ? 'star' : 'star-outline'}
                    size={RFPercentage(2.5)}
                    color={star <= Math.round(ratingStats.averageRating) ? Colors.warning : theme.secondryTextColor}
                  />
                ))}
              </View>
              <Text style={styles.ratingValue}>
                {ratingStats.averageRating > 0 ? `${ratingStats.averageRating}/5` : 'No ratings yet'}
              </Text>
              <Text style={styles.reviewCount}>
                ({ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''})
              </Text>
            </View>
          </View>
          <CustomButton
            text="View Reviews"
            onPress={() => navigation.navigate(SCREENS.DOCTOR_REVIEWS)}
            containerStyle={{
              backgroundColor: theme.primaryColor,
              paddingHorizontal: wp(4),
              paddingVertical: hp(1.5),
            }}
            textStyle={{fontSize: RFPercentage(1.8)}}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Upcoming Appointments"
            value={dashboardStats.upcomingAppointments}
            icon="calendar-clock"
            color={theme.primaryColor}
            onPress={() => navigation.navigate(SCREENS.DOCTOR_APPOINTMENTS)}
          />

          <StatCard
            title="Patient Analytics"
            value={dashboardStats.totalPatients ?? 0}
            subtitle={`+${dashboardStats.newPatients ?? 0} this week`}
            icon="account-group"
            color={Colors.success}
            onPress={() =>
              navigation.navigate(SCREENS.DOCTOR_PATIENTS, {
                filter: 'analytics',
                title: 'Patient Analytics',
                analytics: {
                  totalPatients: dashboardStats.totalPatients ?? 0,
                  newPatients: dashboardStats.newPatients ?? 0,
                  activePatients: dashboardStats.activePatients ?? 0,
                  averageAge: dashboardStats.averageAge ?? 0,
                  commonConditions: Array.isArray(dashboardStats.commonConditions) ? dashboardStats.commonConditions : [],
                },
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
        {todaysAppointments.length === 0 ? (
          <Text style={{ color: theme.secondryTextColor, fontFamily: Fonts.Regular, fontSize: RFPercentage(2) }}>No appointments for today.</Text>
        ) : (
          todaysAppointments.map((appt, idx) => (
            <View style={styles.appointmentCard} key={appt._id || idx}>
              <View style={styles.appointmentHeader}>
                <View>
                  <Text style={styles.patientName}>{appt.patient?.name || 'Unknown'}</Text>
                  <Text style={styles.appointmentTime}>{appt.date ? new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
                  <Text style={styles.appointmentType}>{appt.type || 'Consultation'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => navigation.navigate(SCREENS.CALL, { appointmentId: appt._id })}>
                  <Text style={styles.joinButtonText}>Join Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorDashboard;
