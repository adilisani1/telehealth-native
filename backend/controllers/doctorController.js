// 3b. View consultation history for doctor (completed appointments)
export const getDoctorConsultationHistory = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Appointment.countDocuments({ doctor: doctorId, status: 'completed' });
    const history = await Appointment.find({ doctor: doctorId, status: 'completed' })
      .populate([
        { path: 'patient', select: 'name email phone gender dob healthInfo address' },
        { path: 'prescription', select: 'notes diagnosis medicines date pdfUrl' }
      ])
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      success: true,
      data: {
        history,
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      message: 'Doctor consultation history fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 9. View all cancelled appointments for the doctor
export const getCancelledAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Appointment.countDocuments({ doctor: req.user._id, status: 'cancelled' });
    const appointments = await Appointment.find({
      doctor: req.user._id,
      status: 'cancelled'
    })
      .populate('patient', 'name email phone gender dob healthInfo address')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ success: true, data: { appointments, total, page, pages: Math.ceil(total / limit) }, message: 'Cancelled appointments fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import { generatePrescriptionPDF } from '../utils/pdf.js';
import path from 'path';

// 1. View own dashboard (appointments, earnings)
export const getDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const totalAppointments = await Appointment.countDocuments({ doctor: doctorId });
    const completedAppointments = await Appointment.countDocuments({ doctor: doctorId, status: 'completed' });
    const earnings = (await User.findById(doctorId)).earnings || 0;
    res.json({ success: true, data: { totalAppointments, completedAppointments, earnings }, message: 'Dashboard fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. View all upcoming appointments
export const getUpcomingAppointments = async (req, res) => {
  try {
    console.log('🔍 BACKEND: getUpcomingAppointments called by doctor:', req.user._id);
    
    const now = new Date();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Appointment.countDocuments({ doctor: req.user._id, status: { $in: ['requested', 'accepted'] }, date: { $gte: now } });
    
    console.log('🔍 BACKEND: Querying appointments with patient population...');
    const appointments = await Appointment.find({
      doctor: req.user._id,
      status: { $in: ['requested', 'accepted'] },
      date: { $gte: now }
    })
      .populate('patient', 'name email phone gender dob healthInfo address')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    console.log('✅ BACKEND: Found', appointments.length, 'upcoming appointments');
    
    // Debug each appointment's patient data
    appointments.forEach((appointment, index) => {
      console.log(`\n📋 BACKEND APPOINTMENT ${index + 1}:`);
      console.log('   - Appointment ID:', appointment._id);
      console.log('   - Patient populated:', !!appointment.patient);
      
      if (appointment.patient) {
        // Check if patient has gender data
        if (!appointment.patient.gender) {
          console.log('⚠️  WARNING: Patient has no gender data in database for appointment', appointment._id);
        }
        
        console.log('   - Patient ID:', appointment.patient._id);
        console.log('   - Patient Name:', appointment.patient.name);
        console.log('   - Patient Email:', appointment.patient.email);
        console.log('   - Patient Phone:', appointment.patient.phone);
        console.log('   - Patient Gender (CRITICAL):', appointment.patient.gender);
        console.log('   - Patient DOB:', appointment.patient.dob);
        console.log('   - Patient Type:', typeof appointment.patient.gender);
        console.log('   - Patient Object Keys:', Object.keys(appointment.patient.toObject ? appointment.patient.toObject() : appointment.patient));
      } else {
        console.log('   - ❌ NO PATIENT DATA POPULATED');
      }
    });

    console.log('📤 BACKEND: Sending response to frontend');
    res.json({ success: true, data: { appointments, total, page, pages: Math.ceil(total / limit) }, message: 'Upcoming appointments fetched successfully' });
  } catch (error) {
    console.error('❌ BACKEND ERROR in getUpcomingAppointments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. View consultation history (for patient, with diagnosis in prescription)
export const getAppointmentHistory = async (req, res) => {
  try {
    const patientId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Appointment.countDocuments({ patient: patientId, status: 'completed' });
    const history = await Appointment.find({ patient: patientId, status: 'completed' })
      .populate([
        { path: 'doctor', select: 'name email specialization' },
        { path: 'prescription', select: 'notes diagnosis medicines date pdfUrl' }
      ])
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      success: true,
      data: {
        history,
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      message: 'Appointment history fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. View a specific patient profile and their consultation history with this doctor
export const getPatientProfileAndHistory = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'Invalid patient ID' });
    }
    
    console.log('🔍 STEP 2: Querying database for patient...');
    const patient = await User.findOne({ _id: patientId, role: 'patient' }).select('-password');
    
    // Check if any patients have gender data
    const samplePatients = await User.find({ role: 'patient' }, 'name gender dob').limit(5);
    console.log('📊 SAMPLE PATIENTS IN DATABASE:');
    samplePatients.forEach((p, index) => {
      console.log(`   Patient ${index + 1}: ${p.name} - Gender: ${p.gender} - DOB: ${p.dob}`);
    });
    
    const patientsWithGender = await User.countDocuments({ role: 'patient', gender: { $exists: true, $ne: null } });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    console.log(`📊 GENDER DATA STATS: ${patientsWithGender}/${totalPatients} patients have gender data`);
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const history = await Appointment.find({
      doctor: req.user._id,
      patient: patientId
    })
      .populate([
        { path: 'prescription', select: 'notes diagnosis medicines date pdfUrl' }
      ])
      .sort({ date: -1 });


    const responseData = { patient, history };
    res.json({ success: true, data: responseData, message: 'Patient profile and history fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Set or update availability
export const setAvailability = async (req, res) => {
  try {
    const { availability, timezone } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: 'Availability must be an array' });
    }
    if (!timezone || typeof timezone !== 'string') {
      return res.status(400).json({ success: false, message: 'Doctor timezone is required and must be a string' });
    }
    // Validate each slot
    for (const slot of availability) {
      if (!slot.day || !Array.isArray(slot.slots)) {
        return res.status(400).json({ success: false, message: 'Each availability entry must have a day and slots array' });
      }
    }
    const doctor = await User.findByIdAndUpdate(
      req.user._id,
      { availability, timezone },
      { new: true, select: '-password' }
    );
    // Audit log
    await AuditLog.create({ user: req.user._id, action: 'update_availability', target: 'User', targetId: req.user._id, details: JSON.stringify({ availability, timezone }) });
    res.json({ success: true, data: { availability: doctor.availability, timezone: doctor.timezone }, message: 'Availability and timezone updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Join video call for an appointment (Have to Work on this)
export const joinVideoCall = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (!['accepted', 'requested'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot join video call for this appointment' });
    }
    if (!appointment.videoCallLink) {
      return res.status(400).json({ success: false, message: 'No video call link available' });
    }
    res.json({ success: true, data: { videoCallLink: appointment.videoCallLink }, message: 'Video call link fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Record notes, diagnosis, and prescriptions post-consultation
export const addConsultationNotes = async (req, res) => {
  try {
    const { notes, diagnosis, medicines } = req.body;
    if (!notes && !diagnosis && !medicines) {
      return res.status(400).json({ success: false, message: 'At least one of notes, diagnosis, or medicines is required' });
    }
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id,
      status: 'completed'
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Completed appointment not found' });

    // Create prescription if medicines are provided
    let prescription = null;
    if (Array.isArray(medicines) && medicines.length > 0) {
      prescription = await Prescription.create({
        appointment: appointment._id,
        doctor: req.user._id,
        patient: appointment.patient,
        medicines,
        notes,
        diagnosis, // Save diagnosis in prescription
        date: new Date()
      });
      // Generate PDF for prescription
      const patient = await User.findById(appointment.patient);
      const doctor = await User.findById(req.user._id);
      const pdfFileName = `prescription-${prescription._id}.pdf`;
      const pdfPath = path.join(process.cwd(), 'uploads', pdfFileName);
      await generatePrescriptionPDF(prescription, doctor, patient, pdfPath);
      prescription.pdfUrl = `/uploads/${pdfFileName}`;
      await prescription.save();
      appointment.prescription = prescription._id;
      // Send notification to patient
      await Notification.create({
        user: appointment.patient,
        type: 'alert',
        message: 'A new prescription has been added for your appointment.'
      });
    }

    appointment.notes = notes || appointment.notes;
    appointment.diagnosis = diagnosis || appointment.diagnosis;
    await appointment.save();

    // Audit log
    await AuditLog.create({ user: req.user._id, action: 'add_consultation_notes', target: 'Appointment', targetId: appointment._id, details: JSON.stringify({ notes, diagnosis, medicines }) });

    res.json({ success: true, data: { appointment, prescription }, message: 'Consultation notes updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Get all available doctors (for patients)
export const getAvailableDoctors = async (req, res) => {
  try {
    // Only return doctors with availability set and at least one slot
    const doctors = await User.find({
      role: 'doctor',
      availability: { $exists: true, $not: { $size: 0 } }
    }).select('name email specialization qualifications avatar timezone availability');
    res.json({ success: true, data: doctors, message: 'Available doctors fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorsRankedByCompletedAppointments = async (req, res) => {
  try {
    // Aggregate completed appointments per doctor
    const results = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$doctor', completedCount: { $sum: 1 } } },
      { $sort: { completedCount: -1 } },
      { $limit: 10 }, // Top 10 doctors
    ]);
    // Get doctor details for each
    const doctorIds = results.map(r => r._id);
    const doctors = await User.find({ _id: { $in: doctorIds } })
      .select('name email specialization avatar');
    // Merge counts with doctor info
    const rankedDoctors = results.map(r => {
      const doc = doctors.find(d => d._id.equals(r._id));
      return {
        ...doc.toObject(),
        completedAppointments: r.completedCount
      };
    });
    res.json({ success: true, data: rankedDoctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Public doctor profile and availability (for patients)
export const getPublicDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' })
      .select('name email specialization qualifications avatar timezone availability');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor, message: 'Doctor public profile fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Get earning negotiation history and status for the logged-in doctor
export const getMyEarningNegotiation = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can access this endpoint' });
    }
    const doctor = await User.findById(req.user._id).select('proposedFee agreedFee currency commission earningNegotiationStatus earningNegotiationHistory');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Doctor sends negotiation message to admin
export const postMyEarningNegotiationMessage = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can access this endpoint' });
    }
    const { message, proposedFee, currency } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const doctor = await User.findById(req.user._id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    doctor.earningNegotiationHistory.push({ sender: 'doctor', message });

    if (typeof proposedFee !== 'undefined') doctor.proposedFee = Number(proposedFee);
    if (currency && ['USD', 'PKR'].includes(currency)) doctor.currency = currency;
    doctor.earningNegotiationStatus = 'negotiating';

    await doctor.save();
    res.json({ success: true, data: doctor, message: 'Negotiation message sent to admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient health records for doctor
export const getPatientHealthRecords = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'Invalid patient ID' });
    }

    // Check if patient exists
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Get patient's appointment history with this doctor to verify access
    const appointmentExists = await Appointment.findOne({
      doctor: req.user._id,
      patient: patientId
    });

    if (!appointmentExists) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. No appointment history found with this patient.' 
      });
    }

    // For now, return basic health information from patient profile
    // In future, this can be expanded to include detailed health records
    const healthRecords = [
      {
        id: 1,
        date: patient.createdAt,
        type: 'Profile Information',
        description: patient.healthInfo || 'No health information provided',
        notes: `Patient registered on ${patient.createdAt.toDateString()}`,
      }
    ];

    // Add any additional health info from appointments
    const appointments = await Appointment.find({
      doctor: req.user._id,
      patient: patientId,
      status: 'completed'
    }).populate('prescription');

    appointments.forEach((appointment, index) => {
      if (appointment.prescription) {
        healthRecords.push({
          id: healthRecords.length + 1,
          date: appointment.date,
          type: 'Consultation Record',
          description: appointment.prescription.diagnosis || 'Consultation completed',
          notes: appointment.prescription.notes || '',
          medicines: appointment.prescription.medicines || []
        });
      }
    });

    res.json({ 
      success: true, 
      data: healthRecords, 
      message: 'Patient health records fetched successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};