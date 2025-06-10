import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    Image
  } from 'react-native';
  import React from 'react';
  import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from 'react-native-responsive-screen';
  import Ionicons from 'react-native-vector-icons/Ionicons';
  import {RFPercentage} from 'react-native-responsive-fontsize';
  import {useNavigation} from '@react-navigation/native';
  import { Fonts } from '../../Constants/Fonts';
  import { useSelector } from 'react-redux';
  import { Colors } from '../../Constants/themeColors';
import { Images } from '../../assets/Images/images';
  const ChatHeader = ({title, profile, rightIcon}) => {
    const navigation = useNavigation();
      const { isDarkMode } = useSelector(store => store.theme);
  
   
        const styles = StyleSheet.create({
          header: {
            justifyContent: 'center',
            paddingVertical: 15,
            borderBottomColor: isDarkMode?Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor,
            borderBottomWidth: wp(0.5),
            backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.secondryColor
          },
          headerView: {
            width: wp(100),
            flexDirection: 'row',
            alignItems: 'center',
          },
          iconContainer: {
            paddingLeft: wp(5),
            justifyContent: 'center',
            alignItems: 'center',
          },
          headerTextContainer: {
            flex: 1,
          },
          mainText: {
            color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
            fontFamily: Fonts.Medium,
            fontSize: RFPercentage(2.2),
          },
          doctorImage: {
                width: wp(12),
                height: wp(12),
                borderRadius: wp(6),
                marginHorizontal: wp(4)
              },
        });
        
    return (
      <View style={styles.header}>
        <View style={styles.headerView}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.iconContainer}>
            <Ionicons name={'arrow-back-outline'} size={hp(3)} color={isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.secondryTextColor} />
          </TouchableOpacity>
          {/* <View style={{backgroundColor: Colors.lightTheme.primaryColor, paddingHorizontal: wp(4),paddingVertical: wp(2.2), borderRadius: wp(10),marginRight: wp(2) }} ><Text style={{color: Colors.lightTheme.primaryBtn.TextColor, fontSize: RFPercentage(2.4), padding: 0, fontFamily: Fonts.PlusJakartaSans_Regular}} >Dr smith</Text></View> */}
           <Image source={  Images.dr2 } style={styles.doctorImage} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.mainText}>{title}</Text>
          </View>
          <TouchableOpacity style={styles.iconContainer}>
            {rightIcon}
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  export default ChatHeader;
  
  