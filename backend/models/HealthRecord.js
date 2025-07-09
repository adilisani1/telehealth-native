import mongoose from 'mongoose';
import fieldEncryption from 'mongoose-field-encryption';

const healthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['image', 'pdf', 'note'], required: true },
  fileUrl: { type: String },
  description: { type: String },
  dateUploaded: { type: Date, default: Date.now },
  data: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true });

healthRecordSchema.plugin(fieldEncryption.fieldEncryption, {
  fields: ['data', 'notes'],
  secret: process.env.FIELD_ENCRYPTION_SECRET || 'default_secret',
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
export default HealthRecord; 