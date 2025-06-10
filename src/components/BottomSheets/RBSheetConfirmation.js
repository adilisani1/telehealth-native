import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import React from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../Constants/Fonts';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import CustomButton from '../Buttons/customButton';
const RBSheetConfirmation = ({
  refRBSheet,
  content,
  height,
  title,
  btnText,
  onPress,
  textColor,
  cancelText,
  okText,
  onCancel,
  onOk,
  description,
  component,
  okBtnColor,
  tittleStyle,
  descriptionStyle
}) => {
  const navigation = useNavigation();
  const { isDarkMode } = useSelector(store => store.theme);


  const styles = StyleSheet.create({
    btn: {
      backgroundColor: okBtnColor ? okBtnColor :  isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: hp(2),
      marginHorizontal: wp(4)
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
    <View style={{ flex: 1 }}>
      <RBSheet
        ref={refRBSheet}
        height={height ? height : 340}
        openDuration={300}
        // closeOnDragDown
        customStyles={{
          container: {
            // justifyContent: 'center',
            paddingVertical: 20,
            alignItems: 'center',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            backgroundColor: isDarkMode? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
          },
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ width: wp(87), alignItems: 'center' }}>


            {component &&
              <View style={{
                // height: 120,
                // // width: 150,
                marginBottom: hp(1),
                //   aspectRatio: 1,
              }} >
                {component}
              </View>

            }


            <Text
              style={{
                color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
                fontSize: RFPercentage(2.5),
                fontFamily: Fonts.Bold,
                textAlign: 'center',
                ...tittleStyle,
              }}>
              {title}
            </Text>
            {description && (
              <Text
                style={{
                  color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
                  fontSize: RFPercentage(2),
                  fontFamily: Fonts.Regular,
                  textAlign: 'center',
                  marginTop: 8,
                  ...descriptionStyle
                }}>
                {description}
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: wp(78),
              }}>
              <CustomButton containerStyle={[styles.btn, { width: wp(30) }]} mode={true} text={cancelText} textStyle={[styles.btnText, styles.secondryBtnText]} onPress={onCancel} />

              <CustomButton containerStyle={[styles.btn, { width: wp(30) }]} text={okText} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} onPress={onOk} />

             
            </View>
          </View>
        </ScrollView>
      </RBSheet>
    </View>
  );
};

export default RBSheetConfirmation;


