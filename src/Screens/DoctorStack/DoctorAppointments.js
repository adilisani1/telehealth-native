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
import { useEffect, useCallback } from 'react';
import { getDoctorUpcomingAppointments, getDoctorCompletedAppointments, getDoctorAppointmentHistory, getDoctorCancelledAppointments } from '../../services/doctorService';
import { getToken } from '../../utils/tokenStorage';

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

  const mapAppointment = (a) => {
    console.log('Mapping appointment:', a);
    return {
      id: a._id,
      patientName: a.patient?.name || 'Unknown',
      time: a.date ? new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      date: a.date ? new Date(a.date).toLocaleDateString() : '',
      type: a.type || 'Consultation',
      status: a.status || '',
    };
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
      const completed = Array.isArray(historyRes?.data?.appointments)
        ? historyRes.data.appointments.filter(a => a.status === 'completed').map(mapAppointment)
        : Array.isArray(historyRes)
        ? historyRes.filter(a => a.status === 'completed').map(mapAppointment)
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
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'pending':
        return Colors.error;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return theme.secondryTextColor;
    }
  };

  const AppointmentCard = ({item}) => (
    <View
      style={[styles.appointmentCard, {backgroundColor: theme.secondryColor}]}>
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
          {item.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: Colors.success}]}
              onPress={() => navigation.navigate(SCREENS.CALL)}>
              <Icon name="video" size={RFPercentage(2)} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
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
    appointmentActions: {
      alignItems: 'flex-end',
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
    </SafeAreaView>
  );
};

export default DoctorAppointments;
