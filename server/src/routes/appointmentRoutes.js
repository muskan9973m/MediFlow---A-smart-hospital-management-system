import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/cancel', cancelAppointment);
router.patch('/:id/status', requireRole('doctor', 'admin'), updateAppointmentStatus);

export default router;
