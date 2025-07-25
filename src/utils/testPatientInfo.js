/**
 * Patient Information Testing Script
 * 
 * This script helps test and diagnose patient information display issues
 */

import { getPatientDetails, getPatientHealthRecords } from '../services/appointmentManagementService';
import { getToken } from '../utils/tokenStorage';

export const testPatientInfoAPI = async (testPatientId = null) => {
  console.log('🧪 STARTING PATIENT INFO API TEST');
  console.log('==================================');
  
  try {
    // Test 1: Check authentication
    console.log('1. Testing authentication...');
    const token = await getToken();
    if (!token) {
      console.log('❌ CRITICAL: No authentication token found');
      console.log('   Solution: User needs to log in again');
      return { success: false, error: 'No authentication token' };
    }
    console.log('✅ Authentication token exists');
    
    // Test 2: Use a test patient ID or prompt for one
    const patientId = testPatientId || 'test-patient-id-here';
    console.log('2. Testing patient details API...');
    console.log('   Using patient ID:', patientId);
    
    try {
      const patientResponse = await getPatientDetails(patientId);
      console.log('✅ Patient details API call successful');
      console.log('   Response structure analysis:');
      console.log('   - Type:', typeof patientResponse);
      console.log('   - Keys:', Object.keys(patientResponse || {}));
      console.log('   - Has success property:', 'success' in (patientResponse || {}));
      console.log('   - Has data property:', 'data' in (patientResponse || {}));
      console.log('   - Full response:', JSON.stringify(patientResponse, null, 2));
      
      // Test 3: Analyze patient data structure
      console.log('3. Analyzing patient data structure...');
      let patientData = null;
      
      if (patientResponse?.success && patientResponse?.data) {
        patientData = patientResponse.data;
        console.log('✅ Using response.success.data structure');
      } else if (patientResponse?.data) {
        patientData = patientResponse.data;
        console.log('✅ Using response.data structure');
      } else if (patientResponse?.user) {
        patientData = patientResponse.user;
        console.log('✅ Using response.user structure');
      } else if (patientResponse?.patient) {
        patientData = patientResponse.patient;
        console.log('✅ Using response.patient structure');
      } else {
        patientData = patientResponse;
        console.log('✅ Using direct response structure');
      }
      
      console.log('   Patient data analysis:');
      console.log('   - Name:', patientData?.name || 'NOT FOUND');
      console.log('   - Full Name:', patientData?.fullName || 'NOT FOUND');
      console.log('   - Email:', patientData?.email || 'NOT FOUND');
      console.log('   - Email Address:', patientData?.emailAddress || 'NOT FOUND');
      console.log('   - Phone:', patientData?.phone || 'NOT FOUND');
      console.log('   - Phone Number:', patientData?.phoneNumber || 'NOT FOUND');
      console.log('   - Mobile:', patientData?.mobile || 'NOT FOUND');
      console.log('   - Age:', patientData?.age || 'NOT FOUND');
      console.log('   - Gender:', patientData?.gender || 'NOT FOUND');
      console.log('   - DOB:', patientData?.dob || patientData?.dateOfBirth || 'NOT FOUND');
      
      // Test 4: Test health records (optional)
      console.log('4. Testing health records API...');
      try {
        const healthResponse = await getPatientHealthRecords(patientId);
        console.log('✅ Health records API call successful');
        console.log('   Health records count:', Array.isArray(healthResponse?.data) ? healthResponse.data.length : 'Unknown');
      } catch (healthError) {
        console.log('⚠️ Health records API failed (this is optional):', healthError.message);
      }
      
      return {
        success: true,
        patientData,
        issues: analyzePatientDataIssues(patientData)
      };
      
    } catch (apiError) {
      console.log('❌ Patient details API call failed');
      console.log('   Error message:', apiError.message);
      console.log('   Status code:', apiError.response?.status);
      console.log('   Error data:', apiError.response?.data);
      
      return {
        success: false,
        error: apiError.message,
        statusCode: apiError.response?.status,
        apiError: apiError.response?.data
      };
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    return { success: false, error: error.message };
  }
};

export const analyzePatientDataIssues = (patientData) => {
  const issues = [];
  
  if (!patientData) {
    issues.push('No patient data received');
    return issues;
  }
  
  if (!patientData.name && !patientData.fullName) {
    issues.push('Patient name is missing');
  }
  
  if (!patientData.email && !patientData.emailAddress) {
    issues.push('Patient email is missing');
  }
  
  if (!patientData.phone && !patientData.phoneNumber && !patientData.mobile) {
    issues.push('Patient phone number is missing');
  }
  
  if (!patientData.age && !patientData.dob && !patientData.dateOfBirth) {
    issues.push('Patient age/DOB information is missing');
  }
  
  if (!patientData.gender && !patientData.sex) {
    issues.push('Patient gender information is missing');
  }
  
  return issues;
};

export const testWithRealAppointment = (appointment) => {
  console.log('🔍 TESTING WITH REAL APPOINTMENT DATA');
  console.log('====================================');
  
  if (!appointment) {
    console.log('❌ No appointment provided');
    return;
  }
  
  console.log('Appointment analysis:');
  console.log('- ID:', appointment.id);
  console.log('- Patient ID:', appointment.patientId);
  console.log('- Patient Name:', appointment.patientName);
  console.log('- Patient Details:', appointment.patientDetails);
  console.log('- Full appointment object:', JSON.stringify(appointment, null, 2));
  
  if (appointment.patientId) {
    console.log('🧪 Running API test with real patient ID...');
    return testPatientInfoAPI(appointment.patientId);
  } else {
    console.log('❌ No patient ID found in appointment');
    return Promise.resolve({ success: false, error: 'No patient ID in appointment' });
  }
};

export const generateMockPatientData = () => {
  return {
    success: true,
    data: {
      _id: 'mock-patient-id',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      age: 30,
      gender: 'Male',
      dob: '1993-01-01',
      address: '123 Main Street, City',
      medicalHistory: 'No known allergies'
    }
  };
};

export default {
  testPatientInfoAPI,
  analyzePatientDataIssues,
  testWithRealAppointment,
  generateMockPatientData
};
