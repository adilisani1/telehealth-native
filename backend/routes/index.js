import adminRoutes from './admin.js';
import router from 'express';
 
app.use('/api/admin', adminRoutes);
router.use('/admin', adminRoutes); 