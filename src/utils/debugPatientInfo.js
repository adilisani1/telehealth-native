/**
 * Debug Script for Patient Information Issues
 * 
 * This script helps diagnose why patient information is not displaying
 */

export const debugPatientInformation = (appointment, patientDetails) => {
  console.log('🔍 DEBUGGING PATIENT INFORMATION');
  console.log('=================================');
  
  // Debug 1: Appointment structure
  console.log('📋 Appointment Object:');
  console.log('- ID:', appointment?.id);
  console.log('- Patient ID:', appointment?.patientId);
  console.log('- Patient Name:', appointment?.patientName);
  console.log('- Patient Details in Appointment:', appointment?.patientDetails);
  console.log('- Full Appointment:', JSON.stringify(appointment, null, 2));
  
  // Debug 2: Patient Details structure
  console.log('\n👤 Patient Details Object:');
  if (patientDetails) {
    console.log('- Name:', patientDetails.name);
    console.log('- Full Name:', patientDetails.fullName);
    console.log('- Email:', patientDetails.email);
    console.log('- Email Address:', patientDetails.emailAddress);
    console.log('- Phone:', patientDetails.phone);
    console.log('- Phone Number:', patientDetails.phoneNumber);
    console.log('- Mobile:', patientDetails.mobile);
    console.log('- DOB:', patientDetails.dob);
    console.log('- Date of Birth:', patientDetails.dateOfBirth);
    console.log('- Age:', patientDetails.age);
    console.log('- Gender:', patientDetails.gender);
    console.log('- Sex:', patientDetails.sex);
    console.log('- Full Patient Details:', JSON.stringify(patientDetails, null, 2));
  } else {
    console.log('❌ Patient Details is null/undefined');
  }
  
  // Debug 3: Check for common issues
  console.log('\n🚨 Common Issues Check:');
  console.log('- Patient ID exists:', !!appointment?.patientId);
  console.log('- Patient Details exists:', !!patientDetails);
  console.log('- Patient Name available:', !!(patientDetails?.name || patientDetails?.fullName || appointment?.patientName));
  console.log('- Patient Email available:', !!(patientDetails?.email || patientDetails?.emailAddress));
  console.log('- Patient Phone available:', !!(patientDetails?.phone || patientDetails?.phoneNumber || patientDetails?.mobile));
  
  // Debug 4: Suggest fixes
  console.log('\n💡 Suggested Fixes:');
  if (!appointment?.patientId) {
    console.log('- ❌ No patient ID found. Check appointment data structure.');
  }
  if (!patientDetails) {
    console.log('- ❌ No patient details found. Check API response and error handling.');
  }
  if (patientDetails && !patientDetails.name && !patientDetails.fullName) {
    console.log('- ⚠️ Patient name field might have different property name.');
  }
  
  return {
    hasPatientId: !!appointment?.patientId,
    hasPatientDetails: !!patientDetails,
    patientName: patientDetails?.name || patientDetails?.fullName || appointment?.patientName,
    patientEmail: patientDetails?.email || patientDetails?.emailAddress,
    patientPhone: patientDetails?.phone || patientDetails?.phoneNumber || patientDetails?.mobile,
  };
};

export const testPatientDetailsAPI = async (patientId) => {
  console.log('🧪 TESTING PATIENT DETAILS API');
  console.log('===============================');
  
  try {
    const { getPatientDetails } = require('../services/appointmentManagementService');
    const { getToken } = require('../utils/tokenStorage');
    
    console.log('1. Testing token availability...');
    const token = await getToken();
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found. User needs to login.');
      return;
    }
    
    console.log('2. Testing patient details API call...');
    const response = await getPatientDetails(patientId);
    console.log('API Response:', response);
    
    console.log('3. Analyzing response structure...');
    if (response) {
      console.log('Response type:', typeof response);
      console.log('Has success property:', 'success' in response);
      console.log('Has data property:', 'data' in response);
      console.log('Has user property:', 'user' in response);
      console.log('Has patient property:', 'patient' in response);
      console.log('Response keys:', Object.keys(response));
    }
    
    return response;
  } catch (error) {
    console.error('❌ API Test failed:', error);
    console.log('Error details:');
    console.log('- Message:', error.message);
    console.log('- Status:', error.response?.status);
    console.log('- Data:', error.response?.data);
    return null;
  }
};

export const mockPatientData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  age: 30,
  gender: 'Male',
  dob: '1993-01-01',
  address: '123 Main Street, City',
  healthInfo: 'No known allergies',
  allergies: 'None',
  currentMedications: 'Vitamin D'
};

export const runPatientInfoDebug = (appointment) => {
  console.log('🔄 Running complete patient info debug...');
  
  if (!appointment) {
    console.log('❌ No appointment provided for debugging');
    return;
  }
  
  const debugResult = debugPatientInformation(appointment, null);
  console.log('Debug result:', debugResult);
  
  if (appointment.patientId) {
    console.log('🧪 Testing API call...');
    testPatientDetailsAPI(appointment.patientId)
      .then(response => {
        console.log('✅ API test completed');
        if (response) {
          debugPatientInformation(appointment, response);
        }
      })
      .catch(error => {
        console.log('❌ API test failed:', error.message);
      });
  }
};

export default {
  debugPatientInformation,
  testPatientDetailsAPI,
  mockPatientData,
  runPatientInfoDebug
};
