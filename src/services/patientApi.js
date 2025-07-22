import axios from 'axios';
import { getToken } from '../utils/tokenStorage';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Helper to get auth headers
const authHeaders = async () => {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
};

// Health Records
export const uploadHealthRecord = async (data) => {
  return api.post('/api/health-records', data, {
    headers: await authHeaders(),
  });
};

export const getHealthRecords = async () => {
  return api.get('/api/health-records', {
    headers: await authHeaders(),
  });
};

export const deleteHealthRecord = async (recordId) => {
  return api.delete(`/api/health-records/${recordId}`, {
    headers: await authHeaders(),
  });
};

// Appointments
export const getAppointmentHistory = async () => {
  return api.get('/api/appointments/history', {
    headers: await authHeaders(),
  });
};

export const getUpcomingAppointments = async () => {
  return api.get('/api/appointments/upcoming', {
    headers: await authHeaders(),
  });
};

// Prescriptions
export const getPrescriptions = async () => {
  return api.get('/api/prescriptions', {
    headers: await authHeaders(),
  });
};

export const downloadPdfPrescription = async (prescriptionId) => {
  return api.get(`/api/prescriptions/${prescriptionId}/pdf`, {
    headers: await authHeaders(),
    responseType: 'blob',
  });
};

// Notifications
export const getNotifications = async () => {
  return api.get('/api/notifications', {
    headers: await authHeaders(),
  });
};

export const markNotificationAsRead = async (notificationId) => {
  return api.put(`/api/notifications/${notificationId}/read`, {}, {
    headers: await authHeaders(),
  });
};

// Video Call
export const joinVideoCall = async (appointmentId) => {
  return api.get(`/api/appointments/${appointmentId}/join-video-call`, {
    headers: await authHeaders(),
  });
};

export default {
  uploadHealthRecord,
  getHealthRecords,
  deleteHealthRecord,
  getAppointmentHistory,
  getUpcomingAppointments,
  getPrescriptions,
  downloadPdfPrescription,
  getNotifications,
  markNotificationAsRead,
  joinVideoCall,
}; 