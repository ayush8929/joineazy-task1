import { prisma } from '../config/prisma.js';

// Admin: create an assignment, optionally targeted at specific groups.
export async function createAssignment(req, res) {
  try {
    const { title, description, due_date, onedrive_link, target_type, group_ids } = req.body;

    if (!title || !due_date || !onedrive_link) {
      return res.status(400).json({ message: 'title, due_date, and onedrive_link are required.' });
    }

    const targetType = target_type === 'group' ? 'group' : 'all';

    if (targetType === 'group' && (!Array.isArray(group_ids) || group_ids.length === 0)) {
      return res.status(400).json({ message: 'group_ids is required when target_type is "group".' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(due_date),
        oneDriveLink: onedrive_link,
        createdBy: req.user.id,
        targetType,
        ...(targetType === 'group' && {
          targets: {
            create: group_ids.map((groupId) => ({ groupId: Number(groupId) })),
          },
        }),
      },
      include: { targets: true },
    });

    res.status(201).json({ assignment });
  } catch (err) {
    console.error('createAssignment error:', err);
    res.status(500).json({ message: 'Something went wrong creating the assignment.' });
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
    console.error('updateAssignment error:', err);
    res.status(500).json({ message: 'Something went wrong updating the assignment.' });
  }
}

// Student: list assignments visible to them (all + their groups' targeted ones),
// annotated with their group's submission status for each.
export async function listAssignmentsForStudent(req, res) {
  try {
    const memberships = await prisma.groupMember.findMany({ where: { userId: req.user.id } });
    const myGroupIds = memberships.map((m) => m.groupId);

    const assignments = await prisma.assignment.findMany({
      where: {
        OR: [
          { targetType: 'all' },
          { targets: { some: { groupId: { in: myGroupIds } } } },
        ],
      },
      orderBy: { dueDate: 'asc' },
    });

    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: { in: assignments.map((a) => a.id) },
        groupId: { in: myGroupIds },
      },
    });

    const withStatus = assignments.map((a) => {
      const sub = submissions.find((s) => s.assignmentId === a.id);
      return { ...a, submissionStatus: sub?.status || 'pending' };
    });

    res.json({ assignments: withStatus });
  } catch (err) {
    console.error('listAssignmentsForStudent error:', err);
    res.status(500).json({ message: 'Something went wrong fetching assignments.' });
  }
}

// Admin: list all assignments with their targeting info.
export async function listAssignmentsForAdmin(req, res) {
  try {
    const assignments = await prisma.assignment.findMany({
      include: { targets: { include: { group: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ assignments });
  } catch (err) {
    console.error('listAssignmentsForAdmin error:', err);
    res.status(500).json({ message: 'Something went wrong fetching assignments.' });
  }
}

// Admin: group-wise and student-wise submission status for one assignment.
export async function getAssignmentSubmissions(req, res) {
  try {
    const assignmentId = Number(req.params.id);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { targets: { include: { group: { include: { members: { include: { user: true } } } } } } },
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    // Which groups is this assignment visible to?
    const groups =
      assignment.targetType === 'all'
        ? await prisma.group.findMany({ include: { members: { include: { user: true } } } })
        : assignment.targets.map((t) => t.group);

    const submissions = await prisma.submission.findMany({
      where: { assignmentId, groupId: { in: groups.map((g) => g.id) } },
    });

    const groupStatus = groups.map((group) => {
      const sub = submissions.find((s) => s.groupId === group.id);
      return {
        groupId: group.id,
        groupName: group.name,
        status: sub?.status || 'pending',
        confirmedAt: sub?.confirmedAt || null,
        members: group.members.map((m) => ({ id: m.user.id, name: m.user.name, email: m.user.email })),
      };
    });

    res.json({ assignmentId, groups: groupStatus });
  } catch (err) {
    console.error('getAssignmentSubmissions error:', err);
    res.status(500).json({ message: 'Something went wrong fetching submission status.' });
  }
}
