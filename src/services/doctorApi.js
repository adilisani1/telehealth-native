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

// Dashboard
export const getDoctorDashboard = async () => {
  return api.get('/api/doctor/dashboard', {
    headers: await authHeaders(),
  });
};

// Appointments
export const getDoctorUpcomingAppointments = async () => {
  return api.get('/api/doctor/appointments/upcoming', {
    headers: await authHeaders(),
  });
};

export const getConsultationHistory = async () => {
  return api.get('/api/doctor/appointments/history', {
    headers: await authHeaders(),
  });
};

// Patient Profile & Consultation
export const getPatientProfileAndConsultation = async (patientId) => {
  return api.get(`/api/doctor/patient/${patientId}/profile-consultation`, {
    headers: await authHeaders(),
  });
};

// Availability
export const setOrUpdateAvailability = async (data) => {
  return api.put('/api/doctor/availability', data, {
    headers: await authHeaders(),
  });
};

// Video Call
export const joinDoctorVideoCall = async (appointmentId) => {
  return api.get(`/api/doctor/appointments/${appointmentId}/join-video-call`, {
    headers: await authHeaders(),
  });
};

// Record Notes, Diagnosis, Prescription
export const recordConsultationNotes = async (data) => {
  return api.post('/api/doctor/consultations/notes', data, {
    headers: await authHeaders(),
  });
};

// Notifications
export const getDoctorNotifications = async () => {
  return api.get('/api/doctor/notifications', {
    headers: await authHeaders(),
  });
};

export const markNotificationAsRead = async (notificationId) => {
  return api.put(`/api/doctor/notifications/${notificationId}/read`, {}, {
    headers: await authHeaders(),
  });
};

// Earning Negotiation
export const getEarningNegotiation = async () => {
  return api.get('/api/doctor/earning-negotiation', {
    headers: await authHeaders(),
  });
};

export const postNegotiationMessage = async (data) => {
  return api.post('/api/doctor/negotiation-message', data, {
    headers: await authHeaders(),
  });
};

// Available Doctors
export const getAvailableDoctors = async () => {
  return api.get('/api/doctor/available', {
    headers: await authHeaders(),
  });
};

// Fetch doctor-admin chat (negotiation) history
export const getDoctorAdminChat = async () => {
  return api.get('/api/doctor/earning-negotiation', {
    headers: await authHeaders(),
  });
};

// Post a new message to admin (doctor side)
export const postDoctorAdminMessage = async (message) => {
  return api.post('/api/doctor/earning-negotiation/message', { message }, {
    headers: await authHeaders(),
  });
};

// Get top-ranked doctors by completed appointments
export const getTopRankedDoctors = async () => {
  return api.get('/api/doctor/top-ranked');
};

export default {
  getDoctorDashboard,
  getDoctorUpcomingAppointments,
  getConsultationHistory,
  getPatientProfileAndConsultation,
  setOrUpdateAvailability,
  joinDoctorVideoCall,
  recordConsultationNotes,
  getDoctorNotifications,
  markNotificationAsRead,
  getEarningNegotiation,
  postNegotiationMessage,
  getAvailableDoctors,
  getDoctorAdminChat,
  postDoctorAdminMessage,
  getTopRankedDoctors,
};