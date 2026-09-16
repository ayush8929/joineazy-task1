import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { confirmSubmission } from '../controllers/submission.controller.js';

const router = Router();

router.post('/:assignmentId/confirm', requireAuth, requireRole('student'), confirmSubmission);

export default router;
