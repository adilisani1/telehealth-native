import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import AuditLog from '../models/AuditLog.js';
import mongoose from 'mongoose';

// 1. List all users (with filtering, pagination, search)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, data: { users, total, page: parseInt(page), pages: Math.ceil(total / limit) }, message: 'Users fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Ban/suspend/activate a user
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(id, { status }, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. List all appointments (with filtering, pagination)
export const getAllAppointments = async (req, res) => {
  try {
    const { doctor, patient, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (doctor && mongoose.Types.ObjectId.isValid(doctor)) query.doctor = doctor;
    if (patient && mongoose.Types.ObjectId.isValid(patient)) query.patient = patient;
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email specialization')
      .populate('patient', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, data: { appointments, total, page: parseInt(page), pages: Math.ceil(total / limit) }, message: 'Appointments fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get usage stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const upcomingAppointments = await Appointment.countDocuments({ status: { $in: ['requested', 'accepted'] } });
    const missedAppointments = await Appointment.countDocuments({ status: 'missed' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        completedAppointments,
        upcomingAppointments,
        missedAppointments,
        suspendedUsers
      },
      message: 'Stats fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }
    const appt = await Appointment.findById(id)
      .populate('doctor', 'name email specialization')
      .populate('patient', 'name email')
      .lean();
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit logs (admin only)
export const getAuditLogs = async (req, res) => {
  try {
    const { user, action, target, page = 1, limit = 20 } = req.query;
    const query = {};
    if (user && mongoose.Types.ObjectId.isValid(user)) query.user = user;
    if (action) query.action = action;
    if (target) query.target = target;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, data: { logs, total, page: parseInt(page), pages: Math.ceil(total / limit) }, message: 'Audit logs fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. List doctors with earning negotiation status (admin)
export const getDoctorsWithEarningNegotiation = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { role: 'doctor' };
    if (status) query.earningNegotiationStatus = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const doctors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, data: { doctors, total, page: parseInt(page), pages: Math.ceil(total / limit) }, message: 'Doctors with earning negotiation fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Get earning negotiation details for a doctor
export const getDoctorEarningNegotiation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    const doctor = await User.findOne({ _id: id, role: 'doctor' }).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Post negotiation message and update negotiation fields (admin)
export const postDoctorEarningNegotiation = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, proposedFee, currency, commission, status } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    const doctor = await User.findOne({ _id: id, role: 'doctor' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    // Add negotiation message
    if (message) {
      doctor.earningNegotiationHistory.push({ 
        sender: 'admin', 
        message,
        proposedFee: typeof proposedFee !== 'undefined' ? Number(proposedFee) : undefined,
        currency: currency || doctor.currency
      });
    }
    
    // Update negotiation fields if provided
    if (typeof proposedFee !== 'undefined') {
      doctor.proposedFee = Number(proposedFee);
      // If we're updating an agreed negotiation, update the agreedFee as well
      if (doctor.earningNegotiationStatus === 'agreed') {
        doctor.agreedFee = Number(proposedFee);
      }
    }
    if (currency && ['USD', 'PKR'].includes(currency)) doctor.currency = currency;
    if (typeof commission !== 'undefined') doctor.commission = Number(commission);
    
    // Only update status if explicitly provided and not already agreed
    if (status && ['pending', 'negotiating', 'agreed'].includes(status)) {
      doctor.earningNegotiationStatus = status;
    }
    
    await doctor.save();
    res.json({ success: true, data: doctor, message: 'Negotiation updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Agree to negotiation (admin)
export const agreeDoctorEarningNegotiation = async (req, res) => {
  try {
    const { id } = req.params;
    const { agreedFee, commission } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    if (typeof agreedFee === 'undefined' || isNaN(Number(agreedFee))) {
      return res.status(400).json({ success: false, message: 'Agreed fee is required' });
    }
    const doctor = await User.findOne({ _id: id, role: 'doctor' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    doctor.agreedFee = Number(agreedFee);
    doctor.commission = typeof commission !== 'undefined' ? Number(commission) : doctor.commission;
    doctor.earningNegotiationStatus = 'agreed';
    doctor.earningNegotiationHistory.push({ sender: 'admin', message: `Agreement reached. Agreed fee: ${agreedFee} ${doctor.currency}, Commission: ${doctor.commission}%` });
    await doctor.save();
    res.json({ success: true, data: doctor, message: 'Earning negotiation agreed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 