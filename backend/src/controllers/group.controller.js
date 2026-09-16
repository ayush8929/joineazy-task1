import { prisma } from '../config/prisma.js';

// Student creates a new group. The creator is automatically added as a member.
export async function createGroup(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Group name is required.' });

    const group = await prisma.group.create({
      data: {
        name,
        createdBy: req.user.id,
        members: {
          create: { userId: req.user.id },
        },
      },
      include: { members: { include: { user: true } } },
    });

    res.status(201).json({ group });
  } catch (err) {
    console.error('createGroup error:', err);
    res.status(500).json({ message: 'Something went wrong creating the group.' });
  }
}

// Add a member to a group by email or student ID.
// Only an existing member of the group can add someone else.
export async function addMember(req, res) {
  try {
    const groupId = Number(req.params.id);
    const { identifier } = req.body; // email OR student_id

    if (!identifier) {
      return res.status(400).json({ message: 'Provide the student\'s email or student ID.' });
    }

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.id } },
    });
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this group.' });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        role: 'student',
        OR: [{ email: identifier }, { studentId: identifier }],
      },
    });
    if (!targetUser) {
      return res.status(404).json({ message: 'No student found with that email or student ID.' });
    }

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUser.id } },
    });
    if (existing) {
      return res.status(409).json({ message: 'This student is already in the group.' });
    }

    const newMember = await prisma.groupMember.create({
      data: { groupId, userId: targetUser.id },
      include: { user: true },
    });

    res.status(201).json({ member: newMember });
  } catch (err) {
    console.error('addMember error:', err);
    res.status(500).json({ message: 'Something went wrong adding the member.' });
  }
}

// Get the group(s) the current student belongs to.
export async function myGroups(req, res) {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.user.id },
      include: {
        group: {
          include: { members: { include: { user: true } } },
        },
      },
    });

    res.json({ groups: memberships.map((m) => m.group) });
  } catch (err) {
    console.error('myGroups error:', err);
    res.status(500).json({ message: 'Something went wrong fetching your groups.' });
  }
}

// Completion % for a group: confirmed submissions / assignments visible to that group.
export async function groupProgress(req, res) {
  try {
    const groupId = Number(req.params.id);

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.id } },
    });
    if (!membership && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not a member of this group.' });
    }

    // Assignments visible to this group: target_type 'all', or targeted specifically at this group.
    const visibleAssignments = await prisma.assignment.findMany({
      where: {
        OR: [
          { targetType: 'all' },
          { targets: { some: { groupId } } },
        ],
      },
    });

    const submissions = await prisma.submission.findMany({
      where: {
        groupId,
        status: 'confirmed',
        assignmentId: { in: visibleAssignments.map((a) => a.id) },
      },
    });

    const total = visibleAssignments.length;
    const confirmed = submissions.length;
    const percentage = total === 0 ? 0 : Math.round((confirmed / total) * 100);

    res.json({ groupId, total, confirmed, percentage });
  } catch (err) {
    console.error('groupProgress error:', err);
    res.status(500).json({ message: 'Something went wrong calculating progress.' });
  }
}
