import { prisma } from '../config/database';
import { ACCURATE_REPORT_NET_SCORE_THRESHOLD } from '@townly/shared';

/**
 * Recalculates a user's credibility score based on their report history.
 * Called after every vote event. Two queries: one read, one write.
 *
 * Score formula:
 *   base = 50 + (accuracyRate - 0.5) * 80
 *   activityBonus = min(totalReports * 0.5, 10)
 *   final = clamp(base + activityBonus, 0, 100)
 */
export async function recalculateCredibility(userId: string): Promise<void> {
  const [totalReports, accurateReports] = await Promise.all([
    prisma.report.count({ where: { authorId: userId, status: { not: 'REMOVED' } } }),
    prisma.report.count({
      where: {
        authorId: userId,
        status: { not: 'REMOVED' },
        netScore: { gte: ACCURATE_REPORT_NET_SCORE_THRESHOLD },
      },
    }),
  ]);

  const accuracyRate = totalReports === 0 ? 0.5 : accurateReports / totalReports;
  const base = 50 + (accuracyRate - 0.5) * 80;
  const activityBonus = Math.min(totalReports * 0.5, 10);
  const credibilityScore = Math.max(0, Math.min(100, base + activityBonus));

  await prisma.user.update({
    where: { id: userId },
    data: { credibilityScore, totalReports, accurateReports },
  });
}
