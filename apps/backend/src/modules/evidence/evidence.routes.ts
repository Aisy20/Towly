import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { redis, REDIS_CHANNELS } from '../../config/redis';
import { uploadReportPhoto } from '../../lib/cloudinary';
import cuid from '@paralleldrive/cuid2';

export async function evidenceRoutes(app: FastifyInstance) {
  // POST /reports/:reportId/evidence — add corroborating photo (multipart)
  app.post(
    '/:reportId/evidence',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = (request.user as { sub: string }).sub;
      const { reportId } = request.params as { reportId: string };

      const report = await prisma.report.findUnique({ where: { id: reportId } });
      if (!report) return reply.status(404).send({ error: 'Report not found' });
      if (report.status !== 'ACTIVE') {
        return reply.status(400).send({ error: 'Report is no longer active' });
      }

      const parts = request.parts();
      const fields: Record<string, string> = {};
      let photoBuffer: Buffer | undefined;

      for await (const part of parts) {
        if (part.type === 'file') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) chunks.push(chunk);
          photoBuffer = Buffer.concat(chunks);
        } else {
          fields[part.fieldname] = part.value as string;
        }
      }

      if (!photoBuffer) {
        return reply.status(400).send({ error: 'Photo is required for evidence' });
      }

      const evidenceId = cuid.createId();
      const photoUrl = await uploadReportPhoto(photoBuffer, `evidence-${evidenceId}`);

      const evidence = await prisma.evidence.create({
        data: {
          id: evidenceId,
          reportId,
          userId,
          caption: fields.caption?.trim().slice(0, 300) || null,
          photoUrl,
        },
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true, credibilityScore: true },
          },
        },
      });

      // Broadcast via Redis
      await redis.publish(REDIS_CHANNELS.EVIDENCE_ADDED, JSON.stringify(evidence));

      // Notify report author (if not self)
      if (report.authorId !== userId) {
        const contributor = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        await prisma.notification.create({
          data: {
            userId: report.authorId,
            reportId,
            type: 'NEW_NEARBY_REPORT', // reuse existing type for now
            title: 'New corroborating evidence',
            body: `@${contributor?.username ?? 'Someone'} added a photo to your report "${report.title.slice(0, 40)}"`,
          },
        });
      }

      return reply.status(201).send(evidence);
    },
  );

  // GET /reports/:reportId/evidence — list evidence
  app.get('/:reportId/evidence', async (request, reply) => {
    const { reportId } = request.params as { reportId: string };

    const evidence = await prisma.evidence.findMany({
      where: { reportId },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true, credibilityScore: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(evidence);
  });
}
