'use client';

import {useState} from 'react';
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

  const [patients] = useState([
    {
      id: 1,
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      lastVisit: '2024-01-15',
      condition: 'Hypertension',
      phone: '+1234567890',
      email: 'john.doe@email.com',
      address: '123 Main St, New York, NY',
      bloodGroup: 'O+',
      allergies: 'Penicillin, Peanuts',
      medicalHistory: 'Hypertension, High Cholesterol',
      status: 'active',
      totalVisits: 12,
      lastPayment: '$100',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      gender: 'Female',
      lastVisit: '2024-01-10',
      condition: 'Diabetes',
      phone: '+1234567891',
      email: 'jane.smith@email.com',
      address: '456 Oak Ave, Los Angeles, CA',
      bloodGroup: 'A+',
      allergies: 'None',
      medicalHistory: 'Type 2 Diabetes, Thyroid',
      status: 'new',
      totalVisits: 3,
      lastPayment: '$80',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      age: 42,
      gender: 'Male',
      lastVisit: '2024-01-08',
      condition: 'Heart Disease',
      phone: '+1234567892',
      email: 'mike.johnson@email.com',
      address: '789 Pine St, Chicago, IL',
      bloodGroup: 'B+',
      allergies: 'Shellfish',
      medicalHistory: 'Coronary Artery Disease, Hypertension',
      status: 'active',
      totalVisits: 8,
      lastPayment: '$120',
    },
  ]);

  const [analytics] = useState({
    totalPatients: 45,
    newThisWeek: 3,
    activePatients: 42,
    averageAge: 35,
    commonConditions: [
      {name: 'Hypertension', count: 15},
      {name: 'Diabetes', count: 12},
      {name: 'Heart Disease', count: 8},
    ],
  });

  const PatientCard = ({item}) => (
    <TouchableOpacity
      style={[styles.patientCard, {backgroundColor: theme.secondryColor}]}
      onPress={() =>
        navigation.navigate(SCREENS.PATIENT_PROFILE, {patient: item})
      }>
      <View style={styles.patientInfo}>
        <View style={styles.patientHeader}>
          <Text style={[styles.patientName, {color: theme.primaryTextColor}]}>
            {item.name}
          </Text>
          {item.status === 'new' && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={[styles.patientDetails, {color: theme.secondryTextColor}]}>
          Age: {item.age} • Last Visit: {item.lastVisit}
        </Text>
        <Text style={[styles.patientCondition, {color: theme.primaryColor}]}>
          {item.condition}
        </Text>
        {isAnalyticsView && (
          <Text
            style={[styles.analyticsInfo, {color: theme.secondryTextColor}]}>
            Total Visits: {item.totalVisits} • Last Payment: {item.lastPayment}
          </Text>
        )}
      </View>
      <View style={styles.patientActions}>
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: Colors.success}]}
          onPress={() => navigation.navigate(SCREENS.CALL)}>
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: theme.primaryColor}]}
          onPress={() => navigation.navigate(SCREENS.CHAT)}>
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>
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
          value={analytics.totalPatients}
          icon="account-group"
          color={Colors.success}
        />
        <AnalyticsCard
          title="New This Week"
          value={analytics.newThisWeek}
          icon="account-plus"
          color={theme.primaryColor}
        />
        <AnalyticsCard
          title="Active Patients"
          value={analytics.activePatients}
          icon="account-check"
          color={Colors.success}
        />
        <AnalyticsCard
          title="Average Age"
          value={`${analytics.averageAge} years`}
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
        {analytics.commonConditions.map((condition, index) => (
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
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <PatientCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={isAnalyticsView ? renderAnalyticsView : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default DoctorPatients;
