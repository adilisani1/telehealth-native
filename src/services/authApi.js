import axios from 'axios';
import { getToken } from '../utils/tokenStorage';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add request interceptor to handle dynamic token
api.interceptors.request.use(
  async (config) => {
    // For requests that need authentication, add token dynamically
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

// Add response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear local storage
      try {
        const { forceAuthReset } = await import('../utils/authUtils');
        await forceAuthReset();
        
        // Dispatch logout to Redux
        const { Store } = await import('../redux/Store/Store');
        const { logoutUser } = await import('../redux/Slices/authSlice');
        Store.dispatch(logoutUser());
      } catch (e) {
        console.log('Auth reset on 401 failed:', e);
      }
    }
    return Promise.reject(error);
  }
);

export const register = async (data) => {
  return api.post('/api/auth/register', data);
};

export const login = async (data) => {
  return api.post('/api/auth/login', data);
};

export const getProfile = async (token = null) => {
  return api.get('/api/user/profile', {
    headers: { 
      Authorization: token ? `Bearer ${token}` : 'Bearer TOKEN_PLACEHOLDER' 
    },
  });
};

export const updateProfile = async (data, token = null) => {
  return api.put('/api/user/profile', data, {
    headers: { 
      Authorization: token ? `Bearer ${token}` : 'Bearer TOKEN_PLACEHOLDER' 
    },
  });
};

export const changePassword = async (data, token = null) => {
  return api.put('/api/user/change-password', data, {
    headers: { 
      Authorization: token ? `Bearer ${token}` : 'Bearer TOKEN_PLACEHOLDER' 
    },
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

export const logout = async (token = null) => {
  return api.post('/api/user/logout', {}, {
    headers: { 
      Authorization: token ? `Bearer ${token}` : 'Bearer TOKEN_PLACEHOLDER' 
    },
  });
};

export const refreshToken = async (refreshTokenValue) => {
  return api.post('/api/auth/refresh-token', {
    refreshToken: refreshTokenValue
  });
};

export const resendOtp = async (data) => {
  return api.post('/api/auth/resend-otp', data);
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
  logout,
  refreshToken,
};
