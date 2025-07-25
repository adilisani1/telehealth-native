/**
 * Backend API Endpoint Testing Script
 * 
 * This script helps test various backend endpoints to find the correct patient data source
 */

import { getToken } from '../utils/tokenStorage';
import axios from 'axios';

// Configure base URL for your backend
const BASE_URL = 'http://your-backend-url'; // Update this with your actual backend URL

const testBackendEndpoints = async (patientId) => {
  console.log('🔬 TESTING BACKEND API ENDPOINTS');
  console.log('=================================');
  console.log('Patient ID:', patientId);
  
  try {
    const token = await getToken();
    if (!token) {
      console.log('❌ No authentication token available');
      return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // List of potential endpoints that might contain patient data
    const endpointsToTest = [
      `/api/doctor/patient/${patientId}`,
      `/api/patient/${patientId}`,
      `/api/users/${patientId}`,
      `/api/doctor/patients/${patientId}`,
      `/api/patients/${patientId}`,
      `/api/user/${patientId}`,
      `/api/doctor/patient-details/${patientId}`,
      `/api/patient-profile/${patientId}`,
      `/api/appointments/${patientId}/patient`,
    ];
    
    const results = [];
    
    for (const endpoint of endpointsToTest) {
      try {
        console.log(`\n🔍 Testing: ${BASE_URL}${endpoint}`);
        
        const response = await axios.get(`${BASE_URL}${endpoint}`, { headers });
        
        console.log(`✅ SUCCESS - Status: ${response.status}`);
        console.log('Response structure:', Object.keys(response.data || {}));
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        // Analyze the response to see if it contains patient data
        const data = response.data;
        const patientData = data?.data || data?.user || data?.patient || data;
        
        const hasPatientInfo = patientData && (
          patientData.name || 
          patientData.fullName || 
          patientData.email || 
          patientData.phone
        );
        
        results.push({
          endpoint,
          status: response.status,
          hasPatientInfo,
          patientData: hasPatientInfo ? patientData : null,
          rawResponse: response.data
        });
        
        if (hasPatientInfo) {
          console.log('🎯 FOUND PATIENT DATA:');
          console.log('   - Name:', patientData.name || patientData.fullName);
          console.log('   - Email:', patientData.email || patientData.emailAddress);
          console.log('   - Phone:', patientData.phone || patientData.phoneNumber || patientData.mobile);
          console.log('   - Age:', patientData.age);
          console.log('   - DOB:', patientData.dob || patientData.dateOfBirth);
        }
        
      } catch (error) {
        console.log(`❌ FAILED - Status: ${error.response?.status || 'Network Error'}`);
        console.log('Error:', error.message);
        
        results.push({
          endpoint,
          status: error.response?.status || 0,
          error: error.message,
          errorData: error.response?.data
        });
      }
    }
    
    // Summary
    console.log('\n📊 ENDPOINT TEST SUMMARY');
    console.log('========================');
    
    const successful = results.filter(r => r.status === 200);
    const withPatientData = results.filter(r => r.hasPatientInfo);
    
    console.log(`Total endpoints tested: ${results.length}`);
    console.log(`Successful requests: ${successful.length}`);
    console.log(`Endpoints with patient data: ${withPatientData.length}`);
    
    if (withPatientData.length > 0) {
      console.log('\n🎯 RECOMMENDED ENDPOINT(S):');
      withPatientData.forEach(result => {
        console.log(`   - ${result.endpoint} (Status: ${result.status})`);
      });
    } else {
      console.log('\n❌ No endpoints returned patient data. Check:');
      console.log('   1. Patient ID is correct');
      console.log('   2. Backend endpoints are working');
      console.log('   3. Authentication permissions');
      console.log('   4. Database has patient data');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    return null;
  }
};

// Test with appointment data to check if patient info is embedded
export const testAppointmentEndpoints = async () => {
  console.log('🔬 TESTING APPOINTMENT ENDPOINTS FOR PATIENT DATA');
  console.log('===============================================');
  
  try {
    const token = await getToken();
    if (!token) {
      console.log('❌ No authentication token available');
      return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    
    const appointmentEndpoints = [
      '/api/doctor/appointments/upcoming',
      '/api/doctor/appointments',
      '/api/appointments',
      '/api/doctor/appointments/all',
    ];
    
    for (const endpoint of appointmentEndpoints) {
      try {
        console.log(`\n🔍 Testing: ${BASE_URL}${endpoint}`);
        
        const response = await axios.get(`${BASE_URL}${endpoint}`, { headers });
        
        console.log(`✅ SUCCESS - Status: ${response.status}`);
        
        // Check if appointments include patient data
        const appointments = response.data?.data?.appointments || response.data?.appointments || response.data;
        
        if (Array.isArray(appointments) && appointments.length > 0) {
          const firstAppt = appointments[0];
          console.log('Sample appointment structure:', Object.keys(firstAppt));
          console.log('Patient field:', firstAppt.patient ? Object.keys(firstAppt.patient) : 'No patient field');
          console.log('Has patientId:', !!firstAppt.patientId);
          console.log('Has patientName:', !!firstAppt.patientName);
          
          if (firstAppt.patient) {
            console.log('🎯 PATIENT DATA IN APPOINTMENT:');
            console.log('   - Name:', firstAppt.patient.name || firstAppt.patient.fullName);
            console.log('   - Email:', firstAppt.patient.email);
            console.log('   - Phone:', firstAppt.patient.phone);
            console.log('   - Full patient object:', JSON.stringify(firstAppt.patient, null, 2));
          }
        }
        
      } catch (error) {
        console.log(`❌ FAILED - Status: ${error.response?.status || 'Network Error'}`);
        console.log('Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Appointment endpoint test failed:', error);
  }
};

export default {
  testBackendEndpoints,
  testAppointmentEndpoints
};
