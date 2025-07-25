/**
 * Appointment Management Debug Utility
 * Use this to test the appointment management functionality
 */

import { 
  getPatientDetails, 
  acceptAppointment, 
  cancelAppointment, 
  completeAppointment 
} from '../services/appointmentManagementService';
import { getDoctorUpcomingAppointments } from '../services/doctorService';
import { getToken } from '../utils/tokenStorage';

export const debugAppointmentManagement = async () => {
  console.log('🔍 Debugging Appointment Management System');
  console.log('==========================================');

  try {
    // 1. Get current token
    const token = await getToken();
    if (!token) {
      console.log('❌ No token found - user not logged in');
      return;
    }
    console.log('✅ Token found');

    // 2. Get upcoming appointments
    console.log('\n📅 Fetching upcoming appointments...');
    const appointmentsResponse = await getDoctorUpcomingAppointments(token);
    console.log('Appointments Response:', appointmentsResponse);

    if (appointmentsResponse?.data?.appointments?.length > 0) {
      const appointments = appointmentsResponse.data.appointments;
      console.log(`📋 Found ${appointments.length} upcoming appointments`);
      
      appointments.forEach((appointment, index) => {
        console.log(`\n${index + 1}. Appointment Details:`);
        console.log(`   ID: ${appointment._id}`);
        console.log(`   Patient: ${appointment.patient?.name || 'Unknown'}`);
        console.log(`   Patient ID: ${appointment.patient?._id || appointment.patient?.id}`);
        console.log(`   Status: ${appointment.status}`);
        console.log(`   Date: ${appointment.date}`);
        console.log(`   Type: ${appointment.type || 'N/A'}`);
        console.log(`   Fee: ${appointment.currency || 'PKR'} ${appointment.fee || 'N/A'}`);
      });

      // 3. Test patient details fetch for first appointment
      const firstAppointment = appointments[0];
      if (firstAppointment.patient?._id || firstAppointment.patient?.id) {
        console.log('\n👤 Testing patient details fetch...');
        try {
          const patientId = firstAppointment.patient._id || firstAppointment.patient.id;
          const patientDetails = await getPatientDetails(patientId);
          console.log('Patient Details:', {
            name: patientDetails.data?.name,
            email: patientDetails.data?.email,
            phone: patientDetails.data?.phone,
            age: patientDetails.data?.dob ? calculateAge(patientDetails.data.dob) : 'N/A',
            gender: patientDetails.data?.gender,
            hasHealthInfo: !!patientDetails.data?.healthInfo
          });
        } catch (error) {
          console.log('❌ Patient details fetch failed:', error.message);
        }
      }

      // 4. Show available actions based on appointment status
      console.log('\n⚡ Available Actions:');
      appointments.forEach((appointment, index) => {
        const actions = [];
        
        if (appointment.status === 'requested') {
          actions.push('Accept', 'Cancel');
        }
        
        if (appointment.status === 'accepted' && new Date(appointment.date) < new Date()) {
          actions.push('Complete');
        }
        
        console.log(`   ${index + 1}. ${appointment.patient?.name}: [${actions.join(', ') || 'No actions available'}]`);
      });

    } else {
      console.log('📋 No upcoming appointments found');
    }

    console.log('\n🎉 Debug completed successfully!');
    return {
      success: true,
      appointmentsCount: appointmentsResponse?.data?.appointments?.length || 0
    };

  } catch (error) {
    console.error('❌ Debug failed:', error);
    return {
      success: false,
      error: error.message || error
    };
  }
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

export const testAppointmentAction = async (appointmentId, action) => {
  console.log(`🔧 Testing ${action} action for appointment: ${appointmentId}`);
  
  try {
    let result;
    
    switch (action.toLowerCase()) {
      case 'accept':
        result = await acceptAppointment(appointmentId);
        break;
      case 'cancel':
        result = await cancelAppointment(appointmentId, 'Test cancellation');
        break;
      case 'complete':
        result = await completeAppointment(appointmentId);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    console.log(`✅ ${action} successful:`, result);
    return { success: true, result };
    
  } catch (error) {
    console.error(`❌ ${action} failed:`, error);
    return { success: false, error: error.message || error };
  }
};

export const getCurrentAppointmentStatus = async () => {
  try {
    const token = await getToken();
    if (!token) return null;

    const appointmentsResponse = await getDoctorUpcomingAppointments(token);
    const appointments = appointmentsResponse?.data?.appointments || [];
    
    const statusSummary = appointments.reduce((acc, appointment) => {
      const status = appointment.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: appointments.length,
      statusSummary,
      appointments: appointments.map(a => ({
        id: a._id,
        patient: a.patient?.name,
        status: a.status,
        date: a.date,
        canAccept: a.status === 'requested',
        canComplete: a.status === 'accepted' && new Date(a.date) < new Date()
      }))
    };
  } catch (error) {
    console.error('Failed to get appointment status:', error);
    return null;
  }
};

export default {
  debugAppointmentManagement,
  testAppointmentAction,
  getCurrentAppointmentStatus
};
