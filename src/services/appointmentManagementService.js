import axios from 'axios';
import { getToken } from '../utils/tokenStorage';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

const appointmentApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Get patient details by ID
export const getPatientDetails = async (patientId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log('🔍 Fetching patient details for ID:', patientId);
    
    // Try multiple API endpoints for patient details
    const endpoints = [
      `/api/doctor/patient/${patientId}`,
      `/api/patient/${patientId}`,
      `/api/users/${patientId}`,
      `/api/doctor/patients/${patientId}`,
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Trying endpoint: ${endpoint}`);
        const response = await appointmentApi.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log(`✅ Success with endpoint ${endpoint}:`, response.data);
        
        // Validate that we got meaningful patient data - handle nested structures
        if (response.data) {
          // Try different possible nested structures
          let data = null;
          
          if (response.data.success && response.data.data && response.data.data.patient) {
            data = response.data.data.patient;
            console.log('✅ Found patient data in response.data.data.patient');
          } else if (response.data.data && response.data.data.patient) {
            data = response.data.data.patient;
            console.log('✅ Found patient data in response.data.data.patient');
          } else if (response.data.patient) {
            data = response.data.patient;
            console.log('✅ Found patient data in response.data.patient');
          } else if (response.data.data) {
            data = response.data.data;
            console.log('✅ Found patient data in response.data.data');
          } else if (response.data.user) {
            data = response.data.user;
            console.log('✅ Found patient data in response.data.user');
          } else {
            data = response.data;
            console.log('✅ Using direct response.data');
          }
          
          console.log('🔍 Extracted patient data:', JSON.stringify(data, null, 2));
          
          if (data && (data.name || data.fullName || data.email)) {
            console.log('✅ Valid patient data confirmed:', data);
            // Return the original response structure to maintain compatibility
            return response.data;
          } else {
            console.log('⚠️ Endpoint returned data but no valid patient fields in extracted data');
          }
        }
        
      } catch (error) {
        console.log(`❌ Failed endpoint ${endpoint}:`, error.response?.status, error.message);
        lastError = error;
        continue;
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error('All patient detail endpoints failed');
    
  } catch (error) {
    console.error('❌ Patient details API error:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw error.response?.data || { message: error.message };
  }
};

// Get patient health records (accessible by doctors)
export const getPatientHealthRecords = async (patientId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log('🔍 Fetching health records for patient ID:', patientId);
    // Try doctor-accessible endpoint first
    const response = await appointmentApi.get(`/api/doctor/patient/${patientId}/health-records`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Health records API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Health records API error:', error);
    
    // If 403/404, try alternative approach - get from patient details
    if (error.response?.status === 403 || error.response?.status === 404) {
      console.log('⚠️ Doctor endpoint not available, health records may be in patient details');
      return { success: true, data: [] };
    }
    
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    
    // Return empty array instead of throwing error for missing health records
    return { success: true, data: [] };
  }
};

// Accept appointment
export const acceptAppointment = async (appointmentId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log('🔍 Accepting appointment ID:', appointmentId);
    const response = await appointmentApi.put(`/api/appointment-management/${appointmentId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Accept appointment API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Accept appointment API error:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw error.response?.data || { message: error.message };
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId, reason = '') => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log('🔍 Cancelling appointment ID:', appointmentId);
    const response = await appointmentApi.put(`/api/appointment-management/${appointmentId}/cancel`, 
    { reason }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Cancel appointment API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Cancel appointment API error:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw error.response?.data || { message: error.message };
  }
};

// Complete appointment
export const completeAppointment = async (appointmentId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log('🔍 Completing appointment ID:', appointmentId);
    const response = await appointmentApi.put(`/api/appointment-management/${appointmentId}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Complete appointment API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Complete appointment API error:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw error.response?.data || { message: error.message };
  }
};

export default {
  getPatientDetails,
  acceptAppointment,
  cancelAppointment,
  completeAppointment,
};
