import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { redis, REDIS_CHANNELS } from '../../config/redis';
import { notifyUser } from '../notifications/notifications.service';

export async function helpRoutes(app: FastifyInstance) {
  // POST /reports/:reportId/help — offer help (thread message)
  app.post(
    '/:reportId/help',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = (request.user as { sub: string }).sub;
      const { reportId } = request.params as { reportId: string };
      const { message } = request.body as { message: string };

      if (!message || !message.trim()) {
        return reply.status(400).send({ error: 'Message is required' });
      }

      const report = await prisma.report.findUnique({ where: { id: reportId } });
      if (!report) return reply.status(404).send({ error: 'Report not found' });
      if (report.status !== 'ACTIVE') {
        return reply.status(400).send({ error: 'Report is no longer active' });
      }

      const helpOffer = await prisma.helpOffer.create({
        data: {
          reportId,
          userId,
          message: message.trim().slice(0, 300),
        },
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true, credibilityScore: true },
          },
        },
      });

      // Broadcast via Redis
      await redis.publish(REDIS_CHANNELS.HELP_OFFERED, JSON.stringify(helpOffer));

      // Notify report author (if not self) — persists a row and pushes.
      if (report.authorId !== userId) {
        const helper = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        await notifyUser({
          userId: report.authorId,
          reportId,
          type: 'HELP_OFFERED',
          title: 'Someone offered to help',
          body: `@${helper?.username ?? 'Someone'}: "${message.trim().slice(0, 80)}"`,
        });
      }

      return reply.status(201).send(helpOffer);
    },
  );

  // GET /reports/:reportId/help — list help thread
  app.get('/:reportId/help', async (request, reply) => {
    const { reportId } = request.params as { reportId: string };

    const helpOffers = await prisma.helpOffer.findMany({
      where: { reportId },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true, credibilityScore: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send(helpOffers);
  });
}
