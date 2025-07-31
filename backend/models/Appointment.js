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
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  // Payment information for Stripe integration
  paymentIntentId: { type: String, sparse: true, index: true },
  paymentMethod: { type: String, enum: ['stripe', 'cash', 'other'], default: 'stripe' },
  stripeChargeId: { type: String, sparse: true },
  paymentTimestamp: { type: Date },
  refundId: { type: String, sparse: true },
  refundTimestamp: { type: Date },
  refundReason: { type: String },
  // Patient details for the appointment
  patientName: { type: String, required: true },
  ageGroup: { type: String, required: true },
  gender: { type: String, required: true },
  problem: { type: String, required: true },
  // Fee information
  fee: { type: Number, default: 0 },
  currency: { type: String, default: 'PKR' },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment; 