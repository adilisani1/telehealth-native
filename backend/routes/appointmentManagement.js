import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { bookAppointment, acceptAppointment, completeAppointment, cancelAppointment, getAvailableSlots, calendarIntegration, triggerMissedAppointments } from '../controllers/appointmentManagementController.js';
import { body } from 'express-validator';

const router = express.Router();

// Book appointment (patient)
router.post('/book',
  protect,
  authorizeRoles('patient'),
  [
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('slot').notEmpty().withMessage('Slot is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('ageGroup').notEmpty().withMessage('Age group is required'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('problem').notEmpty().withMessage('Problem description is required')
  ],
  bookAppointment
);

// Accept appointment (doctor)
router.put('/:id/accept', protect, authorizeRoles('doctor'), acceptAppointment);
// Complete appointment (doctor)
router.put('/:id/complete', protect, authorizeRoles('doctor'), completeAppointment);
// Cancel appointment (patient or doctor)
router.put('/:id/cancel', protect, cancelAppointment);
// Get available slots for a doctor on a date
router.get('/available-slots', protect, getAvailableSlots);
// Calendar integration placeholder
router.get('/calendar', protect, calendarIntegration);
// Trigger missed appointment check (admin only)
router.post('/trigger-missed', protect, authorizeRoles('admin'), triggerMissedAppointments);

export default router; 