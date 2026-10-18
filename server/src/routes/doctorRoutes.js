import express from 'express';
import { getDoctors, getDoctorById, getDepartments } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/departments', getDepartments);
router.get('/:id', getDoctorById);

export default router;
