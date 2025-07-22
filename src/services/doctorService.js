import axios from 'axios';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

const doctorApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const getDoctorAvailability = async (token) => {
  try {
    const response = await doctorApi.get('/api/doctor/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const updateDoctorAvailability = async (token, availability, timezone) => {
  try {
    const response = await doctorApi.put(
      '/api/doctor/availability',
      { availability, timezone },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
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
