export const resendOtp = async (data) => {
  return api.post('/api/auth/resend-otp', data);
};
import axios from 'axios';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const register = async (data) => {
  return api.post('/api/auth/register', data);
};

export const login = async (data) => {
  return api.post('/api/auth/login', data);
};

export const getProfile = async (token) => {
  return api.get('/api/user/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateProfile = async (data, token) => {
  return api.put('/api/user/profile', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const changePassword = async (data, token) => {
  return api.put('/api/user/change-password', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const verifyEmail = async (data) => {
  return api.post('/api/auth/verify-email', data);
};

export const requestPasswordReset = async (data) => {
  return api.post('/api/auth/request-password-reset', data);
};

export const resetPassword = async (data) => {
  return api.post('/api/auth/reset-password', data);
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendOtp,
};
