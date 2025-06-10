import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar, TabBarItem } from 'react-native-tab-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../Constants/themeColors';
import { useSelector } from 'react-redux';
import { Fonts } from '../../Constants/Fonts';
import StackHeader from '../../components/Header/StackHeader';
import CustomButton from '../../components/Buttons/customButton';
import { AirbnbRating } from 'react-native-ratings';
import { SCREENS } from '../../Constants/Screens';
import { Images } from '../../assets/Images/images';

const dummyData = {
  doctor: [
    {
      id: '1',
      name: 'Dr. Kenny Adeola',
      specialty: 'General practitioner',
      image: Images.dr1,
      reviews: '52 Reviews',
      rating: 4.5,
    },
    {
      id: '2',
      name: 'Dr. Taiwo Abdulsalaam',
      specialty: 'General practitioner',
      image: Images.dr2,
      reviews: '56 Reviews',
      rating: 4.8,
    },
  ],
  pharmacy: [
    {
      id: '1',
      name: 'PharmaCare Plus',
      specialty: '24/7 Service',
      image: Images.pharmacy,
      reviews: '30 Reviews',
      rating: 4.2,
    },
    {
      id: '2',
      name: 'HealthMed Pharmacy',
      specialty: 'Prescription Drugs',
      image: Images.pharmacy,
      reviews: '45 Reviews',
      rating: 4.6,
    },
  ],
  ambulance: [
    {
      id: '1',
      name: 'FastResponse Ambulance',
      specialty: 'Emergency Service',
      image: Images.ambulance,
      reviews: '70 Reviews',
      rating: 4.7,
    },
    {
      id: '2',
      name: 'CareFirst Ambulance',
      specialty: 'Non-Emergency Transport',
      image: Images.ambulance,
      reviews: '55 Reviews',
      rating: 4.4,
    },
  ],
};



const Favourites = ({navigation}) => {
  const [index, setIndex] = useState(0);
  const { isDarkMode } = useSelector(store => store.theme);
  const [routes] = useState([
    { key: 'doctor', title: 'Doctor' },
    { key: 'pharmacy', title: 'Pharmacy' },
    { key: 'ambulance', title: 'Ambulance' },
  ]);


  const AmbulanceTab = () => (
    <FlatList
      data={dummyData.ambulance}
      renderItem={({ item }) => <Card item={item} who={'ambulance'} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );


  const Card = ({ item , who}) => (
    <TouchableOpacity onPress={() =>navigation.navigate(SCREENS.DETAILS, {who: who})}  style={styles.card}>
      {/* Item Image */}
      <View style={{ flexDirection: 'row' }} >
        <Image source={item.image} style={styles.image} />
        {/* Item Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.professionalText}><Icon name="star" size={RFPercentage(1.3)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} /> Professional Service</Text>
            <CustomButton icon={'cards-heart'} iconSize={RFPercentage(3)} iconColor={isDarkMode ? Colors.darkTheme.primaryColor : Colors.darkTheme.primaryColor} />
            {/* <Icon name="favorite" size={RFPercentage(3)} color="green" /> */}
          </View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          {/* Rating and Reviews */}
          <View style={styles.ratingContainer}>
            <AirbnbRating
              count={5}
              showRating={false}
              defaultRating={5}
              size={RFPercentage(2)}
              // starImage={<Images.food1 />}
              // ratingContainerStyle={{marginBottom: 20, width: 50}}
              onFinishRating={value => {
                // setRating(value);
              }}
            />
            <Text style={styles.reviewsText}>{item.reviews}</Text>
          </View>
          {/* Button */}
        </View>
      </View>
      <CustomButton containerStyle={styles.btn} text={'Make Appointment'} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} onPress={() => navigation.navigate(SCREENS.NEWAPPOINTMENT, { title: 'Make Appointment' })} />
    </TouchableOpacity>
  );

  const DoctorTab = () => (
    <FlatList
      data={dummyData.doctor}
      renderItem={({ item }) => <Card item={item} who={'doctor'} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );

  const PharmacyTab = () => (
    <FlatList
      data={dummyData.pharmacy}
      renderItem={({ item }) => <Card item={item} who={'pharmacy'} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );



  const renderScene = SceneMap({
    doctor: DoctorTab,
    pharmacy: PharmacyTab,
    ambulance: AmbulanceTab,
  });


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
    },
    listContainer: {
      paddingTop: hp(3),
      paddingHorizontal: wp('6%'),
    },
    card: {
      // flexDirection: 'row',
      backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.secondryColor,
      elevation: 2,
      borderRadius: wp('2%'),
      marginBottom: hp('2%'),
      paddingHorizontal: wp('4%'),
      paddingVertical: wp('2%'),
    },
    image: {
      width: wp('20%'),
      height: wp('20%'),
      borderRadius: wp('10%'),
      marginRight: wp('4%'),
    },
    detailsContainer: {
      flex: 1,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    professionalText: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      backgroundColor: isDarkMode ? `${Colors.darkTheme.primaryColor}40` : `${Colors.lightTheme.primaryColor}40`,
      paddingHorizontal: wp(2),
      borderRadius: wp(4),
    },
    name: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Bold,
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
      marginTop: hp('0.5%'),
    },
    specialty: {
      fontSize: RFPercentage(1.7),
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      marginTop: hp('0.3%'),
      // marginBottom: hp('0.2%'),
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp('0.5%'),
      marginBottom: hp('1%'),
      justifyContent: 'space-between',
      paddingHorizontal: wp(3)
    },
  
    reviewsText: {
      fontSize: RFPercentage(1.5),
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      borderLeftColor: isDarkMode?Colors.darkTheme.BorderGrayColor: Colors.lightTheme.secondryTextColor,
      borderLeftWidth: 1,
      paddingLeft: wp(2),

    },
    btn: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      // marginTop: hp(2),
      marginBottom: hp(1),
      marginHorizontal: wp(0)
    },
    btnText: {
      color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: RFPercentage(2),

    },

  });


  return (
    <View style={styles.container}>
      {/* Header */}
      <StackHeader title={'Favourites'} headerStyle={{ paddingBottom: hp(1) }} rightIcon={<Icon name='magnify' size={wp(8)} color={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor} />} />

      {/* Tab View */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: wp('100%') }}
        style={{ flex: 1, }}
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



export default Favourites;
