'use client';

import {useState, useEffect} from 'react';
import { getDoctorAppointmentHistory } from '../../services/doctorService';
import { getToken } from '../../utils/tokenStorage';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Colors} from '../../Constants/themeColors';
import {Fonts} from '../../Constants/Fonts';
import {SCREENS} from '../../Constants/Screens';
import StackHeader from '../../components/Header/StackHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DoctorPatients = ({navigation, route}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  // Check if coming from analytics
  const isAnalyticsView = route?.params?.filter === 'analytics';
  const screenTitle = route?.params?.title || 'My Patients';

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await getToken();
        const res = await getDoctorAppointmentHistory(token);
        // Group by patient._id, get latest appointment for each
        const history = Array.isArray(res?.data?.history) ? res.data.history : [];
        const patientMap = {};
        history.forEach(appt => {
          const p = appt.patient;
          if (!p || !p._id) return;
          // If not seen or this appt is newer, update
          if (!patientMap[p._id] || new Date(appt.date) > new Date(patientMap[p._id].lastVisit)) {
            patientMap[p._id] = {
              id: p._id,
              name: p.name,
              age: p.dob ? Math.floor((Date.now() - new Date(p.dob)) / (365.25*24*60*60*1000)) : 'N/A',
              lastVisit: appt.date ? new Date(appt.date).toLocaleDateString() : 'N/A',
              diagnosis: appt.prescription?.diagnosis || 'Not Diagnosed yet',
            };
          }
        });
        setPatients(Object.values(patientMap));
      } catch (e) {
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Use analytics from navigation params if present, else fallback to default
  const analytics = isAnalyticsView && route?.params?.analytics
    ? route.params.analytics
    : {
        totalPatients: 0,
        newPatients: 0,
        activePatients: 0,
        averageAge: 0,
        commonConditions: [],
      };

  const PatientCard = ({item}) => (
    <TouchableOpacity
      style={[styles.patientCard, {backgroundColor: theme.secondryColor}]}
      onPress={() => navigation.navigate(SCREENS.PATIENT_PROFILE, {patient: item})}
    >
      <View style={styles.patientInfo}>
        <View style={styles.patientHeader}>
          <Text style={[styles.patientName, {color: theme.primaryTextColor}]}>
            {item.name}
          </Text>
        </View>
        <Text style={[styles.patientDetails, {color: theme.secondryTextColor}]}>Age: {item.age} • Last Visit: {item.lastVisit}</Text>
        <Text style={[styles.patientCondition, {color: theme.primaryColor}]}>Diagnosis: {item.diagnosis}</Text>
      </View>
    </TouchableOpacity>
  );

  const AnalyticsCard = ({title, value, icon, color, subtitle}) => (
    <View
      style={[styles.analyticsCard, {backgroundColor: theme.secondryColor}]}>
      <View style={styles.analyticsHeader}>
        <Icon name={icon} size={RFPercentage(3)} color={color} />
        <Text style={[styles.analyticsValue, {color}]}>{value}</Text>
      </View>
      <Text style={[styles.analyticsTitle, {color: theme.primaryTextColor}]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[styles.analyticsSubtitle, {color: theme.secondryTextColor}]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const renderAnalyticsView = () => (
    <View>
      <View style={styles.analyticsContainer}>
        <AnalyticsCard
          title="Total Patients"
          value={analytics.totalPatients ?? analytics.totalPatients ?? 0}
          icon="account-group"
          color={Colors.success}
        />
        <AnalyticsCard
          title="New This Week"
          value={
            typeof analytics.newThisWeek === 'number'
              ? analytics.newThisWeek
              : (typeof analytics.newPatients === 'number' ? analytics.newPatients : 0)
          }
          icon="account-plus"
          color={theme.primaryColor}
        />
        <AnalyticsCard
          title="Active Patients"
          value={analytics.activePatients ?? 0}
          icon="account-check"
          color={Colors.success}
        />
        <AnalyticsCard
          title="Average Age"
          value={`${analytics.averageAge ?? 0} years`}
          icon="calendar"
          color={theme.primaryColor}
        />
      </View>

      <Text style={[styles.sectionTitle, {color: theme.primaryTextColor}]}>
        Common Conditions
      </Text>
      <View
        style={[
          styles.conditionsContainer,
          {backgroundColor: theme.secondryColor},
        ]}>
        {(analytics.commonConditions || []).map((condition, index) => (
          <View key={index} style={styles.conditionItem}>
            <Text
              style={[styles.conditionName, {color: theme.primaryTextColor}]}>
              {condition.name}
            </Text>
            <Text style={[styles.conditionCount, {color: theme.primaryColor}]}>
              {condition.count} patients
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, {color: theme.primaryTextColor}]}>
        Recent Patients
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    listContainer: {
      padding: wp(4),
    },
    patientCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
      elevation: 2,
    },
    patientInfo: {
      flex: 1,
    },
    patientHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(0.5),
    },
    patientName: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
      marginRight: wp(2),
    },
    newBadge: {
      backgroundColor: Colors.success,
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.3),
      borderRadius: wp(1),
    },
    newBadgeText: {
      color: Colors.white,
      fontSize: RFPercentage(1.2),
      fontFamily: Fonts.Bold,
    },
    patientDetails: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      marginBottom: hp(0.5),
    },
    patientCondition: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
    },
    analyticsInfo: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
      marginTop: hp(0.5),
    },
    patientActions: {
      flexDirection: 'row',
    },
    actionButton: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
      borderRadius: wp(2),
      marginLeft: wp(2),
    },
    actionButtonText: {
      color: Colors.white,
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Medium,
    },
    analyticsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: hp(3),
    },
    analyticsCard: {
      width: '48%',
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
      elevation: 2,
    },
    analyticsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    analyticsValue: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
    },
    analyticsTitle: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
    },
    analyticsSubtitle: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.Regular,
      marginTop: hp(0.5),
    },
    sectionTitle: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
      marginBottom: hp(2),
    },
    conditionsContainer: {
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(3),
      elevation: 2,
    },
    conditionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.BorderGrayColor,
    },
    conditionName: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
    },
    conditionCount: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Regular,
      color: theme.secondryTextColor,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title={screenTitle} />
      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        renderItem={({item}) => <PatientCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={isAnalyticsView ? renderAnalyticsView : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{loading ? 'Loading...' : error || 'No patients found'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default DoctorPatients;
