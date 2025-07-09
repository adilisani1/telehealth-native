import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAllUsers, updateUserStatus, getAllAppointments, getStats, getUserById, getAppointmentById, getAuditLogs, getDoctorsWithEarningNegotiation, getDoctorEarningNegotiation, postDoctorEarningNegotiation, agreeDoctorEarningNegotiation } from '../controllers/adminController.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// List users
router.get('/users',
  protect,
  authorizeRoles('admin'),
  [
    query('role').optional().isIn(['doctor', 'patient', 'admin']).withMessage('Invalid role'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('search').optional().isString()
  ],
  getAllUsers
);

// Update user status
router.patch('/users/:id/status',
  protect,
  authorizeRoles('admin'),
  [
    param('id').notEmpty().withMessage('User ID is required'),
    body('status').isIn(['active', 'suspended']).withMessage('Status must be active or suspended')
  ],
  updateUserStatus
);

// List appointments
router.get('/appointments',
  protect,
  authorizeRoles('admin'),
  [
    query('doctor').optional().isString(),
    query('patient').optional().isString(),
    query('status').optional().isString(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
  ],
  getAllAppointments
);

// Get stats
router.get('/stats', protect, authorizeRoles('admin'), getStats);

// Get single user by ID
router.get('/users/:id', protect, authorizeRoles('admin'), getUserById);

// Get single appointment by ID
router.get('/appointments/:id', protect, authorizeRoles('admin'), getAppointmentById);

// Get audit logs
router.get('/audit-log', protect, authorizeRoles('admin'), getAuditLogs);

// Earning negotiation endpoints
router.get('/doctors/earning-negotiation', protect, authorizeRoles('admin'), getDoctorsWithEarningNegotiation);
router.get('/doctors/:id/earning-negotiation', protect, authorizeRoles('admin'), getDoctorEarningNegotiation);
router.post('/doctors/:id/earning-negotiation', protect, authorizeRoles('admin'), postDoctorEarningNegotiation);
router.post('/doctors/:id/earning-negotiation/agree', protect, authorizeRoles('admin'), agreeDoctorEarningNegotiation);

export default router; 