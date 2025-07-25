import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { testPatientInfoAPI, testWithRealAppointment } from '../utils/testPatientInfo';

/**
 * Temporary debug component to test patient information
 * Add this to any screen to test patient data functionality
 */
const DebugPatientInfo = ({ appointment = null }) => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      let result;
      if (appointment) {
        console.log('🧪 Testing with real appointment:', appointment);
        result = await testWithRealAppointment(appointment);
      } else {
        console.log('🧪 Testing with mock patient ID');
        result = await testPatientInfoAPI('mock-patient-id');
      }
      setTestResult(result);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Patient Info Debug Tool</Text>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={runTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Test...' : 'Test Patient Info API'}
        </Text>
      </TouchableOpacity>

      {appointment && (
        <View style={styles.appointmentInfo}>
          <Text style={styles.sectionTitle}>Current Appointment Info:</Text>
          <Text style={styles.infoText}>ID: {appointment.id || 'N/A'}</Text>
          <Text style={styles.infoText}>Patient ID: {appointment.patientId || 'N/A'}</Text>
          <Text style={styles.infoText}>Patient Name: {appointment.patientName || 'N/A'}</Text>
        </View>
      )}

      {testResult && (
        <ScrollView style={styles.results}>
          <Text style={styles.sectionTitle}>Test Results:</Text>
          <Text style={[styles.status, testResult.success ? styles.success : styles.error]}>
            Status: {testResult.success ? '✅ Success' : '❌ Failed'}
          </Text>
          
          {testResult.error && (
            <Text style={styles.errorText}>Error: {testResult.error}</Text>
          )}
          
          {testResult.patientData && (
            <View style={styles.patientData}>
              <Text style={styles.sectionTitle}>Patient Data Found:</Text>
              <Text style={styles.infoText}>Name: {testResult.patientData.name || testResult.patientData.fullName || 'N/A'}</Text>
              <Text style={styles.infoText}>Email: {testResult.patientData.email || testResult.patientData.emailAddress || 'N/A'}</Text>
              <Text style={styles.infoText}>Phone: {testResult.patientData.phone || testResult.patientData.phoneNumber || testResult.patientData.mobile || 'N/A'}</Text>
              <Text style={styles.infoText}>Age: {testResult.patientData.age || 'N/A'}</Text>
              <Text style={styles.infoText}>Gender: {testResult.patientData.gender || testResult.patientData.sex || 'N/A'}</Text>
            </View>
          )}
          
          {testResult.issues && testResult.issues.length > 0 && (
            <View style={styles.issues}>
              <Text style={styles.sectionTitle}>Issues Found:</Text>
              {testResult.issues.map((issue, index) => (
                <Text key={index} style={styles.issueText}>• {issue}</Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  appointmentInfo: {
    backgroundColor: '#e8f4fd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  results: {
    maxHeight: 300,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
  errorText: {
    color: '#F44336',
    marginBottom: 10,
  },
  patientData: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  issues: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 6,
  },
  issueText: {
    color: '#856404',
    marginBottom: 4,
  },
});

export default DebugPatientInfo;
