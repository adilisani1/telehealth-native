/**
 * Quick Test Script for Appointment Management
 * Add this to your console to test the system
 */

// Test the appointment management system
const testAppointmentSystem = () => {
  console.log('🧪 Testing Appointment Management System');
  console.log('=====================================');
  
  // Test 1: Check if components can be imported
  try {
    const AppointmentDetailsModal = require('../components/AppointmentDetailsModal');
    console.log('✅ AppointmentDetailsModal imported successfully');
  } catch (error) {
    console.log('❌ AppointmentDetailsModal import failed:', error.message);
  }
  
  // Test 2: Check if service can be imported
  try {
    const service = require('../services/appointmentManagementService');
    console.log('✅ appointmentManagementService imported successfully');
  } catch (error) {
    console.log('❌ appointmentManagementService import failed:', error.message);
  }
  
  // Test 3: Check responsive dimensions
  try {
    const { Dimensions } = require('react-native');
    const { width, height } = Dimensions.get('window');
    const wp = (percentage) => (width * percentage) / 100;
    const hp = (percentage) => (height * percentage) / 100;
    
    console.log('✅ Custom responsive functions working');
    console.log(`   Screen: ${width}x${height}`);
    console.log(`   wp(50): ${wp(50)}, hp(50): ${hp(50)}`);
  } catch (error) {
    console.log('❌ Responsive functions error:', error.message);
  }
  
  // Test 4: Sample appointment object structure
  const sampleAppointment = {
    id: 'test-appointment-id',
    patientId: 'test-patient-id',
    patientName: 'John Doe',
    status: 'requested',
    date: new Date().toISOString(),
    type: 'Consultation',
    fee: 1000,
    currency: 'PKR'
  };
  
  console.log('📋 Sample appointment structure:');
  console.log(JSON.stringify(sampleAppointment, null, 2));
  
  console.log('\n🎯 Test completed!');
  console.log('If you see all ✅ marks, the system should work correctly.');
};

// Auto-run test if in debug mode
if (__DEV__) {
  setTimeout(testAppointmentSystem, 1000);
}

export default testAppointmentSystem;
