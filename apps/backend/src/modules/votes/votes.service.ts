import { prisma } from '../../config/database';
import { redis, REDIS_CHANNELS } from '../../config/redis';
import { recalculateCredibility } from '../../lib/credibility';

export async function castVote(
  reportId: string,
  userId: string,
  value: 1 | -1,
): Promise<{ upvotes: number; downvotes: number; netScore: number }> {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw Object.assign(new Error('Report not found'), { statusCode: 404 });
  if (report.authorId === userId) {
    throw Object.assign(new Error('Cannot vote on your own report'), { statusCode: 400 });
  }

  await prisma.vote.upsert({
    where: { reportId_userId: { reportId, userId } },
    update: { value },
    create: { reportId, userId, value },
  });

  // Recount from source of truth to avoid race conditions
  const [upvotes, downvotes] = await Promise.all([
    prisma.vote.count({ where: { reportId, value: 1 } }),
    prisma.vote.count({ where: { reportId, value: -1 } }),
  ]);

  const netScore = upvotes - downvotes;
  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { upvotes, downvotes, netScore },
  });

  // Broadcast vote update (debounced on client)
  await redis.publish(
    REDIS_CHANNELS.REPORTS_VOTED,
    JSON.stringify({ reportId, netScore, upvotes, downvotes }),
  );

  // Recalculate report author's credibility score asynchronously
  recalculateCredibility(updated.authorId).catch(console.error);

  return { upvotes, downvotes, netScore };
}

export async function removeVote(reportId: string, userId: string): Promise<void> {
  const vote = await prisma.vote.findUnique({
    where: { reportId_userId: { reportId, userId } },
  });
  if (!vote) return;

  await prisma.vote.delete({ where: { reportId_userId: { reportId, userId } } });

  const [upvotes, downvotes] = await Promise.all([
    prisma.vote.count({ where: { reportId, value: 1 } }),
    prisma.vote.count({ where: { reportId, value: -1 } }),
  ]);

  const report = await prisma.report.update({
    where: { id: reportId },
    data: { upvotes, downvotes, netScore: upvotes - downvotes },
  });

  recalculateCredibility(report.authorId).catch(console.error);
}
