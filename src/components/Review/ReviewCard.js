import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import StarRating from '../Rating/StarRating';
import { Images } from '../../assets/Images/images';

const ReviewCard = ({ 
  review, 
  showDoctorInfo = false, 
  showPatientInfo = true,
  onEdit = null,
  onDelete = null,
  showActions = false 
}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const { User, userType } = useSelector(store => store.auth);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.backgroundColor,
      padding: wp(4),
      marginVertical: hp(0.5),
      marginHorizontal: wp(2),
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      shadowColor: isDarkMode ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    avatar: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      marginRight: wp(3),
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
    },
    userRole: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    ratingText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginLeft: wp(2),
    },
    reviewText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      lineHeight: RFPercentage(2.8),
      marginBottom: hp(1),
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    actions: {
      flexDirection: 'row',
    },
    actionButton: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      marginLeft: wp(2),
      borderRadius: wp(1.5),
      borderWidth: 1,
    },
    editButton: {
      borderColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
    },
    deleteButton: {
      borderColor: '#ff4444',
    },
    actionButtonText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
    },
    editButtonText: {
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
    },
    deleteButtonText: {
      color: '#ff4444',
    },
    anonymousText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Italic,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      marginTop: hp(0.5),
    },
  });

  const canEdit = showActions && review.patient?._id === User?._id;
  const canDelete = showActions && (review.patient?._id === User?._id || userType === 'admin');

  const getDisplayName = () => {
    if (review.isAnonymous || !review.patient) {
      return 'Anonymous Patient';
    }
    return showDoctorInfo ? review.doctor?.name : review.patient?.name;
  };

  const getDisplayRole = () => {
    if (showDoctorInfo) {
      return review.doctor?.specialization || 'Doctor';
    }
    return review.isAnonymous ? 'Anonymous' : 'Patient';
  };

  const getDisplayAvatar = () => {
    if (review.isAnonymous || !review.patient?.avatar) {
      return Images.dr2; // Default avatar
    }
    const avatarSource = showDoctorInfo ? review.doctor?.avatar : review.patient?.avatar;
    return avatarSource ? { uri: avatarSource } : Images.dr2;
  };

  return (
    <View style={styles.container}>
      {/* Header with user info */}
      <View style={styles.header}>
        <Image source={getDisplayAvatar()} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{getDisplayName()}</Text>
          <Text style={styles.userRole}>{getDisplayRole()}</Text>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <StarRating 
          rating={review.rating} 
          size={18} 
          disabled={true}
        />
        <Text style={styles.ratingText}>{review.rating}/5</Text>
      </View>

      {/* Review text */}
      <Text style={styles.reviewText}>{review.review}</Text>

      {/* Anonymous indicator */}
      {review.isAnonymous && (
        <Text style={styles.anonymousText}>This review was posted anonymously</Text>
      )}

      {/* Footer with date and actions */}
      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {moment(review.createdAt).format('MMM DD, YYYY')}
        </Text>
        
        {showActions && (canEdit || canDelete) && (
          <View style={styles.actions}>
            {canEdit && onEdit && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit(review)}
              >
                <Text style={[styles.actionButtonText, styles.editButtonText]}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
            {canDelete && onDelete && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(review)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ReviewCard;
