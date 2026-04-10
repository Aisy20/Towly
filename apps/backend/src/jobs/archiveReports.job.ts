import cron from 'node-cron';
import { prisma } from '../config/database';
import { redis, REDIS_CHANNELS } from '../config/redis';

const ARCHIVE_AFTER_MS = 48 * 60 * 60 * 1000;

/**
 * Runs every 15 minutes.
 * Archives ACTIVE reports older than 48 hours and notifies WebSocket clients.
 */
export function startArchiveJob(): void {
  cron.schedule('*/15 * * * *', async () => {
    const cutoff = new Date(Date.now() - ARCHIVE_AFTER_MS);

    const result = await prisma.report.updateMany({
      where: { status: 'ACTIVE', createdAt: { lt: cutoff } },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });

    if (result.count > 0) {
      console.log(`[archive] Archived ${result.count} report(s)`);
      // Notify connected clients to remove archived pins
      await redis.publish(REDIS_CHANNELS.REPORTS_ARCHIVED, JSON.stringify({ count: result.count }));
    }
  });

  console.log('[archive] Cron job scheduled (every 15 min)');
}
