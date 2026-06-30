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

    // Collect ids first so we can notify clients per-report (the client drops a
    // specific pin by reportId — a bare count can't tell it which).
    const stale = await prisma.report.findMany({
      where: { status: 'ACTIVE', createdAt: { lt: cutoff } },
      select: { id: true },
    });
    if (stale.length === 0) return;

    await prisma.report.updateMany({
      where: { id: { in: stale.map((r) => r.id) } },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });
    console.log(`[archive] Archived ${stale.length} report(s)`);

    // Notify connected clients to remove each archived pin.
    await Promise.all(
      stale.map((r) =>
        redis.publish(REDIS_CHANNELS.REPORTS_ARCHIVED, JSON.stringify({ reportId: r.id })),
      ),
    );
  });

  console.log('[archive] Cron job scheduled (every 15 min)');
}
