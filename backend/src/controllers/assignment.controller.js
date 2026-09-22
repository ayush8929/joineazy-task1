import { prisma } from "../config/prisma.js";

// Admin: create an assignment, optionally targeted at specific groups,
// optionally scoped to a course, with a submission type of 'group' or 'individual'.
export async function createAssignment(req, res) {
  try {
    const {
      title,
      description,
      due_date,
      onedrive_link,
      target_type,
      group_ids,
      submission_type,
      course_id,
    } = req.body;

    if (!title || !due_date || !onedrive_link) {
      return res
        .status(400)
        .json({ message: "title, due_date, and onedrive_link are required." });
    }

    const targetType = target_type === "group" ? "group" : "all";
    const submissionType =
      submission_type === "individual" ? "individual" : "group";

    if (
      targetType === "group" &&
      (!Array.isArray(group_ids) || group_ids.length === 0)
    ) {
      return res.status(400).json({
        message: 'group_ids is required when target_type is "group".',
      });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(due_date),
        oneDriveLink: onedrive_link,
        createdBy: req.user.id,
        targetType,
        submissionType,
        ...(course_id && { courseId: Number(course_id) }),
        ...(targetType === "group" && {
          targets: {
            create: group_ids.map((groupId) => ({ groupId: Number(groupId) })),
          },
        }),
      },
      include: { targets: true },
    });

    res.status(201).json({ assignment });
  } catch (err) {
    console.error("createAssignment error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong creating the assignment." });
  }
}

// Admin: edit an existing assignment's basic fields.
export async function updateAssignment(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, description, due_date, onedrive_link } = req.body;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(due_date && { dueDate: new Date(due_date) }),
        ...(onedrive_link && { oneDriveLink: onedrive_link }),
      },
    });

    res.json({ assignment });
  } catch (err) {
    console.error("updateAssignment error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong updating the assignment." });
  }
}

// Student: list assignments visible to them (all + their groups' targeted ones),
// optionally scoped to a single course, annotated with the right submission
// status depending on whether the assignment is individual or group type.
export async function listAssignmentsForStudent(req, res) {
  try {
    const { course_id } = req.query;

    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.user.id },
    });
    const myGroupIds = memberships.map((m) => m.groupId);
    const isLeaderOfAnyGroup = memberships.some((m) => m.isLeader);

    const assignments = await prisma.assignment.findMany({
      where: {
        ...(course_id && { courseId: Number(course_id) }),
        OR: [
          { targetType: "all" },
          { targets: { some: { groupId: { in: myGroupIds } } } },
        ],
      },
      orderBy: { dueDate: "asc" },
    });

    const assignmentIds = assignments.map((a) => a.id);

    const groupSubmissions = await prisma.submission.findMany({
      where: {
        assignmentId: { in: assignmentIds },
        groupId: { in: myGroupIds },
      },
    });
    const individualSubmissions = await prisma.submission.findMany({
      where: { assignmentId: { in: assignmentIds }, studentId: req.user.id },
    });

    const withStatus = assignments.map((a) => {
      if (a.submissionType === "individual") {
        const sub = individualSubmissions.find((s) => s.assignmentId === a.id);
        return {
          ...a,
          submissionStatus: sub?.status || "pending",
          canConfirm: true,
        };
      }
      const sub = groupSubmissions.find((s) => s.assignmentId === a.id);
      return {
        ...a,
        submissionStatus: sub?.status || "pending",
        // NOTE: assumes a student belongs to one primary group. If a student can be
        // in multiple groups simultaneously, this should check leadership per-group.
        canConfirm: isLeaderOfAnyGroup,
      };
    });

    res.json({ assignments: withStatus });
  } catch (err) {
    console.error("listAssignmentsForStudent error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong fetching assignments." });
  }
}

// Admin: list all assignments with their targeting info.
export async function listAssignmentsForAdmin(req, res) {
  try {
    const { course_id } = req.query;

    const assignments = await prisma.assignment.findMany({
      where: { ...(course_id && { courseId: Number(course_id) }) },
      include: { targets: { include: { group: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ assignments });
  } catch (err) {
    console.error("listAssignmentsForAdmin error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong fetching assignments." });
  }
}

// Admin: group-wise or student-wise submission status for one assignment,
// depending on its submissionType.
export async function getAssignmentSubmissions(req, res) {
  try {
    const assignmentId = Number(req.params.id);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        targets: {
          include: {
            group: { include: { members: { include: { user: true } } } },
          },
        },
      },
    });
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found." });

    if (assignment.submissionType === "individual") {
      const enrollments = assignment.courseId
        ? await prisma.enrollment.findMany({
            where: { courseId: assignment.courseId },
            include: { student: true },
          })
        : [];

      const submissions = await prisma.submission.findMany({
        where: { assignmentId, studentId: { not: null } },
      });

      const studentStatus = enrollments.map((e) => {
        const sub = submissions.find((s) => s.studentId === e.studentId);
        return {
          studentId: e.studentId,
          studentName: e.student.name,
          studentEmail: e.student.email,
          status: sub?.status || "pending",
          confirmedAt: sub?.confirmedAt || null,
        };
      });

      return res.json({
        assignmentId,
        submissionType: "individual",
        students: studentStatus,
      });
    }

    // Which groups is this assignment visible to?
    const groups =
      assignment.targetType === "all"
        ? await prisma.group.findMany({
            include: { members: { include: { user: true } } },
          })
        : assignment.targets.map((t) => t.group);

    const submissions = await prisma.submission.findMany({
      where: { assignmentId, groupId: { in: groups.map((g) => g.id) } },
    });

    const groupStatus = groups.map((group) => {
      const sub = submissions.find((s) => s.groupId === group.id);
      return {
        groupId: group.id,
        groupName: group.name,
        status: sub?.status || "pending",
        confirmedAt: sub?.confirmedAt || null,
        leader: group.members.find((m) => m.isLeader)?.user?.name || null,
        members: group.members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          isLeader: m.isLeader,
        })),
      };
    });

    res.json({ assignmentId, submissionType: "group", groups: groupStatus });
  } catch (err) {
    console.error("getAssignmentSubmissions error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong fetching submission status." });
  }
}
