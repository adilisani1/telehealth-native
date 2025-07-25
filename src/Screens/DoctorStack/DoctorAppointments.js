import React, {useState} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../../Constants/themeColors';
import {Fonts} from '../../Constants/Fonts';
import {SCREENS} from '../../Constants/Screens';
import StackHeader from '../../components/Header/StackHeader';
import AppointmentDetailsModal from '../../components/AppointmentDetailsModal';
import { useEffect, useCallback } from 'react';
import { getDoctorUpcomingAppointments, getDoctorCompletedAppointments, getDoctorAppointmentHistory, getDoctorCancelledAppointments } from '../../services/doctorService';
import { getToken } from '../../utils/tokenStorage';
import { debugAppointmentManagement, getCurrentAppointmentStatus } from '../../utils/appointmentManagementDebug';

const DoctorAppointments = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const React = require('react');
  const [selectedTab, setSelectedTab] = React.useState('upcoming');
  const [appointments, setAppointments] = React.useState({
    upcoming: [],
    completed: [],
    cancelled: [],
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [debugMode, setDebugMode] = React.useState(false); // Toggle this to true for debugging

  const mapAppointment = (a) => {
    console.log('🗂️ MAPPING APPOINTMENT STEP 1: Raw appointment received from backend');
    console.log('   - Appointment ID:', a._id);
    console.log('   - Raw appointment object:', JSON.stringify(a, null, 2));
    console.log('   - Patient object exists:', !!a.patient);
    console.log('   - Patient object:', a.patient);
    
    if (a.patient) {
      console.log('🔍 MAPPING APPOINTMENT STEP 2: Analyzing patient data in appointment');
      console.log('   - Patient._id:', a.patient._id);
      console.log('   - Patient.name:', a.patient.name);
      console.log('   - Patient.email:', a.patient.email);
      console.log('   - Patient.phone:', a.patient.phone);
      console.log('   - Patient.gender (CRITICAL):', a.patient.gender);
      console.log('   - Patient.sex:', a.patient.sex);
      console.log('   - Patient.dob:', a.patient.dob);
      console.log('   - All patient keys:', Object.keys(a.patient));
    } else {
      console.log('⚠️ MAPPING APPOINTMENT STEP 2: NO PATIENT OBJECT FOUND');
      console.log('   - PatientId direct:', a.patientId);
      console.log('   - PatientName direct:', a.patientName);
      console.log('   - PatientGender direct:', a.patientGender);
    }
    
    const mapped = {
      id: a._id,
      patientId: a.patient?._id || a.patient?.id || a.patientId,
      patientName: a.patient?.name || a.patient?.fullName || a.patientName || 'Unknown',
      // Enhanced patient data extraction
      patientEmail: a.patient?.email || a.patient?.emailAddress || a.patientEmail,
      patientPhone: a.patient?.phone || a.patient?.phoneNumber || a.patient?.mobile || a.patientPhone,
      patientAge: a.patient?.age || a.patientAge,
      patientGender: a.patient?.gender || a.patient?.sex || a.patientGender,
      patientDOB: a.patient?.dob || a.patient?.dateOfBirth || a.patientDOB,
      
      time: a.date ? new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      date: a.date ? new Date(a.date).toLocaleDateString() : '',
      dateISO: a.date, // Keep original ISO date for comparison
      type: a.type || a.appointmentType || 'Consultation',
      status: a.status || '',
      fee: a.fee || a.consultationFee,
      currency: a.currency || 'PKR',
      // Patient problem/symptoms fields
      problem: a.problem || a.patientProblem || a.symptoms || a.reasonForVisit || '',
      description: a.description || a.notes || '',
      symptoms: a.symptoms || '',
      reasonForVisit: a.reasonForVisit || '',
      // Additional appointment fields
      duration: a.duration || a.appointmentDuration,
      notes: a.notes || a.doctorNotes || '',
      priority: a.priority || 'normal',
      // Patient details (if included in appointment)
      patientDetails: a.patient || null,
      patient: a.patient || null, // Keep original patient object
    };
    
    console.log('✅ MAPPING APPOINTMENT STEP 3: Final mapped appointment');
    console.log('   - Mapped appointment ID:', mapped.id);
    console.log('   - Final patientId:', mapped.patientId);
    console.log('   - Final patientName:', mapped.patientName);
    console.log('   - Final patientEmail:', mapped.patientEmail);
    console.log('   - Final patientPhone:', mapped.patientPhone);
    console.log('   - Final patientGender (CRITICAL):', mapped.patientGender);
    console.log('   - Final patientDOB:', mapped.patientDOB);
    console.log('   - Final patientDetails exists:', !!mapped.patientDetails);
    console.log('   - Final patientDetails.gender:', mapped.patientDetails?.gender);
    console.log('   - Final patient object exists:', !!mapped.patient);
    console.log('   - Final patient.gender:', mapped.patient?.gender);
    
    return mapped;
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) {
        setError('You are not authorized. Please log in again.');
        setLoading(false);
        return;
      }
      const [upcomingRes, _dashboardRes, historyRes, cancelledRes] = await Promise.all([
        getDoctorUpcomingAppointments(token),
        getDoctorCompletedAppointments(token), // still fetched, but not used for completed tab
        getDoctorAppointmentHistory(token),
        getDoctorCancelledAppointments(token),
      ]);
      // ...existing code...
      const upcoming = Array.isArray(upcomingRes?.data?.appointments)
        ? upcomingRes.data.appointments.map(mapAppointment)
        : [];
      // Fix: completed appointments come from historyRes.data.history
      const completed = Array.isArray(historyRes?.data?.history)
        ? historyRes.data.history.map(mapAppointment)
        : [];
      const cancelled = Array.isArray(cancelledRes?.data?.appointments)
        ? cancelledRes.data.appointments.map(mapAppointment)
        : [];
      setAppointments({
        upcoming,
        completed,
        cancelled,
      });
    } catch (e) {
      setError(
        e?.message === 'Not authorized, no token'
          ? 'You are not authorized. Please log in again.'
          : 'Network error: Unable to fetch appointments. Please check your connection or API base URL.'
      );
      console.error('Error fetching appointments:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const tabs = [
    {key: 'upcoming', label: 'Upcoming', count: appointments.upcoming.length},
    {key: 'completed', label: 'Completed', count: appointments.completed.length},
    {key: 'cancelled', label: 'Cancelled', count: appointments.cancelled.length},
  ];

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'confirmed':
        return Colors.success;
      case 'requested':
      case 'pending':
        return Colors.warning;
      case 'completed':
        return Colors.info;
      case 'cancelled':
        return Colors.error;
      default:
        return theme.secondryTextColor;
    }
  };

  const handleAppointmentPress = (appointment) => {
    console.log('📱 Opening appointment modal for:', appointment);
    
    // Validate appointment data
    if (!appointment) {
      console.log('❌ Invalid appointment data');
      return;
    }
    
    // Check if we have necessary IDs
    const appointmentId = appointment.id || appointment._id;
    const patientId = appointment.patientId;
    
    console.log('🔍 Appointment ID:', appointmentId);
    console.log('🔍 Patient ID:', patientId);
    
    if (!appointmentId) {
      console.log('❌ Missing appointment ID');
      return;
    }
    
    if (!patientId) {
      console.log('⚠️ Missing patient ID, but continuing...');
    }
    
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentUpdated = () => {
    // Refresh appointments list when an appointment is updated
    fetchAppointments();
  };

  const AppointmentCard = ({item}) => (
    <TouchableOpacity
      style={[styles.appointmentCard, {backgroundColor: theme.secondryColor}]}
      onPress={() => handleAppointmentPress(item)}
      activeOpacity={0.7}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentInfo}>
          <Text style={[styles.patientName, {color: theme.primaryTextColor}]}>
            {item.patientName}
          </Text>
          <Text
            style={[styles.appointmentTime, {color: theme.secondryTextColor}]}>
            {item.time} • {item.date}
          </Text>
          <Text style={[styles.appointmentType, {color: theme.primaryColor}]}>
            {item.type}
          </Text>
          {item.fee && (
            <Text style={[styles.appointmentFee, {color: theme.secondryTextColor}]}>
              {item.currency || 'PKR'} {item.fee}
            </Text>
          )}
        </View>
        <View style={styles.appointmentActions}>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(item.status)},
            ]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          
          {/* Show different actions based on status */}
          {item.status === 'requested' && (
            <View style={styles.requestedActions}>
              <Icon 
                name="clock-alert-outline" 
                size={RFPercentage(2.5)} 
                color={Colors.warning} 
              />
              <Text style={[styles.actionHint, {color: theme.secondryTextColor}]}>
                Tap to respond
              </Text>
            </View>
          )}
          
          {item.status === 'accepted' && (
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: Colors.success}]}
              onPress={() => navigation.navigate(SCREENS.CALL)}>
              <Icon name="video" size={RFPercentage(2)} color={Colors.white} />
            </TouchableOpacity>
          )}
          
          {/* Show complete option for accepted appointments that are past due */}
          {item.status === 'accepted' && new Date(item.dateISO) < new Date() && (
            <View style={styles.completionHint}>
              <Icon 
                name="check-circle-outline" 
                size={RFPercentage(2)} 
                color={Colors.info} 
              />
              <Text style={[styles.actionHint, {color: Colors.info}]}>
                Can complete
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const TabButton = ({tab}) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab.key && styles.activeTab]}
      onPress={() => setSelectedTab(tab.key)}>
      <Text
        style={[
          styles.tabText,
          selectedTab === tab.key
            ? styles.activeTabText
            : {color: theme.secondryTextColor},
        ]}>
        {tab.label} ({tab.count})
      </Text>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.secondryColor,
      margin: wp(4),
      borderRadius: wp(3),
      padding: wp(1),
    },
    tabButton: {
      flex: 1,
      paddingVertical: hp(1.5),
      alignItems: 'center',
      borderRadius: wp(2),
    },
    activeTab: {
      backgroundColor: theme.primaryColor,
    },
    tabText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
    },
    activeTabText: {
      color: Colors.white,
    },
    listContainer: {
      paddingHorizontal: wp(4),
    },
    appointmentCard: {
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
      elevation: 2,
    },
    appointmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    appointmentInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
      marginBottom: hp(0.5),
    },
    appointmentTime: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      marginBottom: hp(0.5),
    },
    appointmentType: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
    },
    appointmentFee: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Medium,
      marginTop: hp(0.3),
    },
    appointmentActions: {
      alignItems: 'flex-end',
    },
    requestedActions: {
      alignItems: 'center',
      marginTop: hp(0.5),
    },
    completionHint: {
      alignItems: 'center',
      marginTop: hp(0.5),
    },
    actionHint: {
      fontSize: RFPercentage(1.2),
      fontFamily: Fonts.Regular,
      marginTop: hp(0.2),
      textAlign: 'center',
    },
    statusBadge: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: wp(2),
      marginBottom: hp(1),
    },
    statusText: {
      color: Colors.white,
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.Medium,
    },
    actionButton: {
      padding: wp(2),
      borderRadius: wp(2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: hp(10),
    },
    emptyText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: theme.secondryTextColor,
      textAlign: 'center',
    },
    // Debug Panel Styles
    debugContainer: {
      backgroundColor: '#f0f0f0',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: wp(2),
      margin: wp(4),
      padding: wp(3),
    },
    debugTitle: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Bold,
      color: '#333',
      textAlign: 'center',
      marginBottom: hp(1),
    },
    debugButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    debugButton: {
      backgroundColor: Colors.primary,
      padding: wp(2),
      borderRadius: wp(1.5),
      flex: 0.48,
      alignItems: 'center',
    },
    debugButtonText: {
      color: Colors.white,
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Medium,
    },
    hiddenDebugTrigger: {
      position: 'absolute',
      top: hp(12),
      left: wp(90),
      width: wp(5),
      height: hp(3),
      backgroundColor: 'transparent',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="My Appointments" />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TabButton key={tab.key} tab={tab} />
        ))}
      </View>

      {/* Debug Panel - Only shown when debugMode is true */}
      {debugMode && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>🔧 Debug Panel</Text>
          <View style={styles.debugButtonsRow}>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={async () => {
                console.log('🔍 Running full debug...');
                const result = await debugAppointmentManagement();
                console.log('Debug result:', result);
              }}
            >
              <Text style={styles.debugButtonText}>Run Full Debug</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={async () => {
                console.log('📊 Getting appointment status...');
                const status = await getCurrentAppointmentStatus();
                console.log('Current status:', status);
              }}
            >
              <Text style={styles.debugButtonText}>Check Status</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.debugButton, {backgroundColor: Colors.error}]}
            onPress={() => setDebugMode(false)}
          >
            <Text style={styles.debugButtonText}>Hide Debug</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Debug Mode Toggle - Double tap to enable */}
      {!debugMode && (
        <TouchableOpacity 
          style={styles.hiddenDebugTrigger}
          onPress={() => {}}
          onLongPress={() => {
            console.log('Debug mode enabled!');
            setDebugMode(true);
          }}
        />
      )}

      {/* Appointments List */}
      {error ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: Colors.error}]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={appointments[selectedTab]}
          keyExtractor={item => item._id || item.id?.toString()}
          renderItem={({item}) => <AppointmentCard item={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchAppointments}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading...' : `No ${selectedTab} appointments found`}
              </Text>
            </View>
          }
        />
      )}

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        visible={modalVisible}
        onClose={handleModalClose}
        appointment={selectedAppointment}
        onAppointmentUpdated={handleAppointmentUpdated}
      />
    </SafeAreaView>
  );
};

export default DoctorAppointments;
