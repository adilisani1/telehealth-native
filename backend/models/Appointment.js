import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timezone: { type: String, required: true },
  status: { type: String, enum: ['requested', 'accepted', 'completed', 'cancelled'], default: 'requested' },
  videoCallLink: { type: String },
  notes: { type: String },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment; 