import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadHealthRecord, getMyHealthRecords, deleteHealthRecord } from '../controllers/healthRecordController.js';
import { body } from 'express-validator';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image or PDF files are allowed!'), false);
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/',
  protect,
  authorizeRoles('patient'),
  upload.single('file'),
  [
    body('type').notEmpty().withMessage('Type is required').isIn(['image', 'pdf', 'note']).withMessage('Type must be image, pdf, or note'),
    body('description').notEmpty().withMessage('Description is required').isLength({ max: 500 }).withMessage('Description too long'),
    body().custom((value, { req }) => {
      if (req.body.type !== 'note' && !req.file) throw new Error('File is required for image/pdf');
      if (req.file && !(req.file.mimetype.startsWith('image/') || req.file.mimetype === 'application/pdf')) {
        throw new Error('Only image or PDF files are allowed!');
      }
      return true;
    })
  ],
  uploadHealthRecord
);
router.get('/', protect, authorizeRoles('patient'), getMyHealthRecords);
router.delete('/:id', protect, authorizeRoles('patient'), deleteHealthRecord);

export default router; 