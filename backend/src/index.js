import '../loadEnv.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from '../config/db.js';
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/user.js';
import healthRecordRoutes from '../routes/healthRecord.js';
import appointmentRoutes from '../routes/appointment.js';
import notificationRoutes from '../routes/notification.js';
import doctorRoutes from '../routes/doctor.js';
import appointmentManagementRoutes from '../routes/appointmentManagement.js';
import adminRoutes from '../routes/admin.js';
import reviewRoutes from '../routes/review.js';
import stripeRoutes from '../routes/stripe.js';
import path from 'path';
import helmet from 'helmet';


const app = express();
// Trust first proxy (for correct client IP and security with rate limiting)
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;

connectDB()
.then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.log('MongoDB connection error:', error.message);
  process.exit(1);
});

app.get('/', (req, res) => {
    res.send('API is running');
  });

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointment-management', appointmentManagementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stripe', stripeRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});