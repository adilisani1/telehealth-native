
import express from 'express';
import { register, login, verifyEmail, requestPasswordReset, resetPassword, resendOtp } from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';

const router = express.Router();

// Place this after router is initialized
router.post('/resend-otp', resendOtp);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});

router.post('/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['doctor', 'patient', 'admin']).withMessage('Role must be doctor, patient, or admin')
  ],
  register
);

router.post('/login',
  authLimiter,
  [
    body('emailOrPhone').trim().notEmpty().withMessage('Email or phone is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

router.post('/verify-email', verifyEmail);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router; 