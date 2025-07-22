
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getDashboard,
  getUpcomingAppointments,
  getAppointmentHistory,
  getDoctorConsultationHistory,
  getPatientProfileAndHistory,
  setAvailability,
  joinVideoCall,
  addConsultationNotes,
  getPublicDoctorProfile,
  getMyEarningNegotiation,
  postMyEarningNegotiationMessage,
  getCancelledAppointments,
  getAvailableDoctors,
  getDoctorsRankedByCompletedAppointments
} from '../controllers/doctorController.js';
import { body } from 'express-validator';

const router = express.Router();
router.get('/appointments/cancelled', protect, authorizeRoles('doctor'), getCancelledAppointments);

router.get('/dashboard', protect, authorizeRoles('doctor'), getDashboard);
router.get('/appointments/upcoming', protect, authorizeRoles('doctor'), getUpcomingAppointments);
router.get('/appointments/history', protect, authorizeRoles('doctor'), getDoctorConsultationHistory);
router.get('/patient/:patientId', protect, authorizeRoles('doctor'), getPatientProfileAndHistory);
router.put('/availability',
  protect,
  authorizeRoles('doctor'),
  [
    body('availability').isArray({ min: 1 }).withMessage('Availability must be a non-empty array'),
    body('timezone').isString().notEmpty().withMessage('Timezone is required').custom((value) => {
      // Validate IANA timezone
      if (!Intl?.DateTimeFormat().resolvedOptions().timeZone || !Intl.supportedValuesOf('timeZone').includes(value)) {
        throw new Error('Invalid timezone');
      }
      return true;
    })
  ],
  setAvailability
);
router.get('/appointments/:id/join-video', protect, authorizeRoles('doctor'), joinVideoCall);
router.post('/appointments/:id/notes',
  protect,
  authorizeRoles('doctor'),
  [
    body().custom(body => {
      if (!body.notes && !body.diagnosis && (!Array.isArray(body.medicines) || body.medicines.length === 0)) {
        throw new Error('At least one of notes, diagnosis, or medicines is required');
      }
      return true;
    })
  ],
  addConsultationNotes
);
router.get('/public/:doctorId', getPublicDoctorProfile);
router.get('/earning-negotiation', protect, authorizeRoles('doctor'), getMyEarningNegotiation);
router.post('/earning-negotiation/message',
  protect,
  authorizeRoles('doctor'),
  [
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('proposedFee').optional().isNumeric().withMessage('Proposed fee must be a number'),
    body('currency').optional().isIn(['USD', 'PKR']).withMessage('Currency must be USD or PKR')
  ],
  postMyEarningNegotiationMessage
);

// Get all available doctors (for patients)
router.get('/available', getAvailableDoctors);
// Get top-ranked doctors based on completed appointments
router.get('/top-ranked', getDoctorsRankedByCompletedAppointments);

export default router;