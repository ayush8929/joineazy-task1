import { prisma } from "../config/prisma.js";

// Professor: create a new course.
export async function createCourse(req, res) {
  try {
    const { title, description } = req.body;
    if (!title)
      return res.status(400).json({ message: "Course title is required." });

    const course = await prisma.course.create({
      data: { title, description, professorId: req.user.id },
    });

    res.status(201).json({ course });
  } catch (err) {
    console.error("createCourse error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong creating the course." });
  }
}

// Professor: list courses they teach, with student/assignment counts.
export async function myCoursesAsProfessor(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: { professorId: req.user.id },
      include: { enrollments: true, assignments: true },
      orderBy: { createdAt: "desc" },
    });

    const withCounts = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      studentCount: c.enrollments.length,
      assignmentCount: c.assignments.length,
    }));

    res.json({ courses: withCounts });
  } catch (err) {
    console.error("myCoursesAsProfessor error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong fetching your courses." });
  }
}

// Student: list courses they're enrolled in.
export async function myCoursesAsStudent(req, res) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.id },
      include: { course: { include: { professor: true } } },
    });

    const courses = enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      professorName: e.course.professor.name,
    }));

    res.json({ courses });
  } catch (err) {
    console.error("myCoursesAsStudent error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong fetching your courses." });
  }
}

// Professor: enroll a student in their course, by email or student ID.
export async function enrollStudent(req, res) {
  try {
    const courseId = Number(req.params.id);
    const { identifier } = req.body;

    if (!identifier) {
      return res
        .status(400)
        .json({ message: "Provide the student's email or student ID." });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found." });
    if (course.professorId !== req.user.id) {
      return res.status(403).json({ message: "You do not teach this course." });
    }

    const student = await prisma.user.findFirst({
      where: {
        role: "student",
        OR: [{ email: identifier }, { studentId: identifier }],
      },
    });
    if (!student)
      return res
        .status(404)
        .json({ message: "No student found with that email or student ID." });

    const existing = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId: student.id } },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "This student is already enrolled." });

    const enrollment = await prisma.enrollment.create({
      data: { courseId, studentId: student.id },
      include: { student: true },
    });

    res.status(201).json({ enrollment });
  } catch (err) {
    console.error("enrollStudent error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong enrolling the student." });
  }
}
