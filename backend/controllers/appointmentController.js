import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getAppointmentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Appointment.countDocuments({ patient: req.user._id, status: { $in: ['completed', 'cancelled'] } });
    const history = await Appointment.find({ patient: req.user._id, status: { $in: ['completed', 'cancelled'] } })
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ success: true, data: { history, total, page, pages: Math.ceil(total / limit) }, message: 'Appointment history fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUpcomingAppointments = async (req, res) => {
  try {
    const now = new Date();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Appointment.countDocuments({ patient: req.user._id, status: { $in: ['requested', 'accepted'] }, date: { $gte: now } });
    const upcoming = await Appointment.find({ patient: req.user._id, status: { $in: ['requested', 'accepted'] }, date: { $gte: now } })
      .populate('doctor', 'name email specialization')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);
    res.json({ success: true, data: { upcoming, total, page, pages: Math.ceil(total / limit) }, message: 'Upcoming appointments fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// In progress --> Have to work on this.
export const joinVideoCall = async (req, res) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (!['accepted', 'requested'].includes(appointment.status)) return res.status(400).json({ success: false, message: 'Cannot join video call for this appointment' });
    if (!appointment.videoCallLink) return res.status(400).json({ success: false, message: 'No video call link available' });
    res.json({ success: true, data: { videoCallLink: appointment.videoCallLink }, message: 'Video call link fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPrescriptionsForPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name email specialization')
      .populate('appointment', 'date');
    res.json({ success: true, data: prescriptions, message: 'Prescriptions fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 