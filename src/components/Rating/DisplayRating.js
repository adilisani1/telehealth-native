import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../Constants/themeColors';
import { useSelector } from 'react-redux';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Fonts } from '../../Constants/Fonts';

const DisplayRating = ({ 
  rating = 0, 
  totalReviews = 0, 
  maxStars = 5, 
  size = 16, 
  showCount = true,
  style = {},
  starStyle = {},
  textStyle = {}
}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  
  const starColor = '#f7c481'; // Gold color for ratings
  const emptyStarColor = isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor;
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon
          key={i}
          name="star"
          size={size}
          color={starColor}
          style={[styles.star, starStyle]}
        />
      );
    }
    
    // Render half star if needed
    if (hasHalfStar && fullStars < maxStars) {
      stars.push(
        <Icon
          key="half"
          name="star-half"
          size={size}
          color={starColor}
          style={[styles.star, starStyle]}
        />
      );
    }
    
    // Render empty stars
    const remainingStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="star-border"
          size={size}
          color={emptyStarColor}
          style={[styles.star, starStyle]}
        />
      );
    }
    
    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showCount && (
        <Text style={[styles.ratingText, textStyle, {
          color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor
        }]}>
          {rating > 0 ? `${rating.toFixed(1)} (${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'})` : `0 ratings`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: wp(0.2),
  },
  ratingText: {
    fontSize: RFPercentage(1.6),
    fontFamily: Fonts.Regular,
    marginLeft: wp(2),
  },
});

export default DisplayRating;
