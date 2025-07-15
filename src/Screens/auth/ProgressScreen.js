import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/themeColors';
import { useSelector } from 'react-redux';
import { SCREENS } from '../../Constants/Screens';




const ProgressScreen = () => {
  const [progress, setProgress] = useState(0);
  const navigation = useNavigation();
  const { isDarkMode } = useSelector((store) => store.theme);


  useEffect(() => {
    // Animate progress from 0% to 100%
    let interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          // Navigate to the next screen after completion
          setTimeout(() => {
            navigation.navigate(SCREENS.DASHBOARD); 
          }, 500);
          return prev;
        }
        return prev + 0.01; // Increment progress
      });
    }, 30); // Adjust interval speed for smoother animation

    return () => clearInterval(interval); // Cleanup interval
  }, [navigation]);



const styles = StyleSheet.create({
    container: {
      flex: 1,
    //   justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:isDarkMode? Colors.darkTheme.backgroundColor: Colors.lightTheme.backgroundColor,
      paddingTop: hp(15)
    },
    title: {
      fontSize: RFPercentage(3), // Responsive font size
      fontFamily: Fonts.Bold,
      color: isDarkMode?Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
      marginBottom: hp(3), // Spacing below title
      width: wp(60),
      textAlign: 'center'
    },
    progressText: {
      fontSize: RFPercentage(2.5), // Font size inside progress circle
      fontFamily: Fonts.Bold,
    },
    loadingText: {
      fontSize: RFPercentage(2), // Responsive font size for loading text
      fontFamily: Fonts.Thin,
      color: isDarkMode?Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
      marginTop: hp(2), // Spacing above loading text
    //   flex: 1,
    //   alignSelf: 'flex-end'
    //   bottom : hp()

    },
  });

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>We are setting up your account</Text>

      {/* Progress Circle */}
      <Progress.Circle
        size={wp(40)} // Responsive size
        progress={progress}
        showsText={true}
        textStyle={styles.progressText}
        thickness={wp(4)} // Responsive thickness
        color={isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor}
        unfilledColor={isDarkMode? Colors.darkTheme.secondryColor: "#F3E5F5"}
        borderWidth={0}
        formatText={() => `${Math.round(progress * 100)}%`} // Display percentage
      />

      {/* Loading Text */}
      <View style={{flex: 1, justifyContent: 'flex-end',paddingBottom: hp(10)}} >
      <Text style={styles.loadingText}>Loading...</Text>
      </View>
      
    </View>
  );
};

export default ProgressScreen;


