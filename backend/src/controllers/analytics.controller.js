import { prisma } from "../config/prisma.js";

export async function overview(req, res) {
  try {
    // Run sequentially rather than Promise.all — keeps concurrent connections
    // low, which matters on Neon's connection limits (especially direct/non-pooled).
    const totalAssignments = await prisma.assignment.count();
    const totalGroups = await prisma.group.count();
    const allGroups = await prisma.group.findMany();
    const allAssignments = await prisma.assignment.findMany({
      include: { targets: true },
    });
    const confirmedSubmissions = await prisma.submission.findMany({
      where: { status: "confirmed" },
    });

    // For each group, figure out how many assignments are visible to it,
    // and how many of those it has confirmed.
    const perGroup = allGroups.map((group) => {
      const visible = allAssignments.filter(
        (a) =>
          a.targetType === "all" ||
          a.targets.some((t) => t.groupId === group.id),
      );
      const confirmed = confirmedSubmissions.filter(
        (s) =>
          s.groupId === group.id &&
          visible.some((a) => a.id === s.assignmentId),
      );
      const total = visible.length;
      return {
        groupId: group.id,
        groupName: group.name,
        total,
        confirmed: confirmed.length,
        percentage:
          total === 0 ? 0 : Math.round((confirmed.length / total) * 100),
      };
    });

    const totalExpectedSubmissions = perGroup.reduce(
      (sum, g) => sum + g.total,
      0,
    );
    const totalConfirmedSubmissions = perGroup.reduce(
      (sum, g) => sum + g.confirmed,
      0,
    );
    const overallCompletionPercentage =
      totalExpectedSubmissions === 0
        ? 0
        : Math.round(
            (totalConfirmedSubmissions / totalExpectedSubmissions) * 100,
          );

    res.json({
      totalAssignments,
      totalGroups,
      overallCompletionPercentage,
      perGroup,
    });
  } catch (err) {
    console.error("analytics overview error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong fetching analytics." });
  }
}
