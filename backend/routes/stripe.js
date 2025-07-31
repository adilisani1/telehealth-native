import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  handleStripeWebhook,
  refundPayment
} from '../controllers/stripeController.js';

const router = express.Router();

/**
 * @desc    Create payment intent for appointment booking
 * @route   POST /api/stripe/create-payment-intent
 * @access  Private (Patient only)
 */
router.post('/create-payment-intent',
  protect,
  authorizeRoles('patient'),
  [
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a valid number')
      .custom((value) => {
        if (value <= 0) {
          throw new Error('Amount must be greater than 0');
        }
        return true;
      }),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code'),
    body('doctorId')
      .notEmpty()
      .withMessage('Doctor ID is required')
      .isMongoId()
      .withMessage('Doctor ID must be a valid MongoDB ObjectId'),
    body('appointmentData')
      .isObject()
      .withMessage('Appointment data must be an object'),
    body('appointmentData.date')
      .notEmpty()
      .withMessage('Appointment date is required'),
    body('appointmentData.slot')
      .notEmpty()
      .withMessage('Appointment slot is required'),
    body('appointmentData.patientName')
      .notEmpty()
      .withMessage('Patient name is required'),
    body('appointmentData.ageGroup')
      .notEmpty()
      .withMessage('Age group is required'),
    body('appointmentData.gender')
      .notEmpty()
      .withMessage('Gender is required'),
    body('appointmentData.problem')
      .notEmpty()
      .withMessage('Problem description is required')
  ],
  createPaymentIntent
);

/**
 * @desc    Confirm payment and create appointment
 * @route   POST /api/stripe/confirm-payment
 * @access  Private (Patient only)
 */
router.post('/confirm-payment',
  protect,
  authorizeRoles('patient'),
  [
    body('paymentIntentId')
      .notEmpty()
      .withMessage('Payment intent ID is required'),
    body('appointmentData')
      .isObject()
      .withMessage('Appointment data must be an object'),
    body('appointmentData.date')
      .notEmpty()
      .withMessage('Appointment date is required'),
    body('appointmentData.slot')
      .notEmpty()
      .withMessage('Appointment slot is required'),
    body('appointmentData.patientName')
      .notEmpty()
      .withMessage('Patient name is required')
  ],
  confirmPayment
);

/**
 * @desc    Get payment history for patient
 * @route   GET /api/stripe/payment-history
 * @access  Private (Patient only)
 */
router.get('/payment-history',
  protect,
  authorizeRoles('patient'),
  getPaymentHistory
);

/**
 * @desc    Handle Stripe webhooks
 * @route   POST /api/stripe/webhook
 * @access  Public (Stripe webhook)
 * @note    This endpoint requires raw body middleware
 */
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

/**
 * @desc    Refund a payment
 * @route   POST /api/stripe/refund
 * @access  Private (Admin only)
 */
router.post('/refund',
  protect,
  authorizeRoles('admin'),
  [
    body('appointmentId')
      .notEmpty()
      .withMessage('Appointment ID is required')
      .isMongoId()
      .withMessage('Appointment ID must be a valid MongoDB ObjectId'),
    body('reason')
      .optional()
      .isString()
      .withMessage('Reason must be a string')
  ],
  refundPayment
);

export default router;
