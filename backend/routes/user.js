
import express from 'express';
import { getProfile, updateProfile, changePassword, exportUserData, deleteAccount, addDeviceToken, removeDeviceToken, logout } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { body } from 'express-validator';

const router = express.Router();

// ...existing code...

router.post('/logout', protect, logout);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({ storage, fileFilter });

router.get('/profile', protect, getProfile);
router.put('/profile',
  protect,
  upload.single('avatar'),
  [
    body('specialization').if((value, { req }) => req.user.role === 'doctor').notEmpty().withMessage('Specialization is required for doctors'),
    body('qualifications').if((value, { req }) => req.user.role === 'doctor').notEmpty().withMessage('Qualifications are required for doctors'),
    body('dob').if((value, { req }) => req.user.role === 'patient').notEmpty().withMessage('Date of birth (dob) is required for patients'),
    body('gender').optional().custom((value) => {
      if (!value) return true;
      const normalizedValue = value.toString().trim().toLowerCase();
      if (['male', 'female', 'other', 'others', 'preferred not to say'].includes(normalizedValue)) {
        return true;
      }
      throw new Error('Gender must be male, female, other, others, or preferred not to say');
    })
  ],
  updateProfile
);
router.put('/change-password',
  protect,
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  changePassword
);
router.get('/export-data', protect, exportUserData);
router.delete('/delete-account', protect, deleteAccount);

// Device token management for push notifications
router.post('/device-token',
  protect,
  [body('token').isString().notEmpty().withMessage('Device token is required')],
  addDeviceToken
);
router.delete('/device-token',
  protect,
  [body('token').isString().notEmpty().withMessage('Device token is required')],
  removeDeviceToken
);

export default router; 