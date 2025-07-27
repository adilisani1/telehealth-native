import adminRoutes from './admin.js';
import reviewRoutes from './review.js';
import router from 'express';
 
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes); 