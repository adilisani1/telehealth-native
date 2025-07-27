import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  FlatList
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import StarRating from '../Rating/StarRating';
import CustomButton from '../Buttons/customButton';
import { useAlert } from '../../Providers/AlertContext';
import { getEligibleAppointmentsForReview } from '../../services/reviewApi';

const WriteReviewModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  doctorInfo,
  initialReview = null, // For editing existing reviews
  loading = false,
  preSelectedAppointment = null // For when modal is opened with a specific appointment
}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const { showAlert } = useAlert();

  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [reviewText, setReviewText] = useState(initialReview?.review || '');
  const [isAnonymous, setIsAnonymous] = useState(initialReview?.isAnonymous || false);
  const [selectedAppointment, setSelectedAppointment] = useState(initialReview?.appointment || preSelectedAppointment?._id || null);
  const [eligibleAppointments, setEligibleAppointments] = useState([]);
  const [canGiveGeneralReview, setCanGiveGeneralReview] = useState(false);
  const [loadingEligible, setLoadingEligible] = useState(false);

  const isEditing = !!initialReview;

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setReviewText(initialReview.review);
      setIsAnonymous(initialReview.isAnonymous);
      setSelectedAppointment(initialReview.appointment);
    } else {
      // Reset for new review
      setRating(0);
      setReviewText('');
      setIsAnonymous(false);
      setSelectedAppointment(preSelectedAppointment?._id || null);
    }
  }, [initialReview, visible, preSelectedAppointment]);

  // Fetch eligible appointments when modal opens (only if no pre-selected appointment)
  useEffect(() => {
    if (visible && !isEditing && !preSelectedAppointment && doctorInfo?._id) {
      fetchEligibleAppointments();
    }
  }, [visible, doctorInfo, isEditing, preSelectedAppointment]);

  const fetchEligibleAppointments = async () => {
    try {
      setLoadingEligible(true);
      const response = await getEligibleAppointmentsForReview(doctorInfo._id);
      if (response.data.success) {
        setEligibleAppointments(response.data.data.eligibleAppointments);
        setCanGiveGeneralReview(response.data.data.canGiveGeneralReview);
      }
    } catch (error) {
      console.error('Error fetching eligible appointments:', error);
      showAlert('Failed to load eligible appointments', 'error');
    } finally {
      setLoadingEligible(false);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
      width: wp(90),
      maxHeight: hp(80),
      borderRadius: wp(4),
      padding: wp(5),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(3),
    },
    title: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
    },
    closeButton: {
      padding: wp(1),
    },
    doctorInfo: {
      marginBottom: hp(3),
    },
    doctorName: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    doctorSpecialization: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    section: {
      marginBottom: hp(3),
    },
    sectionTitle: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
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
      marginLeft: wp(3),
    },
    textInput: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      padding: wp(3),
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      textAlignVertical: 'top',
      minHeight: hp(12),
      maxHeight: hp(20),
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    },
    charCount: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      textAlign: 'right',
      marginTop: hp(0.5),
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(3),
    },
    switchLabel: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(2),
    },
    button: {
      flex: 1,
      marginHorizontal: wp(1),
      paddingVertical: hp(1.5),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    },
    submitButton: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
    },
    buttonText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Medium,
    },
    cancelButtonText: {
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    submitButtonText: {
      color: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
    },
    disabledButton: {
      opacity: 0.5,
      backgroundColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    },
    appointmentSection: {
      marginBottom: hp(3),
    },
    appointmentOption: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      padding: wp(3),
      marginVertical: hp(0.5),
      borderWidth: 1,
    },
    appointmentOptionSelected: {
      borderColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      backgroundColor: isDarkMode 
        ? `${Colors.darkTheme.primaryColor}20` 
        : `${Colors.lightTheme.primaryColor}20`,
    },
    appointmentOptionDefault: {
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    },
    appointmentDate: {
      fontSize: RFPercentage(1.9),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    appointmentStatus: {
      fontSize: RFPercentage(1.7),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
    generalReviewOption: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      padding: wp(3),
      marginVertical: hp(0.5),
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    },
    generalReviewText: {
      fontSize: RFPercentage(1.9),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    loadingText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      textAlign: 'center',
      marginVertical: hp(2),
    },
    noAppointmentsText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      textAlign: 'center',
      marginVertical: hp(2),
    },
  });

  const handleSubmit = () => {
    console.log('handleSubmit called');
    console.log('Current state:', {
      rating,
      reviewTextLength: reviewText.trim().length,
      loading,
      isSubmitDisabled,
      doctorInfo: doctorInfo?._id,
      preSelectedAppointment: preSelectedAppointment?._id
    });

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      console.log('Failed validation: invalid rating:', rating);
      showAlert('Please select a rating between 1 and 5', 'error');
      return;
    }

    if (reviewText.trim().length < 10) {
      console.log('Failed validation: review text too short');
      showAlert('Review must be at least 10 characters long', 'error');
      return;
    }

    if (reviewText.trim().length > 500) {
      console.log('Failed validation: review text too long');
      showAlert('Review cannot exceed 500 characters', 'error');
      return;
    }

    // Only check appointment selection if no pre-selected appointment and we're not editing
    if (!isEditing && !preSelectedAppointment && eligibleAppointments.length > 0 && !selectedAppointment && !canGiveGeneralReview) {
      console.log('Failed validation: appointment selection required');
      showAlert('Please select an appointment to review', 'error');
      return;
    }

    const reviewData = {
      rating: parseInt(rating), // Ensure rating is an integer
      review: reviewText.trim(),
      isAnonymous: Boolean(isAnonymous), // Ensure boolean
    };

    if (!isEditing) {
      if (!doctorInfo?._id) {
        showAlert('Doctor information is missing', 'error');
        return;
      }
      
      reviewData.doctorId = doctorInfo._id;
      
      // Use preSelectedAppointment ID if available, otherwise use selectedAppointment
      if (preSelectedAppointment?._id) {
        reviewData.appointmentId = preSelectedAppointment._id;
      } else if (selectedAppointment) {
        reviewData.appointmentId = selectedAppointment;
      }
    }

    console.log('Validation passed, calling onSubmit with:', reviewData);
    console.log('Full submission context:', {
      isEditing,
      preSelectedAppointment: preSelectedAppointment,
      selectedAppointment,
      doctorInfo: doctorInfo,
      eligibleAppointments: eligibleAppointments.length,
      appointmentStatus: preSelectedAppointment?.status,
      appointmentId: preSelectedAppointment?._id,
      doctorId: doctorInfo?._id
    });
    onSubmit(reviewData);
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAppointmentOption = ({ item }) => {
    const isSelected = selectedAppointment === item._id;
    return (
      <TouchableOpacity
        style={[
          styles.appointmentOption,
          isSelected ? styles.appointmentOptionSelected : styles.appointmentOptionDefault
        ]}
        onPress={() => setSelectedAppointment(item._id)}
        disabled={loading}
      >
        <Text style={styles.appointmentDate}>
          {formatAppointmentDate(item.date)}
        </Text>
        <Text style={styles.appointmentStatus}>
          Status: {item.status === 'completed' ? 'Completed' : 'Cancelled by Doctor'}
        </Text>
      </TouchableOpacity>
    );
  };

  // Calculate if submit should be disabled
  // For preSelectedAppointment cases, only validate basic fields
  // For other cases, also validate appointment selection
  const isSubmitDisabled = !rating || rating < 1 || rating > 5 || reviewText.trim().length < 10 || loading;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditing ? 'Edit Review' : 'Write Review'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                disabled={loading}
              >
                <Icon 
                  name="close" 
                  size={24} 
                  color={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor} 
                />
              </TouchableOpacity>
            </View>

            {/* Doctor Info */}
            {doctorInfo && (
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctorInfo.name}</Text>
                <Text style={styles.doctorSpecialization}>
                  {doctorInfo.specialization || 'Doctor'}
                </Text>
              </View>
            )}

            {/* Appointment Selection (for new reviews only) */}
            {!isEditing && !preSelectedAppointment && (
              <View style={styles.appointmentSection}>
                <Text style={styles.sectionTitle}>Select Appointment (Optional)</Text>
                
                {loadingEligible ? (
                  <Text style={styles.loadingText}>Loading eligible appointments...</Text>
                ) : eligibleAppointments.length === 0 && !canGiveGeneralReview ? (
                  <Text style={styles.noAppointmentsText}>
                    No eligible appointments found. You can only review after completing an appointment or if the doctor cancelled your appointment.
                  </Text>
                ) : (
                  <>
                    {eligibleAppointments.length > 0 && (
                      <FlatList
                        data={eligibleAppointments}
                        renderItem={renderAppointmentOption}
                        keyExtractor={(item) => item._id}
                        scrollEnabled={false}
                      />
                    )}
                    
                    {canGiveGeneralReview && (
                      <TouchableOpacity
                        style={[
                          styles.generalReviewOption,
                          !selectedAppointment && styles.appointmentOptionSelected
                        ]}
                        onPress={() => setSelectedAppointment(null)}
                        disabled={loading}
                      >
                        <Text style={styles.generalReviewText}>
                          Give general review (not for specific appointment)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Show selected appointment info when pre-selected */}
            {!isEditing && preSelectedAppointment && (
              <View style={styles.appointmentSection}>
                <Text style={styles.sectionTitle}>Reviewing Appointment</Text>
                <View style={[styles.appointmentOption, styles.appointmentOptionSelected]}>
                  <Text style={styles.appointmentDate}>
                    {formatAppointmentDate(preSelectedAppointment.date)}
                  </Text>
                  <Text style={styles.appointmentStatus}>
                    Status: {preSelectedAppointment.status === 'completed' ? 'Completed' : 'Cancelled by Doctor'}
                  </Text>
                </View>
              </View>
            )}

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rating *</Text>
              <View style={styles.ratingContainer}>
                <StarRating 
                  rating={rating}
                  size={28}
                  onStarPress={(newRating) => {
                    console.log('Star pressed, new rating:', newRating);
                    // Ensure the rating is a valid integer between 1 and 5
                    const validRating = Math.max(1, Math.min(5, Math.round(newRating)));
                    console.log('Setting validated rating:', validRating);
                    setRating(validRating);
                  }}
                  disabled={loading}
                />
                <Text style={styles.ratingText}>
                  {rating > 0 ? `${rating}/5` : 'Tap to rate'}
                </Text>
              </View>
            </View>

            {/* Review Text Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Review *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Share your experience with this doctor..."
                placeholderTextColor={
                  isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor
                }
                value={reviewText}
                onChangeText={(text) => {
                  console.log('Text changed:', text.length, 'chars');
                  setReviewText(text);
                }}
                multiline={true}
                maxLength={500}
                editable={!loading}
              />
              <Text style={styles.charCount}>
                {reviewText.length}/500 characters
              </Text>
            </View>

            {/* Anonymous Switch */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Post anonymously</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                disabled={loading}
                trackColor={{ 
                  false: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
                  true: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor
                }}
                thumbColor={
                  isAnonymous 
                    ? (isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor)
                    : (isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor)
                }
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.button, 
                  styles.submitButton,
                  isSubmitDisabled && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
                activeOpacity={isSubmitDisabled ? 1 : 0.7}
              >
                <Text style={[
                  styles.buttonText, 
                  styles.submitButtonText,
                  isSubmitDisabled && { color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor }
                ]}>
                  {loading ? 'Submitting...' : (isEditing ? 'Update' : 'Submit')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WriteReviewModal;
