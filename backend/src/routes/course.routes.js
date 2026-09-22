import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import {
  createCourse,
  myCoursesAsProfessor,
  myCoursesAsStudent,
  enrollStudent,
} from "../controllers/course.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res, next) => {
  if (req.user.role === "admin") return myCoursesAsProfessor(req, res, next);
  return myCoursesAsStudent(req, res, next);
});

router.post("/", requireRole("admin"), createCourse);
router.post("/:id/enroll", requireRole("admin"), enrollStudent);

export default router;
