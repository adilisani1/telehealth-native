import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAppointmentHistory, getUpcomingAppointments, joinVideoCall, getPrescriptionsForPatient } from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/history', protect, authorizeRoles('patient'), getAppointmentHistory);
router.get('/upcoming', protect, authorizeRoles('patient'), getUpcomingAppointments);
router.get('/:id/join-video', protect, authorizeRoles('patient'), joinVideoCall);
router.get('/prescriptions', protect, authorizeRoles('patient'), getPrescriptionsForPatient);

export default router; 