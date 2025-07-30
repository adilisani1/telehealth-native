import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAppointmentHistory, getUpcomingAppointments, getMissedAppointments, joinVideoCall, getPrescriptionsForPatient, createTestMissedAppointment, convertToMissedAppointments, getAllAppointmentsDebug } from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/history', protect, authorizeRoles('patient'), getAppointmentHistory);
router.get('/upcoming', protect, authorizeRoles('patient'), getUpcomingAppointments);
router.get('/missed', protect, authorizeRoles('patient'), getMissedAppointments);
router.get('/debug-all', protect, authorizeRoles('patient'), getAllAppointmentsDebug);
router.get('/:id/join-video', protect, authorizeRoles('patient'), joinVideoCall);
router.get('/prescriptions', protect, authorizeRoles('patient'), getPrescriptionsForPatient);
router.post('/test-missed', protect, authorizeRoles('patient'), createTestMissedAppointment);
router.post('/convert-to-missed', protect, authorizeRoles('patient'), convertToMissedAppointments);

export default router; 