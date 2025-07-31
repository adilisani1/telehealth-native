import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
// import { useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
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
import { useAlert } from '../../Providers/AlertContext';
import FullLoader from '../../components/Loaders';
import moment from 'moment';

const PaymentOptions = ({navigation, route}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const { showAlert } = useAlert();
  // const stripe = useStripe();
  // const { confirmPayment } = useConfirmPayment();
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  
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

  const processPayment = async (paymentMethod) => {
    setProcessing(true);
    
    try {
      // Handle Stripe Card Payment
      if (paymentMethod === 'Add New Card') {
        // Temporarily disabled - Stripe native module linking issue
        Alert.alert(
          'Payment Method Unavailable',
          'Credit card payments are temporarily unavailable due to a technical issue. Please use other payment methods.',
          [
            { text: 'OK', onPress: () => setProcessing(false) }
          ]
        );
        return;
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
          name: 'Add New Card',
          icon: 'credit-card', // Replace with your local icon path
        },
      ],
    },
//    {
//      category: 'Crypto Payment',
//      options: [
//        {
//          id: 2,
//          name: 'Bitcoin Payment',
//          icon: 'bitcoin',
//        },
//      ],
//    },
    {
      category: 'More Payment Options',
      options: [
        {
          id: 3,
          name: 'Paypal',
         icon: 'paypal'
        },
//        {
//          id: 4,
//          name: 'Apple Pay',
//          icon: 'apple-pay',
//        },
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
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1.5%'),
    },
    option: {
      backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.secondryColor,
      borderRadius: wp('2%'),
      padding: wp('4%'),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp('1%'),
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      width: wp('8%'),
      height: wp('8%'),
      resizeMode: 'contain',
      marginRight: wp('4%'),
    },
    optionText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Thin,
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.secondryTextColor,
    },
    addText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor,
    },
    paymentSummary: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderRadius: wp('3%'),
      padding: wp('4%'),
      marginBottom: hp('3%'),
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    summaryTitle: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1%'),
    },
    summaryText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
      marginBottom: hp('0.5%'),
    },
    amountText: {
      fontSize: RFPercentage(3),
      fontFamily: Fonts.Bold,
      color: '#28a745',
      textAlign: 'center',
      marginTop: hp('1%'),
    },
  });

  if (processing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <FullLoader loading={true} />
        <Text style={[styles.summaryText, { marginTop: hp(2) }]}>Processing payment...</Text>
        <Text style={[styles.summaryText, { fontSize: RFPercentage(1.8), color: '#666' }]}>
          Please wait while we process your payment and book your appointment.
        </Text>
      </View>
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
                processing && selectedPaymentMethod === option.name && { opacity: 0.6 }
              ]}
              onPress={() => handlePayment(option.name)}
              disabled={processing}
            >
              <View style={styles.optionContent}>
                {
                  section.category === 'More Payment Options' ? 
                    <FontAwesome5Pro 
                      name={option.icon} 
                      size={20} 
                      style={{marginRight: wp(2)}} 
                      color={option.icon === 'paypal' ? '#003087': 'black'} 
                    /> : 
                    <Icon 
                      name={option.icon} 
                      size={20} 
                      color={option.icon === 'bitcoin' ? '#F7931A' : isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor} 
                      style={{marginRight: wp(2)}} 
                    />
                }
                <Text style={styles.optionText}>{option.name}</Text>
              </View>
              <Text style={[
                styles.addText,
                processing && selectedPaymentMethod === option.name && { color: '#666' }
              ]}>
                {processing && selectedPaymentMethod === option.name ? 'Processing...' : 'Pay'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};



export default PaymentOptions;