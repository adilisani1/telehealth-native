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
import Review from '../models/Review.js';
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
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Fixed: Don't filter by date for accepted appointments - they should remain in upcoming until completed
    const total = await Appointment.countDocuments({ 
      doctor: req.user._id, 
      status: { $in: ['requested', 'accepted'] }
    });
    
    console.log('🔍 BACKEND: Querying appointments with patient population...');
    const appointments = await Appointment.find({
      doctor: req.user._id,
      status: { $in: ['requested', 'accepted'] }
      // Removed date filter - accepted appointments should remain visible even after their time
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

    // Add rating information for each doctor
    const doctorsWithRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await Review.find({ doctor: doctor._id });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;

        return {
          ...doctor.toObject(),
          doctorProfile: {
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews
          }
        };
      })
    );

    res.json({ success: true, data: doctorsWithRatings, message: 'Available doctors fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorsRankedByRating = async (req, res) => {
  try {
    // Get all doctors who have at least one review
    const doctors = await User.find({ role: 'doctor' })
      .select('name email specialization avatar');

    // Calculate comprehensive score for each doctor
    const doctorsWithScores = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await Review.find({ doctor: doctor._id });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;

        // Get completed appointments count
        const completedCount = await Appointment.countDocuments({ 
          doctor: doctor._id, 
          status: 'completed' 
        });

        // Calculate comprehensive score
        let comprehensiveScore = 0;
        
        if (totalReviews > 0) {
          // Base score from average rating (0-5)
          const ratingScore = averageRating;
          
          // Review reliability factor (logarithmic scaling to prevent single review dominance)
          // This ensures doctors with more reviews get higher reliability scores
          const reviewReliabilityFactor = Math.log10(totalReviews + 1) / Math.log10(11); // Normalize to 0-1 range
          
          // Experience factor based on completed appointments (logarithmic scaling)
          const experienceFactor = Math.log10(completedCount + 1) / Math.log10(101); // Normalize to 0-1 range
          
          // Weighted comprehensive score
          // 60% rating, 25% review reliability, 15% experience
          comprehensiveScore = (ratingScore * 0.6) + 
                             (reviewReliabilityFactor * 5 * 0.25) + 
                             (experienceFactor * 5 * 0.15);
        }

        return {
          ...doctor.toObject(),
          completedAppointments: completedCount,
          doctorProfile: {
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews,
            comprehensiveScore: parseFloat(comprehensiveScore.toFixed(2))
          }
        };
      })
    );

    // Filter out doctors with no reviews and sort by comprehensive score (highest first)
    const rankedDoctors = doctorsWithScores
      .filter(doctor => doctor.doctorProfile.totalReviews > 0)
      .sort((a, b) => {
        // Primary sort: by comprehensive score (descending)
        if (b.doctorProfile.comprehensiveScore !== a.doctorProfile.comprehensiveScore) {
          return b.doctorProfile.comprehensiveScore - a.doctorProfile.comprehensiveScore;
        }
        // Secondary sort: by average rating (descending) if scores are equal
        if (b.doctorProfile.averageRating !== a.doctorProfile.averageRating) {
          return b.doctorProfile.averageRating - a.doctorProfile.averageRating;
        }
        // Tertiary sort: by number of reviews (descending) if ratings are equal
        return b.doctorProfile.totalReviews - a.doctorProfile.totalReviews;
      })
      .slice(0, 10); // Top 10 doctors

    res.json({ success: true, data: rankedDoctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};// 8. Public doctor profile and availability (for patients)
export const getPublicDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' })
      .select('name email specialization qualifications avatar timezone availability agreedFee currency earningNegotiationStatus');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Add rating information
    const reviews = await Review.find({ doctor: doctorId });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const doctorWithRating = {
      ...doctor.toObject(),
      doctorProfile: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews
      }
    };

    res.json({ success: true, data: doctorWithRating, message: 'Doctor public profile fetched successfully' });
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

    doctor.earningNegotiationHistory.push({ 
      sender: 'doctor', 
      message,
      proposedFee: typeof proposedFee !== 'undefined' ? Number(proposedFee) : undefined,
      currency: currency || doctor.currency
    });

    // Only change status to 'negotiating' if the proposed fee is different from agreed fee
    let statusChanged = false;
    if (typeof proposedFee !== 'undefined') {
      const newProposedFee = Number(proposedFee);
      doctor.proposedFee = newProposedFee;
      
      // Only change status if the new proposed fee is different from the current agreed fee
      if (doctor.earningNegotiationStatus === 'agreed' && doctor.agreedFee) {
        if (newProposedFee !== doctor.agreedFee) {
          doctor.earningNegotiationStatus = 'negotiating';
          statusChanged = true;
        }
        // If the proposed fee equals the agreed fee, keep status as 'agreed'
      } else {
        // If not previously agreed, set to negotiating
        doctor.earningNegotiationStatus = 'negotiating';
        statusChanged = true;
      }
    }
    
    if (currency && ['USD', 'PKR'].includes(currency)) doctor.currency = currency;

    await doctor.save();
    
    const responseMessage = statusChanged 
      ? 'Negotiation message sent to admin. Status updated to negotiating due to fee change.'
      : 'Message sent to admin. Status remains unchanged as proposed fee matches agreed fee.';
    
    res.json({ success: true, data: doctor, message: responseMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor's own reviews and rating statistics
export const getDoctorOwnReviews = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can access this endpoint' });
    }

    const doctorId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all reviews for this doctor with appointment and patient details
    const total = await Review.countDocuments({ doctor: doctorId });
    const reviews = await Review.find({ doctor: doctorId })
      .populate([
        { 
          path: 'patient', 
          select: 'name email avatar' 
        },
        { 
          path: 'appointment', 
          select: 'date status',
          populate: {
            path: 'patient',
            select: 'name'
          }
        }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate rating statistics
    const allReviews = await Review.find({ doctor: doctorId });
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Rating distribution
    const ratingDistribution = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length,
    };

    const ratingStats = {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
      ratingDistribution
    };

    res.json({ 
      success: true, 
      data: { 
        reviews, 
        ratingStats, 
        total, 
        page, 
        pages: Math.ceil(total / limit) 
      }, 
      message: 'Doctor reviews fetched successfully' 
    });
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