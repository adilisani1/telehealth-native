/**
 * Backend API Test Script
 * Run this in your browser console or as a Node.js script to test the endpoints
 */

const testPatientEndpoint = async (patientId, token) => {
  const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';
  
  try {
    console.log('🧪 Testing patient endpoint...');
    console.log('Patient ID:', patientId);
    
    const response = await fetch(`${BASE_URL}/api/doctor/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Response:', JSON.stringify(data, null, 2));
      
      // Check if patient data includes phone
      const patient = data.data?.patient;
      if (patient) {
        console.log('📱 Patient Phone:', patient.phone);
        console.log('⚧️ Patient Gender:', patient.gender);
        console.log('📧 Patient Email:', patient.email);
        console.log('🏷️ Patient Name:', patient.name);
      }
    } else {
      console.log('❌ FAILED - Status:', response.status);
      const errorData = await response.text();
      console.log('Error:', errorData);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
};

const testAppointmentsEndpoint = async (token) => {
  const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';
  
  try {
    console.log('🧪 Testing appointments endpoint...');
    
    const response = await fetch(`${BASE_URL}/api/doctor/appointments/upcoming`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Response:', JSON.stringify(data, null, 2));
      
      // Check first appointment's patient data
      const appointments = data.data?.appointments;
      if (appointments && appointments.length > 0) {
        const firstAppt = appointments[0];
        console.log('📋 First Appointment Patient Data:');
        console.log('- Patient Object:', firstAppt.patient);
        console.log('- Phone:', firstAppt.patient?.phone);
        console.log('- Gender:', firstAppt.patient?.gender);
        console.log('- Email:', firstAppt.patient?.email);
        console.log('- Name:', firstAppt.patient?.name);
      }
    } else {
      console.log('❌ FAILED - Status:', response.status);
      const errorData = await response.text();
      console.log('Error:', errorData);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
};

// Usage:
// testPatientEndpoint('687be961f217ba41a28a3278', 'your-jwt-token-here');
// testAppointmentsEndpoint('your-jwt-token-here');

console.log('📚 Backend API Test Functions Ready');
console.log('Run: testPatientEndpoint("687be961f217ba41a28a3278", "your-token")');
console.log('Run: testAppointmentsEndpoint("your-token")');

export { testPatientEndpoint, testAppointmentsEndpoint };
