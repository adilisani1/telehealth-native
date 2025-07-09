import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  target: { type: String }, // e.g., appointment, user, etc.
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog; 