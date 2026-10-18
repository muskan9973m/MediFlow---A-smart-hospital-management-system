import express from 'express';
import { getLiveQueue, callNextToken, updateTokenStatus } from '../controllers/queueController.js';
import { requireAuth, requireRole, JWT_SECRET } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const router = express.Router();

// Optional auth helper to enrich queue response with patientTokenInfo
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.findOne('users', u => u.id === decoded.id);
      if (user) req.user = user;
    }
  } catch (e) {
    // Continue without req.user
  }
  next();
};

router.get('/', optionalAuth, getLiveQueue);
router.post('/call-next', requireAuth, requireRole('doctor', 'admin'), callNextToken);
router.patch('/:token', requireAuth, requireRole('doctor', 'admin'), updateTokenStatus);

export default router;
