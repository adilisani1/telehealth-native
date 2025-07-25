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
import { Colors } from '../Constants/themeColors';
import { Fonts } from '../Constants/Fonts';
import { 
  getPatientDetails, 
  getPatientHealthRecords,
  acceptAppointment, 
  cancelAppointment, 
  completeAppointment 
} from '../services/appointmentManagementService';

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
      fetchPatientDetails();
    }
  }, [visible, appointment]);

  const fetchPatientDetails = async () => {
    if (!appointment?.patientId) {
      console.log('❌ No patientId found in appointment:', appointment);
      return;
    }
    
    console.log('🔍 Fetching patient details for ID:', appointment.patientId);
    setLoading(true);
    try {
      // Fetch patient details
      const patientResponse = await getPatientDetails(appointment.patientId);
      console.log('✅ Patient details response:', patientResponse);
      
      // Handle different response structures
      let patientData = null;
      if (patientResponse.success && patientResponse.data) {
        patientData = patientResponse.data;
      } else if (patientResponse.data) {
        patientData = patientResponse.data;
      } else if (patientResponse.user) {
        patientData = patientResponse.user;
      } else if (patientResponse.patient) {
        patientData = patientResponse.patient;
      } else {
        patientData = patientResponse;
      }
      
      setPatientDetails(patientData);
      
      // Fetch health records
      try {
        console.log('🔍 Fetching health records for patient ID:', appointment.patientId);
        const healthResponse = await getPatientHealthRecords(appointment.patientId);
        console.log('✅ Health records response:', healthResponse);
        
        let healthData = [];
        if (healthResponse.success && healthResponse.data) {
          healthData = Array.isArray(healthResponse.data) ? healthResponse.data : [healthResponse.data];
        } else if (Array.isArray(healthResponse)) {
          healthData = healthResponse;
        }
        
        setHealthRecords(healthData);
      } catch (healthError) {
        console.log('⚠️ Health records not available:', healthError.message);
        setHealthRecords([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching patient details:', error);
      showAlert('Failed to load patient details. Please try again.', 'error');
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
    if (!appointment?.date) return false;
    return new Date(appointment.date) < new Date();
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
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Patient Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{patientDetails.name || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{patientDetails.email || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{patientDetails.phone || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Age:</Text>
                    <Text style={styles.detailValue}>{calculateAge(patientDetails.dob)} years</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gender:</Text>
                    <Text style={styles.detailValue}>{patientDetails.gender || 'N/A'}</Text>
                  </View>

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
                </View>

                {/* Health Records Section */}
                {healthRecords.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Records</Text>
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
                  </View>
                )}
              </>
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
