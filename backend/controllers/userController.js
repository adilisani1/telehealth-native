// Logout: Remove device token and clear session
export const logout = async (req, res) => {
  try {
    // Remove device token if provided
    const { token } = req.body;
    if (token && req.user.deviceTokens) {
      req.user.deviceTokens = req.user.deviceTokens.filter(t => t !== token);
      await req.user.save();
    }
    // If using sessions, destroy session
    if (req.session) {
      req.session.destroy(() => {});
    }
    // If using JWT, client should delete token
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import path from 'path';

export const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user, message: 'Profile fetched successfully' });
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Normalize gender if provided
    if (updates.gender) {
      const genderStr = updates.gender.toString().trim().toLowerCase();
      if (genderStr === 'male') {
        updates.gender = 'male';
      } else if (genderStr === 'female') {
        updates.gender = 'female';
      } else if (genderStr === 'others' || genderStr === 'other' || genderStr === 'preferred not to say') {
        updates.gender = 'other';
      }
      
      console.log('🔍 PROFILE UPDATE: Gender normalized from', req.body.gender, 'to', updates.gender);
    }
    
    // Handle avatar upload
    if (req.file) {
      // Validate file type and size
      if (!(req.file.mimetype.startsWith('image/'))) {
        return res.status(400).json({ success: false, message: 'Only image files are allowed for avatar' });
      }
      if (req.file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Avatar file size must be <= 2MB' });
      }
      updates.avatar = `/uploads/${req.file.filename}`;
    }
    // Enforce required fields based on role
    if (req.user.role === 'patient') {
      if (!updates.dob && !req.user.dob) {
        return res.status(400).json({ success: false, message: 'Date of birth (dob) is required for patients' });
      }
    }
    if (req.user.role === 'doctor') {
      if ((!updates.specialization && !req.user.specialization) || (!updates.qualifications && !req.user.qualifications)) {
        return res.status(400).json({ success: false, message: 'Specialization and qualifications are required for doctors' });
      }
    }
    // Prevent empty updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No update fields provided' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, select: '-password' });
    res.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiry -passwordResetOtp -passwordResetOtpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Fetch related data (appointments, health records, etc.)
    // For brevity, only user data is exported here
    res.json({ success: true, data: user, message: 'User data export successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    // Optionally, delete related data (appointments, health records, etc.)
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Device token is required' });
    if (!req.user.deviceTokens) req.user.deviceTokens = [];
    if (!req.user.deviceTokens.includes(token)) {
      req.user.deviceTokens.push(token);
      await req.user.save();
    }
    res.json({ success: true, message: 'Device token added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Device token is required' });
    req.user.deviceTokens = (req.user.deviceTokens || []).filter(t => t !== token);
    await req.user.save();
    res.json({ success: true, message: 'Device token removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 