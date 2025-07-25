import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  getPatientDetails, 
  getPatientHealthRecords,
  acceptAppointment,
  cancelAppointment,
  completeAppointment
} from '../services/appointmentManagementService';
import { Colors } from '../Constants/themeColors';
import { Fonts } from '../Constants/Fonts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const wp = (percentage) => (screenWidth * percentage) / 100;
const hp = (percentage) => (screenHeight * percentage) / 100;

const AppointmentDetailsModal = ({ 
  visible, 
  onClose, 
  appointment, 
  onAppointmentUpdated 
}) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const [patientDetails, setPatientDetails] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  // Simple alert function to replace useAlert
  const showAlert = (message, type = 'info') => {
    Alert.alert(
      type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
      message,
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    if (visible && appointment) {
      console.log('🔵 MODAL OPENED - APPOINTMENT DATA CHECK:');
      console.log('=========================================');
      console.log('Appointment received:', JSON.stringify(appointment, null, 2));
      fetchPatientDetails();
    }
  }, [visible, appointment]);

  const fetchPatientDetails = async () => {
    console.log('🔍 DEBUGGING PATIENT DETAILS FETCH');
    console.log('=====================================');
    console.log('1. Appointment Object:');
    console.log('   - ID:', appointment?.id);
    console.log('   - Patient ID:', appointment?.patientId);
    console.log('   - Patient Name:', appointment?.patientName);
    console.log('   - Patient Details:', appointment?.patientDetails);
    console.log('   - Full Appointment:', JSON.stringify(appointment, null, 2));
    
    if (!appointment?.patientId) {
      console.log('❌ No patientId found in appointment:', appointment);
      // Try to use patient details from appointment if available
      if (appointment?.patientDetails) {
        console.log('✅ Using patient details from appointment object');
        setPatientDetails(appointment.patientDetails);
        setLoading(false);
        return;
      }
      // Try using patient object from appointment
      if (appointment?.patient) {
        console.log('✅ Using patient object from appointment');
        setPatientDetails(appointment.patient);
        setLoading(false);
        return;
      }
      // Create patient data from appointment fields if available
      if (appointment?.patientName || appointment?.patientEmail || appointment?.patientPhone) {
        console.log('✅ Creating patient data from appointment fields');
        const patientData = {
          name: appointment.patientName,
          email: appointment.patientEmail,
          phone: appointment.patientPhone,
          age: appointment.patientAge,
          gender: appointment.patientGender,
          dob: appointment.patientDOB,
        };
        setPatientDetails(patientData);
        setLoading(false);
        return;
      }
      console.log('❌ No patient details available anywhere');
      setLoading(false);
      return;
    }
    
    const patientId = appointment.patient?._id || appointment.patientId;
    console.log('2. Starting API call for patient ID:', patientId);
    console.log('   - appointment.patient._id:', appointment.patient?._id);
    console.log('   - appointment.patientId:', appointment.patientId);
    
    if (!patientId) {
      console.log('❌ No patient ID found in appointment data');
      showAlert('Patient information not available', 'error');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Fetch patient details
      const patientResponse = await getPatientDetails(patientId);
      console.log('📥 FRONTEND STEP 3: RAW API RESPONSE RECEIVED');
      console.log('   - Response Type:', typeof patientResponse);
      console.log('   - Response Keys:', patientResponse ? Object.keys(patientResponse) : 'No keys');
      console.log('   - Full Response:', JSON.stringify(patientResponse, null, 2));
      
      // Handle different response structures more comprehensively
      let patientData = null;
      
      if (patientResponse) {
        // Try different possible structures with better nested handling
        if (patientResponse.success && patientResponse.data && patientResponse.data.patient) {
          console.log('✅ FRONTEND STEP 4A: Using response.success.data.patient structure');
          patientData = patientResponse.data.patient;
        } else if (patientResponse.data && patientResponse.data.patient) {
          console.log('✅ FRONTEND STEP 4B: Using response.data.patient structure');
          patientData = patientResponse.data.patient;
        } else if (patientResponse.success && patientResponse.data) {
          console.log('✅ Using response.success.data structure');
          patientData = patientResponse.data;
        } else if (patientResponse.data && typeof patientResponse.data === 'object') {
          console.log('✅ Using response.data structure');
          patientData = patientResponse.data;
        } else if (patientResponse.user) {
          console.log('✅ Using response.user structure');
          patientData = patientResponse.user;
        } else if (patientResponse.patient) {
          console.log('✅ Using response.patient structure');
          patientData = patientResponse.patient;
        } else if (patientResponse.name || patientResponse.email) {
          console.log('✅ Using direct patient object structure');
          patientData = patientResponse;
        } else {
          console.log('⚠️ Unexpected response structure - using as-is:', patientResponse);
          patientData = patientResponse;
        }
      }
      
      console.log('4. PROCESSED PATIENT DATA:');
      console.log('   - Type:', typeof patientData);
      console.log('   - Name:', patientData?.name || patientData?.fullName || 'NOT FOUND');
      console.log('   - Email:', patientData?.email || patientData?.emailAddress || 'NOT FOUND');
      console.log('   - Phone:', patientData?.phone || patientData?.phoneNumber || patientData?.mobile || 'NOT FOUND');
      console.log('   - Age:', patientData?.age || 'NOT FOUND');
      console.log('   - Gender:', patientData?.gender || patientData?.sex || 'NOT FOUND');
      console.log('   - Full Data:', JSON.stringify(patientData, null, 2));
      
      // Check if patient data is empty or null
      if (!patientData || Object.keys(patientData).length === 0 || 
          (!patientData.name && !patientData.fullName && !patientData.email)) {
        console.log('❌ CRITICAL: Patient data is empty or invalid! Using appointment fallback...');
        
        // Try to use patient data from appointment if available
        if (appointment?.patient) {
          console.log('✅ Found patient data in appointment.patient');
          patientData = appointment.patient;
        } else if (appointment?.patientDetails) {
          console.log('✅ Found patient data in appointment.patientDetails');
          patientData = appointment.patientDetails;
        } else {
          console.log('✅ Creating patient data from appointment fields');
          // Create minimal patient data from appointment
          patientData = {
            name: appointment?.patientName || 'Unknown',
            email: appointment?.patientEmail || null,
            phone: appointment?.patientPhone || null,
            age: appointment?.patientAge || null,
            gender: appointment?.patientGender || null,
            dob: appointment?.patientDOB || null,
          };
          console.log('📦 Created minimal patient data from appointment:', patientData);
        }
      }
      
      console.log('📥 FRONTEND STEP 5: FINAL PATIENT DATA BEFORE SETTING STATE');
      console.log('   - Final patientData object:', JSON.stringify(patientData, null, 2));
      console.log('   - Final patientData.gender specifically:', patientData?.gender);
      console.log('   - Final patientData.sex specifically:', patientData?.sex);
      console.log('   - All gender-related fields:');
      console.log('     * patientData.gender:', patientData?.gender);
      console.log('     * patientData.sex:', patientData?.sex);
      console.log('     * appointment.patientGender:', appointment?.patientGender);
      console.log('     * appointment.patient?.gender:', appointment?.patient?.gender);
      console.log('     * appointment.patient?.sex:', appointment?.patient?.sex);
      
      setPatientDetails(patientData);
      
      console.log('✅ FRONTEND STEP 6: PatientDetails state has been updated');
      
      // Try to fetch health records (but don't fail if it doesn't work)
      try {
        const patientId = appointment.patient?._id || appointment.patientId;
        console.log('5. ATTEMPTING TO FETCH HEALTH RECORDS for patient ID:', patientId);
        console.log('   - appointment.patient._id:', appointment.patient?._id);
        console.log('   - appointment.patientId:', appointment.patientId);
        
        if (!patientId) {
          throw new Error('Patient ID not found in appointment data');
        }
        
        const healthResponse = await getPatientHealthRecords(patientId);
        console.log('✅ Health records response:', healthResponse);
        
        let healthData = [];
        if (healthResponse && healthResponse.success && healthResponse.data) {
          healthData = Array.isArray(healthResponse.data) ? healthResponse.data : [healthResponse.data];
        } else if (Array.isArray(healthResponse)) {
          healthData = healthResponse;
        }
        
        setHealthRecords(healthData);
        console.log('✅ Health records processed:', healthData.length, 'records');
      } catch (healthError) {
        console.log('⚠️ Health records not available:', healthError.message);
        setHealthRecords([]);
        // Don't show error to user for health records - it's optional
      }
      
    } catch (error) {
      console.error('❌ ERROR FETCHING PATIENT DETAILS:');
      console.error('   - Message:', error.message);
      console.error('   - Status:', error.response?.status);
      console.error('   - Data:', error.response?.data);
      console.error('   - Full Error:', error);
      showAlert('Failed to load patient details. Please try again.', 'error');
      
      // Try to use patient details from appointment as fallback
      if (appointment?.patientDetails) {
        console.log('🔄 Using fallback patient details from appointment');
        setPatientDetails(appointment.patientDetails);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    const appointmentId = appointment?.id || appointment?._id;
    if (!appointmentId) {
      console.log('❌ No appointment ID found:', appointment);
      showAlert('Invalid appointment ID', 'error');
      return;
    }
    
    Alert.alert(
      'Accept Appointment',
      'Are you sure you want to accept this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          style: 'default',
          onPress: async () => {
            console.log('🔄 Accepting appointment:', appointmentId);
            setActionLoading('accept');
            try {
              const result = await acceptAppointment(appointmentId);
              console.log('✅ Accept result:', result);
              showAlert('Appointment accepted successfully', 'success');
              onAppointmentUpdated();
              onClose();
            } catch (error) {
              console.error('❌ Error accepting appointment:', error);
              showAlert(error.message || 'Failed to accept appointment', 'error');
            } finally {
              setActionLoading('');
            }
          }
        }
      ]
    );
  };

  const handleCancel = async () => {
    const appointmentId = appointment?.id || appointment?._id;
    if (!appointmentId) {
      console.log('❌ No appointment ID found:', appointment);
      showAlert('Invalid appointment ID', 'error');
      return;
    }
    
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            console.log('🔄 Cancelling appointment:', appointmentId);
            setActionLoading('cancel');
            try {
              const result = await cancelAppointment(appointmentId, 'Cancelled by doctor');
              console.log('✅ Cancel result:', result);
              showAlert('Appointment cancelled successfully', 'success');
              onAppointmentUpdated();
              onClose();
            } catch (error) {
              console.error('❌ Error cancelling appointment:', error);
              showAlert(error.message || 'Failed to cancel appointment', 'error');
            } finally {
              setActionLoading('');
            }
          }
        }
      ]
    );
  };

  const handleComplete = async () => {
    const appointmentId = appointment?.id || appointment?._id;
    if (!appointmentId) {
      console.log('❌ No appointment ID found:', appointment);
      showAlert('Invalid appointment ID', 'error');
      return;
    }
    
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          style: 'default',
          onPress: async () => {
            console.log('🔄 Completing appointment:', appointmentId);
            setActionLoading('complete');
            try {
              const result = await completeAppointment(appointmentId);
              console.log('✅ Complete result:', result);
              showAlert('Appointment completed successfully', 'success');
              onAppointmentUpdated();
              onClose();
            } catch (error) {
              console.error('❌ Error completing appointment:', error);
              showAlert(error.message || 'Failed to complete appointment', 'error');
            } finally {
              setActionLoading('');
            }
          }
        }
      ]
    );
  };

  const isAppointmentPassed = () => {
    if (!appointment?.dateISO && !appointment?.date) return false;
    const appointmentDate = appointment.dateISO || appointment.date;
    return new Date(appointmentDate) < new Date();
  };

  const canComplete = () => {
    return appointment?.status === 'accepted' && isAppointmentPassed();
  };

  const canAcceptOrCancel = () => {
    return appointment?.status === 'requested';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.backgroundColor,
      borderRadius: wp(4),
      padding: wp(5),
      width: wp(90),
      maxHeight: hp(80),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(3),
      borderBottomWidth: 1,
      borderBottomColor: theme.BorderGrayColor,
      paddingBottom: hp(2),
    },
    modalTitle: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
    },
    closeButton: {
      padding: wp(1),
    },
    loadingContainer: {
      height: hp(30),
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: hp(3),
    },
    sectionTitle: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
      marginBottom: hp(1.5),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(0.8),
      borderBottomWidth: 0.5,
      borderBottomColor: theme.BorderGrayColor,
    },
    detailLabel: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
      color: theme.secondryTextColor,
      flex: 1,
    },
    detailValue: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: theme.primaryTextColor,
      flex: 2,
      textAlign: 'right',
    },
    statusBadge: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: wp(2),
      alignSelf: 'flex-start',
      marginVertical: hp(1),
    },
    statusText: {
      color: Colors.white,
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Medium,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: hp(3),
      paddingTop: hp(2),
      borderTopWidth: 1,
      borderTopColor: theme.BorderGrayColor,
    },
    actionButton: {
      flex: 1,
      paddingVertical: hp(1.8),
      paddingHorizontal: wp(4),
      borderRadius: wp(2),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    acceptButton: {
      backgroundColor: Colors.success,
    },
    cancelButton: {
      backgroundColor: Colors.error,
    },
    completeButton: {
      backgroundColor: theme.primaryColor,
    },
    actionButtonText: {
      color: Colors.white,
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Bold,
    },
    healthInfoContainer: {
      backgroundColor: theme.secondryColor,
      padding: wp(3),
      borderRadius: wp(2),
      marginTop: hp(1),
    },
    healthInfoText: {
      fontSize: RFPercentage(1.7),
      fontFamily: Fonts.Regular,
      color: theme.primaryTextColor,
      lineHeight: RFPercentage(2.5),
    },
    healthRecordItem: {
      backgroundColor: theme.secondryColor,
      padding: wp(3),
      borderRadius: wp(2),
      marginBottom: hp(1),
    },
    recordSeparator: {
      height: 1,
      backgroundColor: theme.BorderGrayColor,
      marginVertical: hp(1),
    },
  });

  if (!appointment) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Appointment Details</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              disabled={actionLoading !== ''}>
              <Icon 
                name="close" 
                size={RFPercentage(3)} 
                color={theme.primaryTextColor} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Appointment Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appointment Information</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{formatDate(appointment.dateISO || appointment.date)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>{formatTime(appointment.dateISO || appointment.date)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{appointment.type || 'Consultation'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee:</Text>
                <Text style={styles.detailValue}>
                  {appointment.currency || 'PKR'} {appointment.fee || 'N/A'}
                </Text>
              </View>

              {/* Patient's Problem */}
              {appointment.problem && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Patient's Problem:</Text>
                  <Text style={[styles.detailValue, { textAlign: 'left', flex: 2 }]}>
                    {appointment.problem}
                  </Text>
                </View>
              )}

              {/* Symptoms */}
              {appointment.symptoms && appointment.symptoms !== appointment.problem && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Symptoms:</Text>
                  <Text style={[styles.detailValue, { textAlign: 'left', flex: 2 }]}>
                    {appointment.symptoms}
                  </Text>
                </View>
              )}

              {/* Reason for Visit */}
              {appointment.reasonForVisit && appointment.reasonForVisit !== appointment.problem && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reason for Visit:</Text>
                  <Text style={[styles.detailValue, { textAlign: 'left', flex: 2 }]}>
                    {appointment.reasonForVisit}
                  </Text>
                </View>
              )}

              {/* Duration */}
              {appointment.duration && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{appointment.duration} minutes</Text>
                </View>
              )}

              {/* Priority */}
              {appointment.priority && appointment.priority !== 'normal' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority:</Text>
                  <Text style={[styles.detailValue, { 
                    color: appointment.priority === 'high' ? Colors.error : 
                           appointment.priority === 'urgent' ? Colors.error : theme.primaryTextColor 
                  }]}>
                    {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)}
                  </Text>
                </View>
              )}

              {/* Status Badge */}
              <View style={[
                styles.statusBadge, 
                { 
                  backgroundColor: appointment.status === 'requested' ? Colors.warning : 
                                 appointment.status === 'accepted' ? Colors.success : 
                                 appointment.status === 'completed' ? Colors.info : Colors.error 
                }
              ]}>
                <Text style={styles.statusText}>
                  {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                </Text>
              </View>
            </View>

            {/* Patient Information */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primaryColor} />
                <Text style={[styles.detailValue, { textAlign: 'center', marginTop: hp(2) }]}>
                  Loading patient details...
                </Text>
              </View>
            ) : patientDetails ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>
                    {(() => {
                      const name = patientDetails?.name || patientDetails?.fullName || appointment?.patientName || 'N/A';
                      console.log('🏷️ RENDERING NAME:', name);
                      console.log('   - patientDetails.name:', patientDetails?.name);
                      console.log('   - patientDetails.fullName:', patientDetails?.fullName);
                      console.log('   - appointment.patientName:', appointment?.patientName);
                      return name;
                    })()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>
                    {(() => {
                      const email = patientDetails?.email || patientDetails?.emailAddress || appointment?.patientEmail || 'N/A';
                      console.log('📧 RENDERING EMAIL:', email);
                      console.log('   - patientDetails.email:', patientDetails?.email);
                      console.log('   - patientDetails.emailAddress:', patientDetails?.emailAddress);
                      console.log('   - appointment.patientEmail:', appointment?.patientEmail);
                      return email;
                    })()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>
                    {(() => {
                      const phone = patientDetails?.phone || patientDetails?.phoneNumber || patientDetails?.mobile || appointment?.patientPhone || 'N/A';
                      console.log('📱 RENDERING PHONE:', phone);
                      console.log('   - patientDetails.phone:', patientDetails?.phone);
                      console.log('   - patientDetails.phoneNumber:', patientDetails?.phoneNumber);
                      console.log('   - patientDetails.mobile:', patientDetails?.mobile);
                      console.log('   - appointment.patientPhone:', appointment?.patientPhone);
                      console.log('   - appointment.patient?.phone:', appointment?.patient?.phone);
                      
                      // Try appointment.patient.phone as additional fallback
                      const fallbackPhone = phone === 'N/A' ? appointment?.patient?.phone : phone;
                      console.log('   - final phone after fallback:', fallbackPhone);
                      
                      return fallbackPhone || 'N/A';
                    })()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Age:</Text>
                  <Text style={styles.detailValue}>
                    {(() => {
                      // Calculate age from multiple possible sources
                      const dobSources = [
                        patientDetails?.dob,
                        patientDetails?.dateOfBirth,
                        appointment?.patientDOB,
                        appointment?.patient?.dob  // Add this missing source
                      ];
                      
                      let age = patientDetails?.age || appointment?.patientAge;
                      
                      // If no direct age, calculate from DOB
                      if (!age) {
                        for (const dob of dobSources) {
                          if (dob) {
                            age = calculateAge(dob);
                            break;
                          }
                        }
                      }
                      
                      console.log('🎂 RENDERING AGE:', age);
                      console.log('   - patientDetails.age:', patientDetails?.age);
                      console.log('   - appointment.patientAge:', appointment?.patientAge);
                      console.log('   - patientDetails.dob:', patientDetails?.dob);
                      console.log('   - patientDetails.dateOfBirth:', patientDetails?.dateOfBirth);
                      console.log('   - appointment.patientDOB:', appointment?.patientDOB);
                      console.log('   - appointment.patient.dob:', appointment?.patient?.dob);
                      console.log('   - calculated age:', age);
                      
                      return age && age !== 'NaN' && age > 0 ? `${age} years` : 'N/A';
                    })()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Gender:</Text>
                  <Text style={styles.detailValue}>
                    {(() => {
                      // More comprehensive gender extraction with detailed debugging
                      console.log('⚧️ FRONTEND STEP 7: ANALYZING GENDER DATA FOR RENDERING');
                      console.log('   - patientDetails object:', patientDetails);
                      console.log('   - patientDetails.gender value:', patientDetails?.gender);
                      console.log('   - patientDetails.gender type:', typeof patientDetails?.gender);
                      console.log('   - patientDetails.gender === null:', patientDetails?.gender === null);
                      console.log('   - patientDetails.gender === undefined:', patientDetails?.gender === undefined);
                      console.log('   - patientDetails.gender === "":', patientDetails?.gender === '');
                      console.log('   - patientDetails.sex value:', patientDetails?.sex);
                      console.log('   - appointment.patientGender value:', appointment?.patientGender);
                      console.log('   - appointment.patient?.gender value:', appointment?.patient?.gender);
                      console.log('   - appointment.patient?.sex value:', appointment?.patient?.sex);
                      
                      const genderSources = [
                        { source: 'patientDetails.gender', value: patientDetails?.gender },
                        { source: 'patientDetails.sex', value: patientDetails?.sex },
                        { source: 'appointment.patientGender', value: appointment?.patientGender },
                        { source: 'appointment.patient.gender', value: appointment?.patient?.gender },
                        { source: 'appointment.patient.sex', value: appointment?.patient?.sex }
                      ];
                      
                      console.log('   - All gender sources:', genderSources);
                      
                      let finalGender = 'N/A';
                      for (const { source, value } of genderSources) {
                        if (value && value !== null && value !== undefined && value !== '' && value !== 'null' && value !== 'undefined') {
                          console.log(`✅ Found gender from ${source}:`, value);
                          finalGender = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); // Capitalize
                          break;
                        } else {
                          console.log(`❌ No gender from ${source} (value: ${value})`);
                        }
                      }
                      
                      // If still no gender found, try to infer from name or set a user-friendly message
                      if (finalGender === 'N/A') {
                        console.log('🔧 FRONTEND FALLBACK: No gender data found anywhere, using fallback');
                        finalGender = 'Not specified';
                      }
                      
                      console.log('🎯 FINAL GENDER FOR DISPLAY:', finalGender);
                      return finalGender;
                    })()}
                  </Text>
                </View>

                {/* Additional patient fields */}
                {(patientDetails.address || patientDetails.location) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={[styles.detailValue, { textAlign: 'left', flex: 2 }]}>
                      {patientDetails.address || patientDetails.location}
                    </Text>
                  </View>
                )}

                {patientDetails.emergencyContact && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Emergency Contact:</Text>
                    <Text style={styles.detailValue}>
                      {patientDetails.emergencyContact}
                    </Text>
                  </View>
                )}

                {/* Health Information */}
                {(patientDetails.healthInfo || patientDetails.medicalHistory) && (
                  <>
                    <Text style={[styles.detailLabel, { marginTop: hp(2), marginBottom: hp(1) }]}>
                      Health Information:
                    </Text>
                    <View style={styles.healthInfoContainer}>
                      <Text style={styles.healthInfoText}>
                        {patientDetails.healthInfo || patientDetails.medicalHistory}
                      </Text>
                    </View>
                  </>
                )}

                {/* Allergies */}
                {patientDetails.allergies && (
                  <>
                    <Text style={[styles.detailLabel, { marginTop: hp(2), marginBottom: hp(1) }]}>
                      Allergies:
                    </Text>
                    <View style={[styles.healthInfoContainer, { backgroundColor: '#fff3cd' }]}>
                      <Text style={[styles.healthInfoText, { color: '#856404' }]}>
                        {Array.isArray(patientDetails.allergies) 
                          ? patientDetails.allergies.join(', ') 
                          : patientDetails.allergies}
                      </Text>
                    </View>
                  </>
                )}

                {/* Current Medications */}
                {patientDetails.currentMedications && (
                  <>
                    <Text style={[styles.detailLabel, { marginTop: hp(2), marginBottom: hp(1) }]}>
                      Current Medications:
                    </Text>
                    <View style={styles.healthInfoContainer}>
                      <Text style={styles.healthInfoText}>
                        {Array.isArray(patientDetails.currentMedications) 
                          ? patientDetails.currentMedications.join(', ') 
                          : patientDetails.currentMedications}
                      </Text>
                    </View>
                  </>
                )}

                {/* Health Information */}
                {patientDetails.healthInfo && (
                  <>
                    <Text style={[styles.detailLabel, { marginTop: hp(2), marginBottom: hp(1) }]}>
                      Health Information:
                    </Text>
                    <View style={styles.healthInfoContainer}>
                      <Text style={styles.healthInfoText}>{patientDetails.healthInfo}</Text>
                    </View>
                  </>
                )}

                {/* Health Records Section */}
                {healthRecords.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: hp(2) }]}>Health Records</Text>
                    {healthRecords.map((record, index) => (
                      <View key={record._id || index} style={styles.healthRecordItem}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Date:</Text>
                          <Text style={styles.detailValue}>
                            {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                          </Text>
                        </View>
                        
                        {record.diagnosis && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Diagnosis:</Text>
                            <Text style={[styles.detailValue, { textAlign: 'left', flex: 2 }]}>
                              {record.diagnosis}
                            </Text>
                          </View>
                        )}
                        
                        {record.medications && record.medications.length > 0 && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Medications:</Text>
                            <Text style={[styles.detailValue, { textAlign: 'left', flex: 2 }]}>
                              {record.medications.join(', ')}
                            </Text>
                          </View>
                        )}
                        
                        {record.notes && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Notes:</Text>
                            <Text style={[styles.detailValue, { textAlign: 'left', flex: 2 }]}>
                              {record.notes}
                            </Text>
                          </View>
                        )}
                        
                        {record.attachments && record.attachments.length > 0 && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Attachments:</Text>
                            <Text style={[styles.detailValue, { textAlign: 'left', flex: 2 }]}>
                              {record.attachments.length} file(s) uploaded
                            </Text>
                          </View>
                        )}
                        
                        {index < healthRecords.length - 1 && (
                          <View style={styles.recordSeparator} />
                        )}
                      </View>
                    ))}
                  </>
                )}
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <Text style={[styles.detailValue, { textAlign: 'center', color: Colors.error }]}>
                  Failed to load patient details
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            {(canAcceptOrCancel() || canComplete()) && (
              <View style={styles.actionButtonsContainer}>
                {canAcceptOrCancel() && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={handleAccept}
                      disabled={actionLoading !== ''}>
                      {actionLoading === 'accept' ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={styles.actionButtonText}>Accept</Text>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={handleCancel}
                      disabled={actionLoading !== ''}>
                      {actionLoading === 'cancel' ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={styles.actionButtonText}>Cancel</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
                
                {canComplete() && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={handleComplete}
                    disabled={actionLoading !== ''}>
                    {actionLoading === 'complete' ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.actionButtonText}>Complete</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AppointmentDetailsModal;
