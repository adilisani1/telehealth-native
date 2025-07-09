import HealthRecord from '../models/HealthRecord.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

export const uploadHealthRecord = async (req, res) => {
  try {
    const { type, description, data: noteData } = req.body;
    if (!type || !['image', 'pdf', 'note'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing type' });
    }
    let fileUrl = null;
    let data = '';
    if (type !== 'note') {
      if (!req.file) return res.status(400).json({ success: false, message: 'File is required for image/pdf' });
      fileUrl = `/uploads/${req.file.filename}`;
      data = req.file.filename || 'uploaded';
    } else {
      if (!noteData) return res.status(400).json({ success: false, message: 'Note data is required' });
      data = noteData;
    }
    const record = await HealthRecord.create({
      patient: req.user._id,
      type,
      fileUrl,
      description,
      data,
    });
    res.status(201).json({ success: true, data: record, message: 'Health record uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyHealthRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await HealthRecord.countDocuments({ patient: req.user._id });
    const records = await HealthRecord.find({ patient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ success: true, data: { records, total, page, pages: Math.ceil(total / limit) }, message: 'Health records fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHealthRecord = async (req, res) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid health record ID' });
    }
    const record = await HealthRecord.findOne({ _id: req.params.id, patient: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Health record not found' });
    if (record.fileUrl) {
      const filePath = path.join(process.cwd(), 'uploads', path.basename(record.fileUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await record.deleteOne();
    res.json({ success: true, message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 