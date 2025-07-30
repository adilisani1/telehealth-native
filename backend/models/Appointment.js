import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timezone: { type: String, required: true },
  status: { type: String, enum: ['requested', 'accepted', 'completed', 'cancelled', 'missed'], default: 'requested' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: { type: String },
  videoCallLink: { type: String },
  notes: { type: String },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  // Patient details for the appointment
  patientName: { type: String, required: true },
  ageGroup: { type: String, required: true },
  gender: { type: String, required: true },
  problem: { type: String, required: true },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment; 