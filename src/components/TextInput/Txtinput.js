import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import CustomButton from '../Buttons/customButton';
import { useSelector } from 'react-redux';
import { normalizeFontSize, scaleWidth } from '../../utils/responsive';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';

const TxtInput = ({
  style,
  rightIcon,
  placeholder,
  rightIconSize,
  rightIconColor,
  keyboardType,
  onChangeText,
  value,
  onBlur,
  multiline,
  leftIcon,
  leftIconSize,
  leftIconColor,
  secureTextEntry,
  onFocus,
  onPress,
  error,
  placeholderTextColor,
  rightIconPress,
  rightIconContainerStyle,
  isEmoji,
  containerStyle,
  svg,
  rightIconFocusColor,
  selectableColor,
  inputStyle,
  leftSvg,
  btnText,
  leftBtnStyle,
  leftBtnPress,
  editable,
  focusedStyle,
  maxLength,
  numberOfLines,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const { isDarkMode } = useSelector((store) => store.theme);

  const styles = StyleSheet.create({
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      paddingHorizontal: wp('4%'),
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: wp('0.3%'),
      borderRadius: wp('2%'),
    },
    searchInput: {
      fontFamily: Fonts.Regular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      flex: 1,
      fontSize: RFPercentage(2),
    },
    focused: {
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      borderWidth: wp('0.3%'),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.white,
      borderRadius: wp('2%'),
    },
    icon: {
      marginRight: wp('2%'),
    },
    iconBtn: {
      paddingHorizontal: wp('3%'),
    },
    leftBtnText: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Regular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginLeft: wp('2%'),
    },
  });

  return (
    <View style={style}>
      <View
        style={[
          styles.searchContainer,
          containerStyle,
          isFocused && [styles.focused, focusedStyle],
        ]}
      >
        {rightIcon && (
          <CustomButton
            icon={rightIcon}
            iconSize={rightIconSize}
            iconColor={rightIconColor}
            onPress={rightIconPress}
            style={styles.iconBtn}
            containerStyle={rightIconContainerStyle}
          />
        )}
        {svg && svg}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={
            placeholderTextColor ||
            (isDarkMode
              ? Colors.darkTheme.secondryTextColor
              : Colors.lightTheme.secondryTextColor)
          }
          style={[styles.searchInput, inputStyle]}
          selectionColor={
            selectableColor ||
            (isDarkMode
              ? Colors.darkTheme.primaryTextColor
              : Colors.lightTheme.primaryTextColor)
          }
          keyboardType={keyboardType}
          onFocus={() => (onFocus ? onFocus() : setFocused(true))}
          onChangeText={onChangeText}
          value={value}
          onBlur={() => (onBlur ? onBlur() : setFocused(false))}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          onPress={onPress}
          editable={editable}
          maxLength={maxLength}
          numberOfLines={numberOfLines}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.icon}
          >
            <Icon
              name={isPasswordVisible ? 'eye' : 'eye-slash'}
              size={wp('5%')}
              color={
                isPasswordVisible
                  ? isDarkMode
                    ? Colors.darkTheme.primaryTextColor
                    : Colors.lightTheme.primaryTextColor
                  : isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor
              }
            />
          </TouchableOpacity>
        )}
        {(leftSvg || leftIcon) && (
          <CustomButton
            svg={leftSvg}
            text={btnText}
            textStyle={styles.leftBtnText}
            containerStyle={leftBtnStyle}
            onPress={leftBtnPress}
            icon={leftIcon}
            iconColor={leftIconColor}
            iconSize={leftIconSize}
          />
        )}
      </View>
      {error && error}
    </View>
  );
};

export default TxtInput;
