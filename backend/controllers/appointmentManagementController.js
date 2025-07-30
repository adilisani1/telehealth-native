import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import moment from 'moment-timezone';
import Notification from '../models/Notification.js';
import { sendNotificationEmail } from '../utils/mail.js';
import { APPOINTMENT_CONFIRMATION_EMAIL_SUBJECT, APPOINTMENT_REMINDER_EMAIL_SUBJECT, MISSED_APPOINTMENT_EMAIL_SUBJECT, APPOINTMENT_REMINDER_MINUTES_BEFORE } from '../constants.js';

// Utility: Mark past appointments as missed
export const markMissedAppointments = async () => {
  const now = new Date();
  const missed = await Appointment.updateMany(
    {
      status: { $in: ['requested', 'accepted'] },
      date: { $lt: now }
    },
    { $set: { status: 'missed' } }
  );
  // For each missed appointment, send missed alert to patient and doctor
  // (This is a placeholder, in production use a job/cron to process missed appointments)
  return missed;
};

// Utility: Send appointment confirmation email
async function sendAppointmentConfirmation(user, appointment, doctor, patient) {
  if (!user.email) return;
  let message;
  if (user.role === 'doctor') {
    message = `A new appointment has been booked by patient ${patient.name} for ${appointment.date.toLocaleString()}.`;
  } else if (user.role === 'patient') {
    message = `Your appointment is confirmed for ${appointment.date.toLocaleString()} with Dr. ${doctor.name}.`;
  } else {
    message = `Appointment confirmed for ${appointment.date.toLocaleString()}.`;
  }
  await sendNotificationEmail({ to: user.email, subject: APPOINTMENT_CONFIRMATION_EMAIL_SUBJECT, message });
}
// Utility: Send appointment reminder email
async function sendAppointmentReminder(user, appointment, doctor, patient) {
  if (user.email) {
    const message = `Reminder: You have an appointment on ${appointment.date.toLocaleString()} with Dr. ${doctor.name}.`;
    await sendNotificationEmail({ to: user.email, subject: APPOINTMENT_REMINDER_EMAIL_SUBJECT, message });
  }
}
// Utility: Send missed appointment alert
async function sendMissedAppointmentAlert(user, appointment, doctor, patient) {
  if (user.email) {
    const message = `You missed your appointment on ${appointment.date.toLocaleString()} with Dr. ${doctor.name}.`;
    await sendNotificationEmail({ to: user.email, subject: MISSED_APPOINTMENT_EMAIL_SUBJECT, message });
  }
}
// Utility: Schedule reminders (placeholder for cron/queue integration)
async function scheduleAppointmentReminder(appointment) {
  // In production, use a job queue or cron to send reminders APPOINTMENT_REMINDER_MINUTES_BEFORE
  // This is a placeholder for future integration
}

// NOTE: All slot and appointment calculations below are strictly in the doctor's timezone.
// Any patient-provided timezone is ignored. All dates/times are interpreted as per the doctor's timezone.

// 1. Book appointment (patient)
// Validate appointment before payment (without booking)
export const validateAppointmentSlot = async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;
    
    if (!doctorId || !date || !slot) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required: doctorId, date, slot' 
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    if (!doctor.timezone) {
      return res.status(400).json({ success: false, message: 'Doctor timezone is not set' });
    }
    
    // Validate slot in doctor's timezone
    const dayOfWeek = moment.tz(date, doctor.timezone).format('dddd');
    const availableDay = doctor.availability.find(a => a.day === dayOfWeek);
    if (!availableDay || !availableDay.slots.includes(slot)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Selected slot is not available for this doctor' 
      });
    }
    
    // Calculate slot start and end in doctor's timezone
    const slotStart = moment.tz(date + ' ' + slot.split('-')[0], doctor.timezone);
    const slotEnd = moment.tz(date + ' ' + slot.split('-')[1], doctor.timezone);
    
    // Prevent booking for past slots (in doctor's timezone)
    if (slotStart.isBefore(moment.tz(doctor.timezone))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot book an appointment for a past date/time slot' 
      });
    }
    
    // Check for double booking
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: slotStart.toDate(), $lt: slotEnd.toDate() },
      status: { $in: ['requested', 'accepted'] }
    });
    
    if (conflict) {
      return res.status(409).json({ 
        success: false, 
        message: 'This slot is already booked. Please select another time.' 
      });
    }
    
    // If we reach here, the slot is valid and available
    res.json({ 
      success: true, 
      message: 'Slot is available for booking',
      data: {
        doctorId,
        date,
        slot,
        slotStartTime: slotStart.toISOString(),
        slotEndTime: slotEnd.toISOString(),
        timezone: doctor.timezone
      }
    });
    
  } catch (error) {
    console.error('Error validating appointment slot:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, slot, patientName, ageGroup, gender, problem } = req.body;
    if (!doctorId || !date || !slot || !patientName || !ageGroup || !gender || !problem) {
      return res.status(400).json({ success: false, message: 'All fields are required: doctorId, date, slot, patientName, ageGroup, gender, problem' });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (!doctor.timezone) return res.status(400).json({ success: false, message: 'Doctor timezone is not set' });
    // Validate slot in doctor's timezone
    const dayOfWeek = moment.tz(date, doctor.timezone).format('dddd');
    const availableDay = doctor.availability.find(a => a.day === dayOfWeek);
    if (!availableDay || !availableDay.slots.includes(slot)) {
      return res.status(400).json({ success: false, message: 'Selected slot is not available for this doctor' });
    }
    // Calculate slot start and end in doctor's timezone
    const slotStart = moment.tz(date + ' ' + slot.split('-')[0], doctor.timezone);
    const slotEnd = moment.tz(date + ' ' + slot.split('-')[1], doctor.timezone);
    // Prevent booking for past slots (in doctor's timezone)
    if (slotStart.isBefore(moment.tz(doctor.timezone))) {
      return res.status(400).json({ success: false, message: 'Cannot book an appointment for a past date/time slot' });
    }
    // Check for double booking
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: slotStart.toDate(), $lt: slotEnd.toDate() },
      status: { $in: ['requested', 'accepted'] }
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This slot is already booked' });
    }
    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: slotStart.toDate(),
      timezone: doctor.timezone,
      status: 'requested',
      patientName,
      ageGroup,
      gender,
      problem,
      fee: doctor.agreedFee || 0, // Include doctor's agreed fee
      currency: doctor.currency || 'PKR' // Include doctor's currency
    });
    await AuditLog.create({ user: req.user._id, action: 'book_appointment', target: 'Appointment', targetId: appointment._id, details: JSON.stringify({ doctorId, date, slot, timezone: doctor.timezone, patientName, ageGroup, gender, problem }) });
    // Send notification to doctor
    await Notification.create({
      user: doctorId,
      type: 'alert',
      message: `New appointment booked by patient for ${date} at ${slot}`,
      appointment: appointment._id
    });
    // Send email confirmation to patient and doctor
    await sendAppointmentConfirmation(doctor, appointment, doctor, req.user);
    await sendAppointmentConfirmation(req.user, appointment, doctor, req.user);
    // Schedule reminder (placeholder)
    await scheduleAppointmentReminder(appointment);

    const populatedAppointment = await Appointment.findById(appointment._id).populate('doctor');

    res.status(201).json({ success: true, data: populatedAppointment, message: 'Appointment booked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Doctor accepts appointment
export const acceptAppointment = async (req, res) => {
  try {
    console.log('🔍 Accept appointment request:', {
      params: req.params,
      body: req.body,
      user: req.user._id,
      userRole: req.user.role
    });

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.user._id, status: 'requested' });
    if (!appointment) {
      console.log('❌ Appointment not found or not in requested state:', {
        appointmentId: req.params.id,
        doctorId: req.user._id,
        foundAppointment: await Appointment.findOne({ _id: req.params.id })
      });
      return res.status(404).json({ success: false, message: 'Appointment not found or not in requested state' });
    }
    appointment.status = 'accepted';
    await appointment.save({ validateBeforeSave: false });
    await AuditLog.create({ user: req.user._id, action: 'accept_appointment', target: 'Appointment', targetId: appointment._id });
    // Send notification to patient
    await Notification.create({
      user: appointment.patient,
      type: 'alert',
      message: `Your appointment on ${moment(appointment.date).format('YYYY-MM-DD')} at ${moment(appointment.date).format('HH:mm')} has been accepted by the doctor.`,
      appointment: appointment._id
    });
    // Send email confirmation to patient
    const patient = await User.findById(appointment.patient);
    const doctor = await User.findById(appointment.doctor);
    await sendAppointmentConfirmation(patient, appointment, doctor, patient);
    await scheduleAppointmentReminder(appointment);
    console.log('✅ Appointment accepted successfully:', appointment._id);
    res.json({ success: true, data: appointment, message: 'Appointment accepted' });
  } catch (error) {
    console.error('❌ Accept appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Complete appointment (doctor)
export const completeAppointment = async (req, res) => {
  try {
    console.log('🔍 Complete appointment request:', {
      params: req.params,
      body: req.body,
      user: req.user._id,
      userRole: req.user.role
    });

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.user._id, status: 'accepted' });
    if (!appointment) {
      console.log('❌ Appointment not found or not in accepted state:', {
        appointmentId: req.params.id,
        doctorId: req.user._id,
        foundAppointment: await Appointment.findOne({ _id: req.params.id })
      });
      return res.status(404).json({ success: false, message: 'Appointment not found or not in accepted state' });
    }
    appointment.status = 'completed';
    await appointment.save({ validateBeforeSave: false });
    await AuditLog.create({ user: req.user._id, action: 'complete_appointment', target: 'Appointment', targetId: appointment._id });
    // Send notification to patient and doctor
    await Notification.create({
      user: appointment.patient,
      type: 'alert',
      message: `Your appointment on ${moment(appointment.date).format('YYYY-MM-DD')} at ${moment(appointment.date).format('HH:mm')} has been marked as completed.`
    });
    await Notification.create({
      user: appointment.doctor,
      type: 'alert',
      message: `Appointment with patient has been marked as completed.`
    });
    console.log('✅ Appointment completed successfully:', appointment._id);
    res.json({ success: true, data: appointment, message: 'Appointment marked as completed' });
  } catch (error) {
    console.error('❌ Complete appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Cancel appointment (patient or doctor)
export const cancelAppointment = async (req, res) => {
  try {
    console.log('🔍 Cancel appointment request:', {
      params: req.params,
      body: req.body,
      user: req.user._id,
      userRole: req.user.role
    });

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }
    const appointment = await Appointment.findOne({ _id: req.params.id });
    if (!appointment) {
      console.log('❌ Appointment not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (
      (req.user.role === 'patient' && String(appointment.patient) !== String(req.user._id)) &&
      (req.user.role === 'doctor' && String(appointment.doctor) !== String(req.user._id))
    ) {
      console.log('❌ Not authorized to cancel appointment:', {
        userRole: req.user.role,
        userId: req.user._id,
        appointmentPatient: appointment.patient,
        appointmentDoctor: appointment.doctor
      });
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }
    if (['completed', 'cancelled', 'missed'].includes(appointment.status)) {
      console.log('❌ Cannot cancel appointment with status:', appointment.status);
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed, missed, or already cancelled appointment' });
    }
    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.reason || 'No reason provided';
    await appointment.save({ validateBeforeSave: false });
    await AuditLog.create({ user: req.user._id, action: 'cancel_appointment', target: 'Appointment', targetId: appointment._id });
    console.log('✅ Appointment cancelled successfully:', appointment._id);
    res.json({ success: true, data: appointment, message: 'Appointment cancelled' });
  } catch (error) {
    console.error('❌ Cancel appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get available slots for a doctor on a date
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId and date are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (!doctor.timezone) return res.status(400).json({ success: false, message: 'Doctor timezone is not set' });
    // Always use doctor's timezone for all calculations
    const dayOfWeek = moment.tz(date, doctor.timezone).format('dddd');
    const availableDay = doctor.availability.find(a => a.day === dayOfWeek);
    if (!availableDay) return res.json({ success: true, data: [], message: 'No slots available for this day' });
    // Remove already booked slots
    const slots = [...availableDay.slots];
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: moment.tz(date, doctor.timezone).startOf('day').toDate(), $lt: moment.tz(date, doctor.timezone).endOf('day').toDate() },
      status: { $in: ['requested', 'accepted'] }
    });
    for (const appt of appointments) {
      // Find the slot string for this appointment in doctor's timezone
      const apptStart = moment.tz(appt.date, doctor.timezone);
      const apptEnd = apptStart.clone().add(1, 'hour');
      const apptSlot = apptStart.format('HH:mm') + '-' + apptEnd.format('HH:mm');
      const idx = slots.indexOf(apptSlot);
      if (idx !== -1) slots.splice(idx, 1);
    }
    res.json({ success: true, data: slots, message: 'Available slots fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Calendar integration placeholder
export const calendarIntegration = async (req, res) => {
  // Placeholder for future Google Calendar/Outlook integration
  res.json({ success: true, message: 'Calendar integration coming soon.' });
};

// 7. Expose endpoint to trigger missed appointment check (for admin/cron)
export const triggerMissedAppointments = async (req, res) => {
  try {
    const result = await markMissedAppointments();
    res.json({ success: true, data: result, message: 'Missed appointments updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 