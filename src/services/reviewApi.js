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

// Add request interceptor to handle dynamic token
api.interceptors.request.use(
  async (config) => {
    if (config.headers && config.headers.Authorization === 'Bearer TOKEN_PLACEHOLDER') {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Review API endpoints

// Create a new review
export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/api/reviews', reviewData, {
      headers: { Authorization: 'Bearer TOKEN_PLACEHOLDER' }
    });
    
    return response;
  } catch (error) {
    console.error('Review API error:', error);
    throw error;
  }
};

// Get reviews for a specific doctor (public)
export const getDoctorReviews = async (doctorId, options = {}) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  return api.get(`/api/reviews/doctor/${doctorId}`, {
    params: { page, limit, sort }
  });
};

// Get patient's own reviews
export const getPatientReviews = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  return api.get('/api/reviews/patient', {
    params: { page, limit },
    headers: { Authorization: 'Bearer TOKEN_PLACEHOLDER' }
  });
};

// Get eligible appointments for review
export const getEligibleAppointmentsForReview = async (doctorId) => {
  return api.get(`/api/reviews/eligible-appointments/${doctorId}`, {
    headers: { Authorization: 'Bearer TOKEN_PLACEHOLDER' }
  });
};

// Update a review
export const updateReview = async (reviewId, updateData) => {
  return api.put(`/api/reviews/${reviewId}`, updateData, {
    headers: { Authorization: 'Bearer TOKEN_PLACEHOLDER' }
  });
};

// Delete a review
export const deleteReview = async (reviewId) => {
  return api.delete(`/api/reviews/${reviewId}`, {
    headers: { Authorization: 'Bearer TOKEN_PLACEHOLDER' }
  });
};

// Get doctor's own reviews (for doctor dashboard)
export const getDoctorOwnReviews = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  return api.get('/api/reviews/doctor/my-reviews', {
    params: { page, limit },
    headers: { Authorization: 'Bearer TOKEN_PLACEHOLDER' }
  });
};

// Admin endpoints
export const getAllReviews = async (options = {}) => {
  const { 
    page = 1, 
    limit = 20, 
    sort = '-createdAt',
    isApproved,
    doctorId,
    rating 
  } = options;
  
  const params = { page, limit, sort };
  if (isApproved !== undefined) params.isApproved = isApproved;
  if (doctorId) params.doctorId = doctorId;
  if (rating) params.rating = rating;

  return api.get('/api/reviews/admin/all', {
    params,
    headers: { Authorization: 'Bearer TOKEN_PLACEHOLDER' }
  });
};

// Moderate review (admin only)
export const moderateReview = async (reviewId, moderationData) => {
  return api.patch(`/api/reviews/${reviewId}/approve`, moderationData, {
    headers: { Authorization: 'Bearer TOKEN_PLACEHOLDER' }
  });
};

export default {
  createReview,
  getDoctorReviews,
  getPatientReviews,
  getEligibleAppointmentsForReview,
  updateReview,
  deleteReview,
  getDoctorOwnReviews,
  getAllReviews,
  moderateReview
};
