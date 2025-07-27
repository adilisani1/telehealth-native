import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../Constants/themeColors';
import { useSelector } from 'react-redux';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const StarRating = ({ 
  rating = 0, 
  maxStars = 5, 
  size = 20, 
  onStarPress = null, 
  disabled = false,
  color = null 
}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  
  const starColor = color || (isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor);
  const emptyStarColor = isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.BorderGrayColor;

  const renderStar = (index) => {
    const filled = index < rating;
    const starSize = size;
    
    return (
      <TouchableOpacity
        key={index}
        onPress={() => !disabled && onStarPress && onStarPress(index + 1)}
        disabled={disabled || !onStarPress}
        style={[styles.star, { marginHorizontal: wp(0.5) }]}
        activeOpacity={0.7}
      >
        <Icon
          name={filled ? 'star' : 'star-border'}
          size={starSize}
          color={filled ? starColor : emptyStarColor}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    padding: wp(0.5),
  },
  disabled: {
    opacity: 0.6,
  },
});

export default StarRating;
