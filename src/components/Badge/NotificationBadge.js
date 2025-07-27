import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../../Constants/Fonts';

const NotificationBadge = ({ count, isDarkMode = false }) => {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  const isLargeNumber = count > 9 || count > 99;

  return (
    <View style={[
      styles.badge, 
      { 
        backgroundColor: '#FF3B30',
        minWidth: isLargeNumber ? wp(7) : wp(6),
        height: wp(6),
        borderRadius: wp(3),
      }
    ]}>
      <Text style={[
        styles.badgeText,
        {
          fontSize: isLargeNumber ? RFPercentage(1.4) : RFPercentage(1.6),
          ...(Platform.OS === 'android' ? { lineHeight: wp(6) } : {}),
        }
      ]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -wp(2),
    right: -wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1),
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: Fonts.Bold,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    fontWeight: '900',
  },
});

export default NotificationBadge;
