import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RBSheet from 'react-native-raw-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Fonts } from '../../Constants/Fonts';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { uploadImage } from '../../utils/helpers';
// import { Icons } from '../../constants';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { RFPercentage } from 'react-native-responsive-fontsize';

const CameraBottomSheet = ({ refRBSheet, onPick, obj }) => {
  const navigation = useNavigation();
  const { isDarkMode } = useSelector((store) => store.theme);

  // const  {Colors } = useSelector(store => store.auth)

  const takePhotoFromCamera = async () => {
    var options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 500,
      maxHeight: 500,
      quality: 1,
      includeBase64: true,
    };

    await launchCamera(options)
      .then(async res => {
        if (res.didCancel) {
          console.log('User cancelled image picker');
        } else if (res.error) {
          console.log('ImagePicker Error: ', res.error);
        } else if (res.customButton) {
          console.log('User tapped custom button: ', res.customButton);
        } else {
          let base64Image = `data:${res.assets[0].type};base64,${res.assets[0].base64}`
          let image1 = {
            path: res.assets[0].uri,
            mime: res.assets[0].type,
            name: res.assets[0].fileName,
            base64: base64Image
          };


          if (obj) {
            navigation.navigate('ImageUpload', {
              ...obj,
              ...image1
            })
          }
          onPick && onPick(image1);
        }
      })
      .catch(err => {
        console.log('error  :  ', err);
      });
  };

  const choosePhotoFromLibrary = async () => {
    var options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 500,
      maxHeight: 500,
      quality: 1,
      includeBase64: true,
    };

    await launchImageLibrary(options)
      .then(async res => {
        if (res.didCancel) {
          console.log('User cancelled image picker');
        } else if (res.error) {
          console.log('ImagePicker Error: ', res.error);
        } else if (res.customButton) {
          console.log('User tapped custom button: ', res.customButton);
        } else {
          let base64Image = `data:${res.assets[0].type};base64,${res.assets[0].base64}`
          let image1 = {
            path: res.assets[0].uri,
            mime: res.assets[0].type,
            name: res.assets[0].fileName,
            base64: base64Image
          };

          if (obj) {
            navigation.navigate('ImageUpload', {
              ...obj,
              ...image1
            })
          }
          onPick && onPick(image1);
        }
      })
      .catch(err => {
        console.log('error  :  ', err);
      });
  };

  const styles = StyleSheet.create({

    optiontext: {
      fontSize: hp(1.7),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PlusJakartaSans_Regular,
      marginLeft: wp(4),
    },
    maintext: {
      fontSize: hp(2),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.Medium,
    },
    modaltextview: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: wp(90),
      borderRadius: 25,
      // backgroundColor: Colors.AppBckGround_color,
      paddingHorizontal: wp(10),
    },
  });


  return (
    <RBSheet
      ref={refRBSheet}
      closeOnDragDown={true}
      closeOnPressMask={false}
      animationType="fade"
      minClosingHeight={0}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(52, 52, 52, 0.5)',
        },
        draggableIcon: {
          backgroundColor: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
        },
        container: {
          borderTopLeftRadius: wp(8),
          borderTopRightRadius: wp(8),
          height: hp(20),
          backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
        },
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: wp(8),
          alignItems: 'center',
          marginTop : hp(2)
        }}>
        <Text style={styles.maintext}>Upload Image</Text>
        <TouchableOpacity onPress={() => refRBSheet.current.close()}>
          <Ionicons
            name="close"
            size={22}
            color={Colors.primary_text}
            onPress={() => refRBSheet.current.close()}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          justifyContent: 'center',
          marginTop: hp(3),
          // backgroundColor: Colors.button.secondary_button,
        }}>
        <TouchableOpacity
          onPress={() => {
            takePhotoFromCamera();
            refRBSheet.current.close();
          }}
          style={styles.modaltextview}>
          {/* <Icons.BlackCamera/> */}
          <Ionicons name='camera' size={RFPercentage(3)} color={isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor}  />

          <Text style={styles.optiontext}>Capture from Camera</Text>
        </TouchableOpacity>
        <View
          style={{
            borderBottomColor: 'rgba(52, 52, 52, 0.5)',
            borderBottomWidth: hp(0.1),
            width: wp(85),
            alignSelf: 'center',
            marginBottom: hp(2),
            marginTop: hp(2),
          }}></View>
        <TouchableOpacity
          onPress={() => {
            refRBSheet.current.close();
            choosePhotoFromLibrary();
          }}
          style={styles.modaltextview}>
          {/* <Icons.Gallery height={hp(4)} width={wp(9)} /> */}
          <Ionicons name='folder-open-sharp' size={RFPercentage(3)} color={isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor} />
          <Text style={styles.optiontext}>Upload from Gallery</Text>
        </TouchableOpacity>
      </View>
    </RBSheet>
  );
};

export default CameraBottomSheet;

