import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Svgs } from '../../assets/Svgs/Svg';
import { scaleHeight, scaleWidth, normalizeFontSize } from '../../utils/responsive';
import CustomButton from '../../components/Buttons/customButton';
import { Fonts } from '../../Constants/Fonts';
import PagerView from 'react-native-pager-view';
import { SCREENS } from '../../Constants/Screens';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import images from '../../assets/Images/onboarding1.png';
import { Images } from '../../assets/Images/images';
const Onboarding = ({navigation}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  // 7:09 68%
  // 7:23 72%
  // 7:41 80% 
  // 8:00 86% 
  
  const pages = [
      {
          image: Images.onboarding3,
//          title: 'Talk to a Doctor',
                    title: "Let's get started",

//          subtitle: 'Connects Patient with Doctor who shares their language and ethnicity',
          subtitle: 'Swipe to wellness.',

      },
//      {
//          image: Images.onboarding1,
//          title: 'Call an ambulance',
//          subtitle: 'Request for an ambulance 24/7 through MyDoctor app',
//      },
      {
          image: Images.onboarding5,
//          title: 'Schedule an appointment',
          subtitle: 'Schedule an appointment with a certified doctor ',
      },
  ];
  const [currentPage, setCurrentPage] = useState(0); 
  const pagerRef = useRef(null); 
  const handleContinue = () => {
    if (currentPage < pages.length - 1) {
      pagerRef.current.setPage(currentPage + 1);
    } else {
      navigation.navigate(SCREENS.WELCOME)
    }
  };
  const lastPage = currentPage === pages.length - 1
  const firstPage = currentPage === 0;
  const onPageSelected = (e) => {
    setCurrentPage(e.nativeEvent.position);

  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor: Colors.lightTheme.backgroundColor,
      paddingVertical: scaleHeight(5),
    },
    skipBtn: {
      color: Colors.lightTheme.secondryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: normalizeFontSize(2.3),
      alignSelf: 'flex-end',
      marginRight: scaleWidth(8)
    },
    imgContainer: {
      alignItems: 'center',
    },
    text: {
      color: isDarkMode? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontSize: normalizeFontSize(17),
      fontFamily: Fonts.Bold,
      textAlign: 'center',
      marginTop: scaleHeight(8),
      width: scaleWidth(300),
    },
    subHeading: {
      color: isDarkMode? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontSize: normalizeFontSize(14),
      textAlign: 'center',
      marginTop: scaleHeight(3),
      fontFamily: Fonts.Regular,
      paddingHorizontal: scaleWidth(20)
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    dot: {
      height: scaleHeight(2),
      borderRadius: scaleHeight(2.5),
      marginHorizontal: scaleWidth(1),
    },
    btn: {
      backgroundColor: isDarkMode? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: scaleHeight(13),
      borderRadius: scaleWidth(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnText:{
      color: isDarkMode? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.Bold,
      fontSize: normalizeFontSize(14),
    }

  });

  const renderPaginationDots = () => {
    return (
      <View
        style={[styles.paginationContainer]}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                // backgroundColor: currentPage === index ? Colors.lightTheme.primaryColor : Colors.lightTheme.BorderGrayColor  ,
                backgroundColor: currentPage === index ? isDarkMode? Colors.darkTheme.primaryTextColor :Colors.lightTheme.BorderGrayColor: isDarkMode? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor  ,
                width: currentPage === index ? scaleWidth(50) : scaleWidth(10),
                height: scaleHeight(7),
                borderColor: Colors.lightTheme.BorderGrayColor,
                borderWidth: 1,
                borderRadius: scaleWidth(4),
              },
            ]}
          />
        ))}
      </View>
    );
  };
  return (
    <View style={styles.container}>
    <View style={{ flex: 10, paddingTop: scaleHeight(200) , }}>
      <PagerView
        style={[{ height: scaleHeight(450),  }, lastPage && { marginTop: scaleHeight(3) }]}
        initialPage={0}
        onPageSelected={onPageSelected}
        ref={pagerRef} 
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.imgContainer}>
            <Image source={page.image} style={{ width: scaleWidth(300), height: scaleHeight(300) }}/>
            <Text style={styles.text}>{page.title}</Text>
            {page.subtitle && (
              <Text
                style={styles.subHeading}>
                {page.subtitle}
              </Text>
            )}
          </View>
        ))}
      </PagerView>
       {renderPaginationDots()}
    </View>
    <View style={{paddingHorizontal: scaleWidth(20), marginBottom: scaleHeight(10)}} >
    <CustomButton containerStyle={styles.btn} text={lastPage ? 'Get Started': 'Next'} textStyle={styles.btnText} onPress={handleContinue}  />
    </View>
  </View>
  )
}

export default Onboarding

