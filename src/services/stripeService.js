import axios from 'axios';
import { getToken } from '../utils/tokenStorage';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

// Create axios instance for Stripe API calls
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout for payment operations
});

// Helper to get auth headers
const authHeaders = async () => {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
};

/**
 * Create a payment intent for appointment booking
 * @param {object} paymentData - Payment data object containing amount, currency, doctorId, and appointmentData
 * @param {number} paymentData.amount - Amount in base currency unit (e.g., dollars, not cents)
 * @param {string} paymentData.currency - Currency code (e.g., 'USD', 'PKR')
 * @param {string} paymentData.doctorId - Doctor's MongoDB ObjectId
 * @param {object} paymentData.appointmentData - Appointment details
 * @returns {Promise} Payment intent response
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const { amount, currency, doctorId, appointmentData } = paymentData;
    
    const response = await api.post('/api/stripe/create-payment-intent', {
      amount,
      currency,
      doctorId,
      appointmentData
    }, {
      headers: await authHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('Create payment intent error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create payment intent',
      details: error.response?.data || error.message
    };
  }
};

/**
 * Confirm payment and create appointment
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {object} appointmentData - Appointment details
 * @returns {Promise} Appointment creation response
 */
export const confirmPayment = async (paymentIntentId, appointmentData) => {
  try {
    const response = await api.post('/api/stripe/confirm-payment', {
      paymentIntentId,
      appointmentData
    }, {
      headers: await authHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('Confirm payment error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to confirm payment',
      details: error.response?.data || error.message
    };
  }
};

/**
 * Get payment history for the current patient
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise} Payment history response
 */
export const getPaymentHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/api/stripe/payment-history', {
      params: { page, limit },
      headers: await authHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('Get payment history error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to get payment history',
      details: error.response?.data || error.message
    };
  }
};

/**
 * Request a refund for an appointment
 * @param {string} appointmentId - Appointment ID
 * @param {string} reason - Reason for refund
 * @returns {Promise} Refund response
 */
export const requestRefund = async (appointmentId, reason) => {
  try {
    const response = await api.post('/api/stripe/refund', {
      appointmentId,
      reason
    }, {
      headers: await authHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('Request refund error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to process refund',
      details: error.response?.data || error.message
    };
  }
};

// Export all functions as default object
const stripeService = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  requestRefund
};

export default stripeService;
