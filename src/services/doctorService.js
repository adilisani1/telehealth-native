export const getDoctorCancelledAppointments = async (token) => {
  try {
    const response = await doctorApi.get('/api/doctor/appointments/cancelled', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
import axios from 'axios';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

const doctorApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Optionally, add interceptors for auth, logging, etc.
// doctorApi.interceptors.request.use(config => { ... });

export const getDoctorUpcomingAppointments = async (token) => {
  try {
    const response = await doctorApi.get('/api/doctor/appointments/upcoming', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getDoctorCompletedAppointments = async (token) => {
  try {
    const response = await doctorApi.get('/api/doctor/dashboard', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data.completedAppointments || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getDoctorAppointmentHistory = async (token) => {
  try {
    const response = await doctorApi.get('/api/doctor/appointments/history', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
