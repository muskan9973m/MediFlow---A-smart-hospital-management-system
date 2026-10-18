import express from 'express';
import {
  getPatientRecords,
  updatePatientRecord,
  addVitals,
  getNotifications,
  markNotificationRead
} from '../controllers/patientController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/records', getPatientRecords);
router.get('/:patientId/records', getPatientRecords);
router.put('/records', updatePatientRecord);
router.put('/:patientId/records', updatePatientRecord);
router.post('/vitals', addVitals);
router.post('/:patientId/vitals', addVitals);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
