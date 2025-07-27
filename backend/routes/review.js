import express from 'express';
import {
  createReview,
  getDoctorReviews,
  getPatientReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  moderateReview,
  getDoctorOwnReviews,
  getEligibleAppointmentsForReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation middleware - relaxed for debugging
const validateCreateReview = [
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
  body('appointmentId').optional(),
  body('isAnonymous').optional()
];

const validateUpdateReview = [
  param('reviewId').isMongoId().withMessage('Valid review ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ min: 10, max: 500 }).withMessage('Review must be between 10 and 500 characters'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean')
];

const validateDoctorId = [
  param('doctorId').isMongoId().withMessage('Valid doctor ID is required')
];

const validateReviewId = [
  param('reviewId').isMongoId().withMessage('Valid review ID is required')
];

const validateModerateReview = [
  param('reviewId').isMongoId().withMessage('Valid review ID is required'),
  body('isApproved').isBoolean().withMessage('isApproved must be a boolean'),
  body('adminNotes').optional().isString().withMessage('Admin notes must be a string')
];

// Public routes
router.get('/doctor/:doctorId', validateDoctorId, getDoctorReviews);

// Protected routes - Patient
router.post('/', protect, validateCreateReview, handleValidationErrors, createReview);
router.get('/patient', protect, getPatientReviews);
router.get('/eligible-appointments/:doctorId', protect, validateDoctorId, getEligibleAppointmentsForReview);
router.put('/:reviewId', protect, validateUpdateReview, updateReview);
router.delete('/:reviewId', protect, validateReviewId, deleteReview);

// Protected routes - Doctor
router.get('/doctor/my-reviews', protect, getDoctorOwnReviews);

// Protected routes - Admin
router.get('/admin/all', protect, getAllReviews);
router.patch('/:reviewId/approve', protect, validateModerateReview, moderateReview);

export default router;
