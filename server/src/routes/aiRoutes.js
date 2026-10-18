import express from 'express';
import { analyzeSymptoms, chatAssistant } from '../controllers/aiController.js';

const router = express.Router();

router.post('/triage', analyzeSymptoms);
router.post('/chat', chatAssistant);

export default router;
