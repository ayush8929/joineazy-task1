import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import {
  createAssignment,
  updateAssignment,
  listAssignmentsForStudent,
  listAssignmentsForAdmin,
  getAssignmentSubmissions,
} from '../controllers/assignment.controller.js';

const router = Router();

router.use(requireAuth); // every assignment route requires login

// Student-facing
router.get('/', (req, res, next) => {
  if (req.user.role === 'admin') return listAssignmentsForAdmin(req, res, next);
  return listAssignmentsForStudent(req, res, next);
});

// Admin-only
router.post('/', requireRole('admin'), createAssignment);
router.put('/:id', requireRole('admin'), updateAssignment);
router.get('/:id/submissions', requireRole('admin'), getAssignmentSubmissions);

export default router;
