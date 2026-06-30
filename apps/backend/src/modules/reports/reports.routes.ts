import { FastifyInstance } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { ReportCategory } from '@townly/shared';
import { getReportsNearby } from './reports.geo';
import { reportInclude, toReportDTO } from './reports.serializer';
import { fanOutNewReport } from '../notifications/notifications.service';
import { uploadReportPhoto } from '../../lib/cloudinary';
import { redis, REDIS_CHANNELS } from '../../config/redis';
import { getReportsSchema } from './reports.schema';
import { createId } from '@paralleldrive/cuid2';

export async function reportRoutes(app: FastifyInstance) {
  // GET /reports — geospatial feed
  app.get('/', { schema: getReportsSchema }, async (request, reply) => {
    const query = request.query as {
      lat: number;
      lng: number;
      radius: number;
      category?: string | string[];
      cursor?: string;
      limit?: number;
    };

    const categories = query.category
      ? (Array.isArray(query.category) ? query.category : [query.category]) as ReportCategory[]
      : undefined;

    let requestingUserId: string | undefined;
    try {
      await request.jwtVerify();
      requestingUserId = (request.user as { sub: string }).sub;
    } catch {
      // unauthenticated is allowed for browsing
    }

    const result = await getReportsNearby({
      lat: query.lat,
      lng: query.lng,
      radiusMeters: query.radius,
      categories,
      cursor: query.cursor,
      limit: query.limit,
      requestingUserId,
    });

    return reply.send(result);
  });

  // POST /reports — create report (multipart)
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
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

    const { category, title, description, lat, lng } = fields;
    if (!category || !title || !description || !lat || !lng) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    const reportId = createId();
    let photoUrl: string | undefined;
    if (photoBuffer) {
      photoUrl = await uploadReportPhoto(photoBuffer, reportId);
    }

    const report = await app.prisma.report.create({
      data: {
        id: reportId,
        authorId: userId,
        category: category as ReportCategory,
        title: title.slice(0, 120),
        description: description.slice(0, 1000),
        photoUrl,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
      include: reportInclude(userId),
    });

    const dto = toReportDTO(report);

    // Broadcast the same DTO to WebSocket subscribers via Redis pub/sub.
    await redis.publish(REDIS_CHANNELS.REPORTS_NEW, JSON.stringify(dto));

    // Fan out to nearby neighbors (notification rows + push). Fire-and-forget so
    // a slow push round-trip never delays the author's create response.
    void fanOutNewReport(report).catch((err) =>
      app.log.error({ err }, 'new-report fan-out failed'),
    );

    return reply.status(201).send(dto);
  });

  // GET /reports/mine
  app.get('/mine', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const reports = await app.prisma.report.findMany({
      where: { authorId: userId },
      include: reportInclude(userId),
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return reply.send(reports.map((r) => toReportDTO(r)));
  });

  // GET /reports/:id
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    let requestingUserId: string | undefined;
    try {
      await request.jwtVerify();
      requestingUserId = (request.user as { sub: string }).sub;
    } catch {}

    const report = await app.prisma.report.findUnique({
      where: { id },
      include: reportInclude(requestingUserId),
    });

    if (!report) return reply.status(404).send({ error: 'Report not found' });

    return reply.send(toReportDTO(report));
  });

  // DELETE /reports/:id
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const { id } = request.params as { id: string };

    const report = await app.prisma.report.findUnique({ where: { id } });
    if (!report) return reply.status(404).send({ error: 'Report not found' });
    if (report.authorId !== userId) return reply.status(403).send({ error: 'Forbidden' });

    await app.prisma.report.update({ where: { id }, data: { status: 'REMOVED' } });
    return reply.status(204).send();
  });
}
