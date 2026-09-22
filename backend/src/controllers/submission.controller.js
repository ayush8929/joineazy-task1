import { prisma } from "../config/prisma.js";

// Student confirms a submission for an assignment.
// Branches on the assignment's submissionType:
//  - 'group'      -> only the group leader may confirm; one row per group.
//  - 'individual' -> each student confirms their own; one row per student.
export async function confirmSubmission(req, res) {
  try {
    const assignmentId = Number(req.params.assignmentId);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { targets: true },
    });
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found." });

    if (assignment.submissionType === "individual") {
      return confirmIndividualSubmission(req, res, assignment);
    }
    return confirmGroupSubmission(req, res, assignment);
  } catch (err) {
    console.error("confirmSubmission error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong confirming the submission." });
  }
}

async function confirmGroupSubmission(req, res, assignment) {
  const { group_id } = req.body;
  if (!group_id) {
    return res.status(400).json({ message: "group_id is required." });
  }
  const groupId = Number(group_id);

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: req.user.id } },
  });
  if (!membership) {
    return res
      .status(403)
      .json({ message: "You are not a member of this group." });
  }
  if (!membership.isLeader) {
    return res
      .status(403)
      .json({
        message: "Only the group leader can confirm submission for the group.",
      });
  }

  const visible =
    assignment.targetType === "all" ||
    assignment.targets.some((t) => t.groupId === groupId);
  if (!visible) {
    return res
      .status(403)
      .json({ message: "This assignment is not assigned to your group." });
  }

  const submission = await prisma.submission.upsert({
    where: { assignmentId_groupId: { assignmentId: assignment.id, groupId } },
    update: {
      status: "confirmed",
      confirmedBy: req.user.id,
      confirmedAt: new Date(),
    },
    create: {
      assignmentId: assignment.id,
      groupId,
      status: "confirmed",
      confirmedBy: req.user.id,
      confirmedAt: new Date(),
    },
  });

  res.json({ submission });
}

async function confirmIndividualSubmission(req, res, assignment) {
  const studentId = req.user.id;

  const submission = await prisma.submission.upsert({
    where: {
      assignmentId_studentId: { assignmentId: assignment.id, studentId },
    },
    update: {
      status: "confirmed",
      confirmedBy: req.user.id,
      confirmedAt: new Date(),
    },
    create: {
      assignmentId: assignment.id,
      studentId,
      status: "confirmed",
      confirmedBy: req.user.id,
      confirmedAt: new Date(),
    },
  });

  res.json({ submission });
}
