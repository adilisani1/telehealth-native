import axios from 'axios';
import { getToken } from '../utils/tokenStorage';

const BASE_URL = 'https://c6zfxs18-5000.inc1.devtunnels.ms';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Helper to get auth headers
const authHeaders = async () => {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
};

// Book Appointment (Patient)
export const bookAppointment = async (data) => {
  return api.post('/api/appointment-management/book', data, {
    headers: await authHeaders(),
  });
};

// Accept Appointment (Doctor)
export const acceptAppointment = async (appointmentId) => {
  return api.put(`/api/appointment-management/${appointmentId}/accept`, {}, {
    headers: await authHeaders(),
  });
};

// Complete Appointment (Doctor)
export const completeAppointment = async (appointmentId, data) => {
  return api.put(`/api/appointment-management/${appointmentId}/complete`, data, {
    headers: await authHeaders(),
  });
};

// Cancel Appointment (Patient or Doctor)
export const cancelAppointment = async (appointmentId, data) => {
  return api.put(`/api/appointment-management/${appointmentId}/cancel`, data, {
    headers: await authHeaders(),
  });
};

// Get Available Slots for a Doctor
export const getAvailableSlots = async (doctorId, date) => {
  return api.get('/api/appointment-management/available-slots', {
    params: { doctorId, date },
    headers: await authHeaders(),
  });
};

// Calendar Integration (Placeholder)
export const getCalendarIntegration = async () => {
  return api.get('/api/appointment-management/calendar', {
    headers: await authHeaders(),
  });
};

// Trigger Missed Appointments (Admin)
export const triggerMissedAppointments = async (data) => {
  return api.post('/api/appointment-management/trigger-missed', data, {
    headers: await authHeaders(),
  });
};

// Doctor's public profile/Availability
export const getDoctorPublicProfile = async (doctorId) => {
  return api.get(`/api/doctor/public/${doctorId}`);
};

// Admin audit log
export const getAdminAuditLog = async () => {
  return api.get('/api/admin/audit-log', {
    headers: await authHeaders(),
  });
};

export default {
  bookAppointment,
  acceptAppointment,
  completeAppointment,
  cancelAppointment,
  getAvailableSlots,
  getCalendarIntegration,
  triggerMissedAppointments,
  getDoctorPublicProfile,
  getAdminAuditLog,
};