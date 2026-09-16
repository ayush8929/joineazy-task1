import { prisma } from '../config/prisma.js';

// Student confirms their group's submission for an assignment.
// The frontend handles the "two-step" UX (button -> confirmation modal);
// this endpoint only fires once, on the final confirm.
export async function confirmSubmission(req, res) {
  try {
    const assignmentId = Number(req.params.assignmentId);
    const { group_id } = req.body;

    if (!group_id) {
      return res.status(400).json({ message: 'group_id is required.' });
    }
    const groupId = Number(group_id);

    // Verify the student is actually in this group.
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.id } },
    });
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this group.' });
    }

    // Verify the assignment is actually visible to this group.
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { targets: true },
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const visible =
      assignment.targetType === 'all' ||
      assignment.targets.some((t) => t.groupId === groupId);
    if (!visible) {
      return res.status(403).json({ message: 'This assignment is not assigned to your group.' });
    }

    const submission = await prisma.submission.upsert({
      where: { assignmentId_groupId: { assignmentId, groupId } },
      update: { status: 'confirmed', confirmedBy: req.user.id, confirmedAt: new Date() },
      create: {
        assignmentId,
        groupId,
        status: 'confirmed',
        confirmedBy: req.user.id,
        confirmedAt: new Date(),
      },
    });

    res.json({ submission });
  } catch (err) {
    console.error('confirmSubmission error:', err);
    res.status(500).json({ message: 'Something went wrong confirming the submission.' });
  }
}
