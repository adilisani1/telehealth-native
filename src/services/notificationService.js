import axios from 'axios';
import { getToken } from '../utils/tokenStorage';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

const notificationApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Get doctor notifications
export const getDoctorNotifications = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await notificationApi.get('/api/doctor/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error.response?.data || { message: error.message };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await notificationApi.put(`/api/notification/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error.response?.data || { message: error.message };
  }
};

// Local notification for appointment completion readiness
export const showAppointmentCompletionNotification = (appointment) => {
  // This could be enhanced with push notifications or in-app notification system
  console.log(`🔔 Notification: Appointment with ${appointment.patientName} is ready to be completed!`);
  
  // For now, we'll just log it. In a real app, you would:
  // 1. Show a push notification
  // 2. Add to a notification badge
  // 3. Show an in-app notification banner
  
  return {
    id: Date.now(),
    title: 'Appointment Ready',
    message: `Appointment with ${appointment.patientName} is ready to be completed`,
    timestamp: new Date(),
    appointmentId: appointment.id,
    type: 'appointment_completion'
  };
};

export default {
  getDoctorNotifications,
  markNotificationAsRead,
  showAppointmentCompletionNotification,
};
