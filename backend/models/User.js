import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['doctor', 'patient', 'admin'], required: true },
  avatar: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dob: { type: Date },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  // Doctor-specific fields
  specialization: { type: String },
  qualifications: { type: String },
  availability: [{
    day: String,
    slots: [String], // e.g., ['09:00-10:00', '14:00-15:00']
  }],
  earnings: { type: Number, default: 0 },
  timezone: { type: String }, // Doctor's timezone (e.g., 'Asia/Karachi')
  // Earning module fields (doctor only)
  proposedFee: { type: Number, default: 0 }, // Doctor's proposed consultation fee
  agreedFee: { type: Number, default: 0 }, // Final agreed fee after negotiation
  currency: { type: String, enum: ['USD', 'PKR'], default: 'PKR' },
  commission: { type: Number, default: 0 }, // Platform commission percentage
  earningNegotiationStatus: { type: String, enum: ['pending', 'negotiating', 'agreed'], default: 'pending' },
  earningNegotiationHistory: [{
    sender: { type: String, enum: ['doctor', 'admin'] },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  // Patient-specific fields
  emergencyContact: { type: String },
  healthInfo: { type: String },
  // General fields
  otp: { type: String },
  otpExpiry: { type: Date },
  passwordResetOtp: { type: String },
  passwordResetOtpExpiry: { type: Date },
  deviceTokens: [{ type: String }], // For push notifications
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User; 