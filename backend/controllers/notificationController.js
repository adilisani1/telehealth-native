import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendNotificationEmail } from '../utils/mail.js';
import { ADMIN_NOTICE_EMAIL_SUBJECT } from '../constants.js';

// Get notifications for logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications, message: 'Notifications fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Send notice to all users, by role, or to a specific user
export const sendAdminNotice = async (req, res) => {
  try {
    const { message, role, user } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    let users = [];
    if (user) {
      // Allow user to be email or user ID
      users = await User.find(
        user.includes('@') ? { email: user } : { _id: user }
      );
      if (!users.length) return res.status(404).json({ success: false, message: 'User not found' });
    } else if (role) {
      users = await User.find({ role });
      if (!users.length) return res.status(404).json({ success: false, message: 'No users found for this notice' });
    } else {
      users = await User.find();
      if (!users.length) return res.status(404).json({ success: false, message: 'No users found for this notice' });
    }
    // Create notifications and send emails
    const notifications = users.map(u => ({ user: u._id, type: 'admin', message }));
    await Notification.insertMany(notifications);
    for (const u of users) {
      if (u.email) {
        try {
          await sendNotificationEmail({ to: u.email, subject: ADMIN_NOTICE_EMAIL_SUBJECT, message });
        } catch (e) { /* log or ignore individual email errors */ }
      }
    }
    res.json({ success: true, message: 'Admin notice sent to users.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 