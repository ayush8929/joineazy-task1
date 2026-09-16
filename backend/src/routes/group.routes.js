import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createGroup, addMember, myGroups, groupProgress } from '../controllers/group.controller.js';

const router = Router();

router.use(requireAuth); // every group route requires login

router.post('/', createGroup);
router.post('/:id/members', addMember);
router.get('/mine', myGroups);
router.get('/:id/progress', groupProgress);

export default router;
