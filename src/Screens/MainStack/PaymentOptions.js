import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import { useStripe } from '@stripe/stripe-react-native';
import { Colors } from '../../Constants/themeColors';
import StackHeader from '../../components/Header/StackHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SCREENS } from '../../Constants/Screens';
import { Fonts } from '../../Constants/Fonts';
import appointmentApi from '../../services/appointmentApi';
import stripeService from '../../services/stripeService';
import healthRecordsApi from '../../services/healthRecordsApi';
import { STRIPE_ERRORS, PAYMENT_STATUS } from '../../Constants/StripeConfig';
import { useAlert } from '../../Providers/AlertContext';
import FullLoader from '../../components/Loaders';
import moment from 'moment';

const PaymentOptions = ({navigation, route}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const { showAlert } = useAlert();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentSheetInitialized, setPaymentSheetInitialized] = useState(false);
  
  // Get appointment data from navigation params
  const { appointmentData, amount, currency } = route.params || {};

  // Helper: Upload health records after appointment booking
  const uploadHealthRecords = async (healthRecordsData) => {
    if (!healthRecordsData || !healthRecordsData.hasData) {
      return;
    }

    try {
      const uploadPromises = [];
      
      if (healthRecordsData.type === 'note') {
        uploadPromises.push(
          healthRecordsApi.uploadHealthRecord({
            type: 'note',
            description: healthRecordsData.description,
            noteData: healthRecordsData.noteData,
          })
        );
      } else {
        healthRecordsData.files.forEach((file) => {
          uploadPromises.push(
            healthRecordsApi.uploadHealthRecord({
              type: healthRecordsData.type,
              description: healthRecordsData.description,
              file,
            })
          );
        });
      }

      const results = await Promise.all(uploadPromises);
      showAlert(`Successfully uploaded ${results.length} health record${results.length > 1 ? 's' : ''}`, 'success');
      return results;
    } catch (error) {
      showAlert('Health records could not be uploaded, but your appointment has been scheduled successfully.', 'warning');
      return null;
    }
  };

  const handlePayment = async (paymentMethod) => {
    if (!appointmentData) {
      showAlert('Missing appointment data', 'error');
      return;
    }

    if (processing) {
      return; // Prevent multiple payment attempts
    }

    setSelectedPaymentMethod(paymentMethod);

    // Show payment confirmation dialog
    Alert.alert(
      'Confirm Payment',
      `Pay ${currency} ${amount} for consultation with ${appointmentData.doctor?.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedPaymentMethod(null)
        },
        {
          text: 'Pay Now',
          onPress: () => processPayment(paymentMethod)
        }
      ]
    );
  };

  /**
   * Process Stripe card payment with comprehensive error handling
   * @param {string} paymentMethod - The selected payment method
   */
  /**
   * Process Stripe payment using Payment Sheet
   */
  const processStripePayment = async () => {
    try {
      setProcessing(true);

      // Pre-flight validation - check slot availability before payment
      const slotValidation = await validateAppointmentSlot();
      if (!slotValidation) {
        setProcessing(false);
        return; // Error already handled in validateAppointmentSlot
      }

      // Step 1: Create payment intent on backend
      console.log('Creating payment intent...');
      const paymentIntentResponse = await createPaymentIntent();
      if (!paymentIntentResponse) {
        setProcessing(false);
        return; // Error already handled in createPaymentIntent
      }

      const { clientSecret, paymentIntentId } = paymentIntentResponse;

      // Step 2: Initialize Payment Sheet
      console.log('Initializing payment sheet...');
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Telehealth App',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: appointmentData.patientName || 'Patient',
        },
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        console.error('Payment sheet initialization error:', initError);
        throw new Error('Failed to initialize payment. Please try again.');
      }

      setPaymentSheetInitialized(true);

      // Step 3: Present Payment Sheet
      console.log('Presenting payment sheet...');
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Payment sheet presentation error:', presentError);
        if (presentError.code === 'Canceled') {
          showAlert('Payment Cancelled', 'You cancelled the payment process. You can try again anytime.');
        } else {
          throw new Error(presentError.message || 'Payment failed. Please try again.');
        }
        setProcessing(false);
        return;
      }

      // Step 4: Payment succeeded, confirm on backend and create appointment
      console.log('Payment succeeded! Creating appointment...');
      const appointmentCreation = await confirmPaymentAndCreateAppointment(paymentIntentId);
      if (!appointmentCreation) {
        // Payment succeeded but appointment creation failed
        showAlert(
          'Payment was processed successfully, but there was an issue creating your appointment. Please contact support with payment ID: ' + paymentIntentId,
          'error',
          'Payment Successful'
        );
        setProcessing(false);
        setTimeout(() => navigation.goBack(), 3000);
        return;
      }

      // Step 5: Upload health records if available
      await handleHealthRecordsUpload();

      // Step 6: Navigate to success screen
      navigateToSuccess(appointmentCreation);
      setProcessing(false);

    } catch (error) {
      console.error('Stripe payment processing error:', error);
      handlePaymentError(error);
      setProcessing(false);
    }
  };

  /**
   * Validate appointment slot availability before payment
   */
  const validateAppointmentSlot = async () => {
    try {
      const revalidationPayload = {
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        slot: appointmentData.slot
      };
      
      const revalidationRes = await appointmentApi.validateAppointmentSlot(revalidationPayload);
      
      if (!revalidationRes.data || !revalidationRes.data.success) {
        const errorMessage = revalidationRes.data?.message || 'Slot is no longer available. Please select a different time.';
        showAlert(
          errorMessage,
          'error',
          'Slot Unavailable'
        );
        setTimeout(() => navigation.goBack(), 3000);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Slot validation error:', error);
      showAlert('Validation Error', 'Unable to validate appointment slot. Please try again.');
      return false;
    }
  };

  /**
   * Create payment intent on backend
   */
  const createPaymentIntent = async () => {
    try {
      const paymentIntentResponse = await stripeService.createPaymentIntent({
        amount: amount, // Send amount as-is, backend will handle cents conversion
        currency: currency?.toLowerCase() || 'usd',
        doctorId: appointmentData.doctorId,
        appointmentData: {
          date: appointmentData.date,
          slot: appointmentData.slot,
          patientName: appointmentData.patientName,
          ageGroup: appointmentData.ageGroup,
          gender: appointmentData.gender,
          problem: appointmentData.problem,
        }
      });

      if (!paymentIntentResponse.success) {
        throw new Error(paymentIntentResponse.message || 'Failed to create payment intent');
      }

      return paymentIntentResponse.data;
    } catch (error) {
      console.error('Payment intent creation error:', error);
      let errorMessage = 'Failed to initialize payment. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Doctor not found. Please select a different doctor.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showAlert('Payment Setup Failed', errorMessage);
      return null;
    }
  };

  /**
   * Confirm payment on backend and create appointment
   */
  const confirmPaymentAndCreateAppointment = async (paymentIntentId) => {
    try {
      const confirmResponse = await stripeService.confirmPayment(
        paymentIntentId,
        {
          doctorId: appointmentData.doctorId,
          date: appointmentData.date,
          slot: appointmentData.slot,
          patientName: appointmentData.patientName,
          ageGroup: appointmentData.ageGroup,
          gender: appointmentData.gender,
          problem: appointmentData.problem,
        }
      );

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.message || 'Failed to create appointment');
      }

      return confirmResponse.data;
    } catch (error) {
      console.error('Appointment creation error:', error);
      return null;
    }
  };

  /**
   * Handle health records upload after successful appointment creation
   */
  const handleHealthRecordsUpload = async () => {
    if (appointmentData.healthRecordsData) {
      try {
        await uploadHealthRecords(appointmentData.healthRecordsData);
      } catch (uploadError) {
        console.log('Health records upload failed, but appointment was booked successfully');
        // Don't show error to user as appointment was successful
      }
    }
  };

  /**
   * Navigate to success screen with appropriate data
   */
  const navigateToSuccess = (appointmentData) => {
    showAlert(
      'Your appointment has been booked successfully.',
      'success',
      'Payment Successful!'
    );
    
    setTimeout(() => {
      if (appointmentData.title === 'Reschedule Appointment') {
        navigation.reset({
          index: 0,
          routes: [{ name: SCREENS.TABS }],
        });
        navigation.navigate(SCREENS.MYAPPOINTMENT);
      } else {
        navigation.navigate(SCREENS.PAYMENTSUCCESS, { 
          appointment: appointmentData?.appointment, 
          doctor: appointmentData.doctor 
        });
      }
    }, 500);
  };

  /**
   * Handle payment errors with user-friendly messages
   */
  const handlePaymentError = (error) => {
    let errorMessage = STRIPE_ERRORS.UNKNOWN_ERROR;
    let errorTitle = 'Payment Error';
    
    // Stripe-specific error handling
    if (error.code === 'card_declined') {
      errorTitle = 'Card Declined';
      errorMessage = STRIPE_ERRORS.CARD_DECLINED;
    } else if (error.code === 'expired_card') {
      errorTitle = 'Card Expired';
      errorMessage = STRIPE_ERRORS.EXPIRED_CARD;
    } else if (error.code === 'insufficient_funds') {
      errorTitle = 'Insufficient Funds';
      errorMessage = STRIPE_ERRORS.INSUFFICIENT_FUNDS;
    } else if (error.code === 'incorrect_cvc') {
      errorTitle = 'Invalid CVC';
      errorMessage = STRIPE_ERRORS.INCORRECT_CVC;
    } else if (error.code === 'processing_error') {
      errorTitle = 'Processing Error';
      errorMessage = STRIPE_ERRORS.PROCESSING_ERROR;
    } else if (error.code === 'network_error' || error.message?.includes('network')) {
      errorTitle = 'Network Error';
      errorMessage = STRIPE_ERRORS.NETWORK_ERROR;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert(
      errorTitle,
      errorMessage,
      [
        {
          text: 'Try Again',
          onPress: () => {
            setProcessing(false);
            setPaymentIntentClientSecret(null);
          }
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const processPayment = async (paymentMethod) => {
    setProcessing(true);
    
    try {
      // Handle Stripe Card Payment
      if (paymentMethod === 'Pay with Card') {
        await processStripePayment();
      } else {
        // Handle other payment methods (mock payment)
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Re-validate the slot just before booking to handle race conditions
        const revalidationPayload = {
          doctorId: appointmentData.doctorId,
          date: appointmentData.date,
          slot: appointmentData.slot
        };
        
        const revalidationRes = await appointmentApi.validateAppointmentSlot(revalidationPayload);
        
        if (!revalidationRes.data || !revalidationRes.data.success) {
          throw new Error(revalidationRes.data?.message || 'Slot is no longer available. Please select a different time.');
        }
        
        // After successful payment and validation, book the appointment
        const payload = {
          doctorId: appointmentData.doctorId,
          date: appointmentData.date,
          slot: appointmentData.slot,
          patientName: appointmentData.patientName,
          ageGroup: appointmentData.ageGroup,
          gender: appointmentData.gender,
          problem: appointmentData.problem,
        };
        
        const res = await appointmentApi.bookAppointment(payload);
        
        if (res.data && res.data.success) {
          showAlert('Payment successful! Appointment booked.', 'success');
          
          // Upload health records if available
          if (appointmentData.healthRecordsData) {
            try {
              await uploadHealthRecords(appointmentData.healthRecordsData);
            } catch (uploadError) {
              console.log('Health records upload failed, but appointment was booked successfully');
            }
          }
          
          // Navigate to success screen
          setTimeout(() => {
            if (appointmentData.title === 'Reschedule Appointment') {
              navigation.reset({
                index: 0,
                routes: [{ name: SCREENS.TABS }],
              });
              navigation.navigate(SCREENS.MYAPPOINTMENT);
            } else {
              navigation.navigate(SCREENS.PAYMENTSUCCESS, { 
                appointment: res.data.data, 
                doctor: appointmentData.doctor 
              });
            }
          }, 1000);
        } else {
          throw new Error(res.data.message || 'Failed to book appointment');
        }
      }
    } catch (err) {
      console.error('Payment/Booking error:', err);
      let errorMessage = 'Payment failed. Please try again.';
      
      if (err.response?.status === 409) {
        errorMessage = 'This slot has been booked by another patient. Please select a different time.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert(
        'Booking Failed',
        errorMessage,
        [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Try Again',
            onPress: () => {
              // Reset and allow user to try again
              setProcessing(false);
            }
          }
        ]
      );
    } finally {
      setProcessing(false);
      setSelectedPaymentMethod(null);
    }
  };

  const paymentOptions = [
    {
      category: 'Credit & Debit Card',
      options: [
        {
          id: 1,
          name: 'Pay with Card',
          icon: 'credit-card',
          description: 'Opens secure Stripe payment form',
          badge: 'Secure',
        },
      ],
    },
    {
      category: 'More Payment Options',
      options: [
        {
          id: 3,
          name: 'Paypal',
          icon: 'paypal',
          description: 'Pay with your PayPal account',
        },
        {
          id: 4,
          name: 'Apple Pay',
          icon: 'apple-pay',
          description: 'Quick payment with Touch/Face ID',
          disabled: true, // Will be enabled in future versions
        },
      ],
    },
  ];


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp('5%'),
      paddingVertical: hp('2%'),
    },
    section: {
      marginBottom: hp('3%'),
    },
    category: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1.5%'),
    },
    option: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderRadius: wp('3%'),
      padding: wp('4%'),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp('1.5%'),
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: wp('12%'),
      height: wp('12%'),
      borderRadius: wp('6%'),
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp('3%'),
    },
    paymentInfo: {
      flex: 1,
    },
    paymentNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp('0.5%'),
    },
    optionText: {
      fontSize: RFPercentage(2.1),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginRight: wp('2%'),
    },
    optionDescription: {
      fontSize: RFPercentage(1.7),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      lineHeight: RFPercentage(2.2),
    },
    secureBadge: {
      backgroundColor: '#28a745',
      paddingHorizontal: wp('2%'),
      paddingVertical: hp('0.3%'),
      borderRadius: wp('2%'),
      marginRight: wp('2%'),
    },
    secureBadgeText: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.Bold,
      color: '#fff',
    },
    comingSoonBadge: {
      backgroundColor: '#ffc107',
      paddingHorizontal: wp('2%'),
      paddingVertical: hp('0.3%'),
      borderRadius: wp('2%'),
    },
    comingSoonText: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.Bold,
      color: '#000',
    },
    paymentAction: {
      alignItems: 'center',
    },
    processingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    processingText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      marginLeft: wp('2%'),
    },
    addText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      paddingHorizontal: wp('4%'),
      paddingVertical: hp('1%'),
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderRadius: wp('2%'),
    },
    paymentSummary: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderRadius: wp('4%'),
      padding: wp('5%'),
      marginBottom: hp('3%'),
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
      borderLeftWidth: 4,
      borderLeftColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
    },
    summaryTitle: {
      fontSize: RFPercentage(2.8),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1.5%'),
    },
    summaryText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
      marginBottom: hp('0.8%'),
      lineHeight: RFPercentage(2.5),
    },
    amountText: {
      fontSize: RFPercentage(3.2),
      fontFamily: Fonts.Bold,
      color: '#28a745',
      textAlign: 'center',
      marginTop: hp('1.5%'),
      backgroundColor: isDarkMode ? 'rgba(40, 167, 69, 0.1)' : 'rgba(40, 167, 69, 0.05)',
      paddingVertical: hp('1%'),
      borderRadius: wp('2%'),
    },
    // Enhanced loading state styles
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingContent: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.backgroundColor,
      padding: wp('8%'),
      borderRadius: wp('4%'),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
    loadingTitle: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginTop: hp('2%'),
      textAlign: 'center',
    },
    loadingSubtitle: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      marginTop: hp('1%'),
      textAlign: 'center',
      lineHeight: RFPercentage(2.3),
    },
  });

  if (processing) {
    return (
      <>
        <View style={styles.container}>
          <StackHeader 
            title={'Payment Options'} 
            headerStyle={{ paddingLeft: 0, paddingBottom: hp(2) }}
            onBackPress={() => {}} // Disable back press during processing
          />
          {appointmentData && (
            <View style={styles.paymentSummary}>
              <Text style={styles.summaryTitle}>Appointment Summary</Text>
              <Text style={styles.summaryText}>Doctor: {appointmentData.doctor?.name}</Text>
              <Text style={styles.summaryText}>Date: {moment(appointmentData.date).format('DD MMM YYYY')}</Text>
              <Text style={styles.summaryText}>Time: {appointmentData.slot}</Text>
              <Text style={styles.summaryText}>Patient: {appointmentData.patientName}</Text>
              <Text style={styles.amountText}>Total: {currency} {amount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <FullLoader loading={true} />
            <Text style={styles.loadingTitle}>
              {selectedPaymentMethod === 'Pay with Card' ? 'Processing Payment...' : 'Booking Appointment...'}
            </Text>
            <Text style={styles.loadingSubtitle}>
              {selectedPaymentMethod === 'Pay with Card' 
                ? 'Please wait while we securely process your payment and book your appointment.'
                : 'Please wait while we confirm your appointment booking.'
              }
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StackHeader 
        title={'Payment Options'} 
        headerStyle={{ paddingLeft: 0, paddingBottom: hp(2) }}
        onBackPress={() => {
          if (!processing) {
            navigation.goBack();
          }
        }}
      />

      {/* Payment Summary */}
      {appointmentData && (
        <View style={styles.paymentSummary}>
          <Text style={styles.summaryTitle}>Appointment Summary</Text>
          <Text style={styles.summaryText}>Doctor: {appointmentData.doctor?.name}</Text>
          <Text style={styles.summaryText}>Date: {moment(appointmentData.date).format('DD MMM YYYY')}</Text>
          <Text style={styles.summaryText}>Time: {appointmentData.slot}</Text>
          <Text style={styles.summaryText}>Patient: {appointmentData.patientName}</Text>
          <Text style={styles.amountText}>Total: {currency} {amount}</Text>
        </View>
      )}

      {paymentOptions.map((section) => (
        <View key={section.category} style={styles.section}>
          <Text style={styles.category}>{section.category}</Text>
          {section.options.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              style={[
                styles.option,
                processing && selectedPaymentMethod === option.name && { opacity: 0.6 },
                option.disabled && { opacity: 0.4 }
              ]}
              onPress={() => !option.disabled && handlePayment(option.name)}
              disabled={processing || option.disabled}
            >
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  {section.category === 'More Payment Options' ? 
                    <FontAwesome5Pro 
                      name={option.icon} 
                      size={24} 
                      color={
                        option.icon === 'paypal' ? '#003087' : 
                        option.icon === 'apple-pay' ? '#000' : 
                        isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor
                      } 
                    /> : 
                    <Icon 
                      name={option.icon} 
                      size={24} 
                      color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} 
                    />
                  }
                </View>
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentNameContainer}>
                    <Text style={styles.optionText}>{option.name}</Text>
                    {option.badge && (
                      <View style={styles.secureBadge}>
                        <Text style={styles.secureBadgeText}>{option.badge}</Text>
                      </View>
                    )}
                    {option.disabled && (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Coming Soon</Text>
                      </View>
                    )}
                  </View>
                  {option.description && (
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  )}
                </View>
              </View>
              
              {!option.disabled && (
                <View style={styles.paymentAction}>
                  {processing && selectedPaymentMethod === option.name ? (
                    <View style={styles.processingContainer}>
                      <ActivityIndicator 
                        size="small" 
                        color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} 
                      />
                      <Text style={styles.processingText}>Processing...</Text>
                    </View>
                  ) : (
                    <Text style={styles.addText}>Pay</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};



export default PaymentOptions;