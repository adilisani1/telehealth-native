// import React from 'react';
// import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import { RFPercentage } from 'react-native-responsive-fontsize';
// import StackHeader from '../../components/Header/StackHeader';
// import { useSelector } from 'react-redux';
// import { Colors } from '../../Constants/themeColors';
// import StatCard from '../../components/Card/StatCard';
// import CommunicationCard from '../../components/Card/CommuntcationCard';
// import { ScrollView } from 'react-native';
// import { Fonts } from '../../Constants/Fonts';
// import CustomButton from '../../components/Buttons/customButton';
// import { SCREENS } from '../../Constants/Screens';
// import { Images } from '../../assets/Images/images';

// const DoctorDetails = ({navigation}) => {
//     const { isDarkMode } = useSelector(store => store.theme);




//     const styles = StyleSheet.create({
//         container: {
//             flex: 1,
//             backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
//             paddingHorizontal: wp(5),
//         },
//         header: {
//             marginVertical: hp(2),
//             flexDirection: 'row',
//             alignItems: 'center',
//         },
//         profileContainer: {
//             alignItems: 'center',
//             marginBottom: hp(3),
//         },
//         profileImage: {
//             width: wp(25),
//             height: wp(25),
//             borderRadius: wp(12.5),
//             marginBottom: hp(2),
//         },
//         name: {
//             fontSize: RFPercentage(3),
//             fontFamily: Fonts.Bold,
//             color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
//         },
//         specialization: {
//             fontSize: RFPercentage(2),
//             fontFamily: Fonts.Regular,
//             color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
//         },
//         statsContainer: {
//             flexDirection: 'row',
//             justifyContent: 'space-around',
//             marginVertical: hp(2),
//         },
//         aboutContainer: {
//             marginVertical: hp(2),
//         },
//         sectionTitle: {
//             fontSize: RFPercentage(2.2),
//             fontFamily: Fonts.Bold,
//             color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
//             marginBottom: hp(1),
//         },
//         aboutText: {
//             fontSize: RFPercentage(1.8),
//             fontFamily: Fonts.Regular,
//             color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
//             lineHeight: hp(2.5),
//         },
//         workingContainer: {
//             marginVertical: hp(2),
//         },
//         workingText: {
//             fontSize: RFPercentage(1.8),
//             fontFamily: Fonts.Regular,
//             color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
//         },
//         btn: {
//             backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
//             paddingVertical: hp(1.5),
//             borderRadius: wp(2),
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginVertical: hp(2),
//             // borderColor:  isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
//             // borderWidth: scaleHeight(2)
//           },
//           btnText: {
//             color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
//             fontFamily: Fonts.Bold,
//             fontSize: RFPercentage(2),
            
//           },

        
//     });
//     return (
//         <SafeAreaView style={styles.container}>
//             <ScrollView showsVerticalScrollIndicator={false} >
//                 <StackHeader showTitle={false} backIconColor={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor} />

//                 {/* Doctor Profile */}
//                 <View style={styles.profileContainer}>
//                     <Image
//                         source={Images.dr2}
//                         style={styles.profileImage}
//                     />
//                     <Text style={styles.name}>Dr. Taiwo Abdulsalam</Text>
//                     <Text style={styles.specialization}>Oncologists</Text>
//                 </View>

//                 {/* Statistics */}
//                 <View style={styles.statsContainer}>
//                     <StatCard iconName="people-outline" value="1000+" label="Patients" iconColor={'#7acefa'} />
//                     <StatCard iconName="workspace-premium" value="10 Yrs" label="Experience" iconColor={'#e8899e'} />
//                     <StatCard iconName="star-outline" value="4.5" label="Ratings" iconColor={'#f7c481'} />

//                 </View>

//                 {/* About Doctor */}
//                 <View style={styles.aboutContainer}>
//                     <Text style={styles.sectionTitle}>About Doctor</Text>
//                     <Text style={styles.aboutText}>
//                         Dr. Bellamy Nicholas is a top specialist at London Bridge Hospital at London. He has
//                         achieved several awards and recognition for his contribution and service in his own
//                         field. He is available for private consultation.
//                     </Text>
//                 </View>

//                 {/* Working Time */}
//                 <View style={styles.workingContainer}>
//                     <Text style={styles.sectionTitle}>Working time</Text>
//                     <Text style={styles.workingText}>Mon - Sat (08:30 AM - 09:00 PM)</Text>
//                 </View>

//                 {/* Communication */}
//                 <View style={styles.communicationContainer}>
//                     <Text style={styles.sectionTitle}>Communication</Text>
//                     <CommunicationCard
//                         iconName="chat"
//                         title="Messaging"
//                         subtitle="Chat me up, share photos"
//                         backgroundColor='#e8899e'
//                         onPress={()=> navigation.navigate(SCREENS.CHAT)}
//                     />
//                     {/* <CommunicationCard
//                         iconName="call"
//                         title="Audio Call"
//                         subtitle="Call your doctor directly"
//                         backgroundColor={`#7acefa`}
//                     />
//                     <CommunicationCard
//                         iconName="videocam"
//                         title="Video Call"
//                         subtitle="See your doctor live"
//                         backgroundColor='#f7c481'
//                     /> */}
//                 </View>


//                 <CustomButton containerStyle={styles.btn} text={'New Appointment'} textStyle={[styles.btnText, {color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,}]} onPress={()=>navigation.navigate(SCREENS.NEWAPPOINTMENT)} />

//             </ScrollView>
//             {/* Header */}

//         </SafeAreaView>
//     );
// };


// export default DoctorDetails;


import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import StackHeader from '../../components/Header/StackHeader';
import StatCard from '../../components/Card/StatCard';
import CommunicationCard from '../../components/Card/CommuntcationCard';
import CustomButton from '../../components/Buttons/customButton';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';

const Details = ({
  navigation,
  title,
  subtitle,
  profileImage,
  stats,
  aboutText,
  workingTime,
  communicationOptions,
  buttonLabel,
  buttonAction,
}) => {
  const { isDarkMode } = useSelector((store) => store.theme);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(5),
    },
    profileContainer: {
      alignItems: 'center',
      marginBottom: hp(3),
    },
    profileImage: {
      width: wp(25),
      height: wp(25),
      borderRadius: wp(12.5),
      marginBottom: hp(2),
    },
    name: {
      fontSize: RFPercentage(3),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
    },
    specialization: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: hp(2),
    },
    aboutContainer: {
      marginVertical: hp(2),
    },
    sectionTitle: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
    },
    aboutText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
      lineHeight: hp(2.5),
    },
    workingContainer: {
      marginVertical: hp(2),
    },
    workingText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
    },
    btn: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: hp(2),
    },
    btnText: {
      color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: RFPercentage(2),
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StackHeader showTitle={false} backIconColor={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor} />

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image source={profileImage} style={styles.profileImage} />
          <Text style={styles.name}>{title}</Text>
          <Text style={styles.specialization}>{subtitle}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              iconColor={stat.iconColor}
            />
          ))}
        </View>

        {/* About Section */}
        <View style={styles.aboutContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{aboutText}</Text>
        </View>

        {/* Working Time */}
        {workingTime && (
          <View style={styles.workingContainer}>
            <Text style={styles.sectionTitle}>Working Time</Text>
            <Text style={styles.workingText}>{workingTime}</Text>
          </View>
        )}

        {/* Communication Options */}
        {communicationOptions && (
          <View>
            <Text style={styles.sectionTitle}>Communication</Text>
            {communicationOptions.map((option, index) => (
              <CommunicationCard
                key={index}
                iconName={option.iconName}
                title={option.title}
                subtitle={option.subtitle}
                backgroundColor={option.backgroundColor}
                onPress={option.onPress}
              />
            ))}
          </View>
        )}

        {/* Action Button */}
        {buttonLabel && (
          <CustomButton
            containerStyle={styles.btn}
            text={buttonLabel}
            textStyle={styles.btnText}
            onPress={buttonAction}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Details;

