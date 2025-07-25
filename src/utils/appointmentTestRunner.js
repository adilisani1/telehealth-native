/**
 * Test Script for Appointment Management System
 * 
 * How to test:
 * 1. Login as a doctor
 * 2. Go to My Appointments screen
 * 3. Long press on the small invisible area in the top-right corner to enable debug mode
 * 4. Use the debug buttons to test the system
 * 5. Click on appointment cards to open the modal
 * 6. Test accept/cancel/complete actions
 */

import { Alert } from 'react-native';

export const runAppointmentTests = async () => {
  console.log('🧪 Running Appointment Management Tests');
  console.log('=====================================');

  const tests = [
    {
      name: 'Token Verification',
      test: async () => {
        const { getToken } = require('../utils/tokenStorage');
        const token = await getToken();
        return !!token;
      }
    },
    {
      name: 'Service Import',
      test: async () => {
        try {
          const service = require('../services/appointmentManagementService');
          return !!(service.getPatientDetails && service.acceptAppointment);
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Modal Component',
      test: async () => {
        try {
          const AppointmentDetailsModal = require('../components/AppointmentDetailsModal');
          return !!AppointmentDetailsModal.default;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Debug Utility',
      test: async () => {
        try {
          const debug = require('../utils/appointmentManagementDebug');
          return !!(debug.debugAppointmentManagement && debug.getCurrentAppointmentStatus);
        } catch (error) {
          return false;
        }
      }
    }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.test();
      results.push({
        name: test.name,
        passed: result,
        error: null
      });
      console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      results.push({
        name: test.name,
        passed: false,
        error: error.message
      });
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
    }
  }

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The appointment management system is ready to use.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }

  return {
    passed: passedTests,
    total: totalTests,
    results
  };
};

export const showTestInstructions = () => {
  Alert.alert(
    'Appointment Management Testing',
    `Follow these steps to test the system:

1. 📱 Login as a doctor
2. 🏥 Navigate to "My Appointments"
3. 🔧 Long press top-right corner to enable debug mode
4. 🧪 Use debug buttons to test API calls
5. 👆 Tap appointment cards to open modal
6. ✅ Test accept/cancel/complete actions
7. 📊 Check console logs for detailed output

Debug Features:
• Full system diagnostic
• Appointment status summary  
• Patient details testing
• API endpoint validation

Note: Debug mode is hidden by default for production use.`,
    [{ text: 'Got it!', style: 'default' }]
  );
};

export default {
  runAppointmentTests,
  showTestInstructions
};
