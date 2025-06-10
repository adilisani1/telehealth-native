import React, { useRef, useState } from 'react';
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

const dummyData = {
  upcoming: [
    {
      id: '1',
      name: 'Dr. Kenny Adeola',
      specialty: 'General practitioner',
      date: 'Nov 19, 2023 - 9:00 AM',
      bookingId: '#12345A67B',
      status: 'Online',
      image: Images.dr1,
    },
    {
      id: '2',
      name: 'Dr. Taiwo Abdulsalaam',
      specialty: 'General practitioner',
      date: 'Nov 26, 2023 - 9:00 AM',
      bookingId: '#48345e27C',
      status: 'Offline',
      image: Images.dr2,
    },
  ],
  completed: [
    {
      id: '1',
      name: 'Dr. Kenny Adeola',
      specialty: 'General practitioner',
      date: 'Nov 19, 2023 - 9:00 AM',
      bookingId: '#12345A67B',
      image: Images.dr3,
    },
    {
      id: '2',
      name: 'Dr. Taiwo Abdulsalaam',
      specialty: 'General practitioner',
      date: 'Nov 26, 2023 - 9:00 AM',
      bookingId: '#48345e27C',
      image: Images.dr4,
    },
  ],
  cancelled: [
    {
      id: '1',
      name: 'Dr. Kenny Adeola',
      specialty: 'General practitioner',
      date: 'Nov 19, 2023 - 9:00 AM',
      bookingId: '#12345A67B',
      image: Images.dr1,
    },
    {
      id: '2',
      name: 'Dr. Taiwo Abdulsalaam',
      specialty: 'General practitioner',
      date: 'Nov 26, 2023 - 9:00 AM',
      bookingId: '#48345e27C',
      image: Images.dr2,
    },
  ],
};

const AllAppointment = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const { isDarkMode } = useSelector(store => store.theme);
  const reviewSheet_Ref = useRef()
  const [routes] = useState([
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'completed', title: 'Completed' },
    { key: 'cancelled', title: 'Cancelled' },
  ]);

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
    <FlatList
      data={dummyData.upcoming}
      style={{ paddingTop: hp(3) }}
      renderItem={({ item }) => (
        <Card
        onPress={() => navigation.navigate(SCREENS.MYAPPOINTMENT)}
          item={item}
          actionButtons={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: wp(78),
              }}>
              <CustomButton containerStyle={[styles.btn]} mode={true} text={'Cancel'} textStyle={[styles.btnText]} onPress={()=>navigation.navigate(SCREENS.CANCELAPPOINTMENT)} />

              <CustomButton containerStyle={[styles.btn]} text={'Reschedule'} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]}  onPress={()=> navigation.navigate(SCREENS.NEWAPPOINTMENT, {title: 'Reschedule Appointment'})}/>


            </View>
          }
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );

  const CompletedTab = () => (
    <FlatList
      data={dummyData.completed}
      style={{ paddingTop: hp(3) }}
      renderItem={({ item }) => (
        <Card
          item={item}
          onPress={() => navigation.navigate(SCREENS.MYAPPOINTMENT)}
          actionButtons={
            <>
              <CustomButton containerStyle={[styles.btn]} mode={true} text={'Re-Book'} textStyle={[styles.btnText]}  onPress={()=> navigation.navigate(SCREENS.NEWAPPOINTMENT, {title: 'Re-Book Appointment'})}/>

              <CustomButton containerStyle={[styles.btn]} text={'Add a Review'} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} />


            </>
          }
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );

  const CancelledTab = () => (
    <FlatList
      data={dummyData.cancelled}
      style={{ paddingTop: hp(3) }}
      renderItem={({ item }) => (
        <Card
          item={item}
          onPress={() => navigation.navigate(SCREENS.MYAPPOINTMENT)}
          actionButtons={
            <CustomButton containerStyle={[styles.btn, { width: wp(80) }]} text={'Add a Review '} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} />
          }
        />
      )}
      keyExtractor={(item) => item.id}
    />
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

  return (
    <View style={styles.container}>
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

    </View>
  );
};



export default AllAppointment;
