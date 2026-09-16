import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { overview } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/overview', requireAuth, requireRole('admin'), overview);

export default router;
