import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['reminder', 'alert', 'admin', 'other'], default: 'other' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 