import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getMyNotifications, markNotificationRead, sendAdminNotice } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('doctor', 'patient'), getMyNotifications);
router.put('/:id/read', protect, authorizeRoles('doctor', 'patient'), markNotificationRead);
router.post('/admin-notice', protect, authorizeRoles('admin'), sendAdminNotice);

export default router; 