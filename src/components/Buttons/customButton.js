import {StyleSheet, Text, View, Pressable, Image} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Loader from '../Loaders/loader';
import { Colors } from '../../Constants/themeColors';
import { useSelector } from 'react-redux';

const CustomButton = ({
  containerStyle,
  borderColor,
  onPress,
  mode,
  text,
  textStyle,
  txtColor,
  icon,
  iconSize,
  iconColor,
  pressedRadius,
  svg,
  img,
  imgStyle,
  isLoading,
  vertical,
  rightSvg,
  contentContainer,
  loaderColor,
  LoaderSize,
  keey,
  modeContainerStyle,
}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const renderContent = () => {
    
    if (isLoading) {
      return <Loader color={loaderColor} size={LoaderSize} />;
    }

    if (icon) {
      return (
        <>
          <Icon name={icon} size={iconSize} color={iconColor} />
          {text && <Text style={[textStyle, txtColor]}>{text}</Text>}
        </>
      );
    }

    if (rightSvg) {
      return (
        <View
          style={[
            !vertical && {flexDirection: 'row', alignItems: 'center'},
            contentContainer,
          ]}>
          {text && <Text style={[textStyle, txtColor]}>{text}</Text>}
          {rightSvg}
        </View>
      );
    }

    if (text && !svg && !icon) {
      return <Text style={[textStyle, txtColor]}>{text}</Text>;
    }

    if (svg) {
      return (
        <View
          style={[!vertical && {flexDirection: 'row', alignItems: 'center'}]}>
          {svg}
          {text && <Text style={[textStyle, txtColor]}>{text}</Text>}
        </View>
      );
    }

    if (img) {
      return <Image source={img} style={imgStyle} />;
    }

    return null;
  };

  return (
    <Pressable
      onPress={onPress}
      key={keey}
      style={({pressed}) => [
        containerStyle,
        mode && {
          backgroundColor: 'transparent',
          borderColor: isDarkMode? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryBtn.TextColor,
          borderWidth: 1,
        },
        pressed && {opacity: 0.5, borderRadius: pressedRadius},
      ]}
      disabled={isLoading}>
      {renderContent()}
    </Pressable>
  );
};

export default CustomButton;


