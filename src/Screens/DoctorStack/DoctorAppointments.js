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

const DoctorAppointments = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [appointments] = useState({
    upcoming: [
      {
        id: 1,
        patientName: 'John Doe',
        time: '10:00 AM',
        date: 'Today',
        type: 'Video Call',
        status: 'confirmed',
      },
      {
        id: 2,
        patientName: 'Jane Smith',
        time: '2:00 PM',
        date: 'Tomorrow',
        type: 'Video Call',
        status: 'pending',
      },
    ],
    completed: [
      {
        id: 3,
        patientName: 'Mike Johnson',
        time: '9:00 AM',
        date: 'Yesterday',
        type: 'Video Call',
        status: 'completed',
      },
    ],
    cancelled: [
      {
        id: 4,
        patientName: 'Sarah Wilson',
        time: '3:00 PM',
        date: 'Jan 10',
        type: 'Video Call',
        status: 'cancelled',
      },
    ],
  });

  const tabs = [
    {key: 'upcoming', label: 'Upcoming', count: appointments.upcoming.length},
    {
      key: 'completed',
      label: 'Completed',
      count: appointments.completed.length,
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: appointments.cancelled.length,
    },
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
      <FlatList
        data={appointments[selectedTab]}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <AppointmentCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {selectedTab} appointments found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default DoctorAppointments;
