import express from 'express';
import { getAdminAnalytics } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', requireAuth, requireRole('admin', 'doctor'), getAdminAnalytics);

export default router;
