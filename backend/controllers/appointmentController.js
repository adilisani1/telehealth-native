import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getAppointmentHistory = async (req, res) => {
  try {
    console.log('🔍 getAppointmentHistory called for patient:', req.user._id);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Check what statuses are available for this patient
    const allStatuses = await Appointment.distinct('status', { patient: req.user._id });
    console.log('📊 All appointment statuses for patient:', allStatuses);
    
    const total = await Appointment.countDocuments({ patient: req.user._id, status: { $in: ['completed', 'cancelled', 'missed'] } });
    const history = await Appointment.find({ patient: req.user._id, status: { $in: ['completed', 'cancelled', 'missed'] } })
      .populate('doctor', 'name email specialization')
      .populate('patient', 'name email') // Populate patient info to get name
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
      
    console.log('✅ History appointments response:', { 
      total, 
      count: history.length, 
      statuses: history.map(apt => ({ 
        id: apt._id, 
        status: apt.status, 
        patientName: apt.patientName,
        populatedPatientName: apt.patient?.name,
        patient: apt.patient,
        doctor: apt.doctor?.name,
        date: apt.date,
        // Let's see all available fields
        allFields: Object.keys(apt.toObject()),
        appointmentObject: apt.toObject()
      }))
    });
    
    res.json({ success: true, data: { history, total, page, pages: Math.ceil(total / limit) }, message: 'Appointment history fetched successfully' });
  } catch (error) {
    console.error('❌ Error in getAppointmentHistory:', error);
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
      .populate('patient', 'name email') // Populate patient info to get name
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);
    res.json({ success: true, data: { upcoming, total, page, pages: Math.ceil(total / limit) }, message: 'Upcoming appointments fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMissedAppointments = async (req, res) => {
  try {
    console.log('🔍 getMissedAppointments called for patient:', req.user._id);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // First check if there are any missed appointments for this patient
    const allMissedCount = await Appointment.countDocuments({ patient: req.user._id, status: 'missed' });
    console.log('📊 Total missed appointments for patient:', allMissedCount);
    
    // Get all missed appointments without population first
    const rawMissed = await Appointment.find({ patient: req.user._id, status: 'missed' });
    console.log('📋 Raw missed appointments:', rawMissed.map(apt => ({ id: apt._id, status: apt.status, date: apt.date, patient: apt.patient })));
    
    const total = await Appointment.countDocuments({ patient: req.user._id, status: 'missed' });
    const missed = await Appointment.find({ patient: req.user._id, status: 'missed' })
      .populate('doctor', 'name email specialization')
      .populate('patient', 'name email') // Populate patient info to get name
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
      
    console.log('✅ Final missed appointments response:', { 
      total, 
      count: missed.length, 
      data: missed.map(apt => ({ 
        id: apt._id, 
        status: apt.status, 
        patientName: apt.patientName,
        populatedPatientName: apt.patient?.name,
        patient: apt.patient,
        doctor: apt.doctor?.name,
        date: apt.date,
        allFields: Object.keys(apt.toObject()),
        appointmentObject: apt.toObject()
      }))
    });
    
    res.json({ success: true, data: { missed, total, page, pages: Math.ceil(total / limit) }, message: 'Missed appointments fetched successfully' });
  } catch (error) {
    console.error('❌ Error in getMissedAppointments:', error);
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

// Test endpoint to create a missed appointment for testing
export const createTestMissedAppointment = async (req, res) => {
  try {
    // Find a doctor (first available)
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'No doctor found' });
    }

    // Create a test missed appointment
    const testAppointment = new Appointment({
      patient: req.user._id,
      doctor: doctor._id,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      timezone: 'UTC',
      status: 'missed',
      patientName: req.user.name || 'Test Patient',
      ageGroup: '25-30',
      gender: 'Male',
      problem: 'Test missed appointment'
    });

    await testAppointment.save();
    
    res.json({ 
      success: true, 
      data: testAppointment, 
      message: 'Test missed appointment created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test endpoint to convert existing appointments to missed status
export const convertToMissedAppointments = async (req, res) => {
  try {
    // Find some completed or cancelled appointments for this patient and convert to missed
    const result = await Appointment.updateMany(
      { 
        patient: req.user._id, 
        status: { $in: ['completed', 'cancelled'] },
        date: { $lt: new Date() } // Only past appointments
      },
      { $set: { status: 'missed' } },
      { limit: 2 } // Convert max 2 appointments
    );
    
    res.json({ 
      success: true, 
      data: result, 
      message: `Converted ${result.modifiedCount} appointments to missed status` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Debug endpoint to get ALL appointments for a patient
export const getAllAppointmentsDebug = async (req, res) => {
  try {
    console.log('🔍 getAllAppointmentsDebug called for patient:', req.user._id);
    
    const allAppointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 });
      
    const groupedByStatus = allAppointments.reduce((acc, apt) => {
      if (!acc[apt.status]) acc[apt.status] = [];
      acc[apt.status].push({
        id: apt._id,
        patientName: apt.patientName,
        date: apt.date,
        doctor: apt.doctor?.name || 'Unknown'
      });
      return acc;
    }, {});
    
    console.log('📊 All appointments grouped by status:', groupedByStatus);
    
    res.json({ 
      success: true, 
      data: { 
        total: allAppointments.length,
        appointments: allAppointments,
        groupedByStatus
      }, 
      message: 'All appointments fetched for debugging' 
    });
  } catch (error) {
    console.error('❌ Error in getAllAppointmentsDebug:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 