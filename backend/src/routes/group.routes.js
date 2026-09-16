import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { createGroup, addMember, myGroups, groupProgress, listAllGroups } from '../controllers/group.controller.js';

const router = Router();

router.use(requireAuth); // every group route requires login

router.get('/', requireRole('admin'), listAllGroups);
router.post('/', createGroup);
router.post('/:id/members', addMember);
router.get('/mine', myGroups);
router.get('/:id/progress', groupProgress);

export default router;
