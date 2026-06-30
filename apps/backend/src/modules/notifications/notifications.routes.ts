import { FastifyInstance } from 'fastify';
import { listNotifications, markRead, unreadCount } from './notifications.service';

const markReadSchema = {
  body: {
    type: 'object',
    required: ['ids'],
    additionalProperties: false,
    properties: {
      ids: { type: 'array', items: { type: 'string' }, maxItems: 200 },
    },
  },
} as const;

export async function notificationRoutes(app: FastifyInstance) {
  // GET /notifications — the signed-in user's recent notifications
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const notifications = await listNotifications(userId);
    return reply.send({ notifications });
  });

  // GET /notifications/unread-count
  app.get('/unread-count', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    return reply.send({ count: await unreadCount(userId) });
  });

  // PATCH /notifications/read — mark the given ids read (owner-scoped)
  app.patch('/read', { schema: markReadSchema, preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const { ids } = request.body as { ids: string[] };
    const updated = await markRead(userId, ids);
    return reply.send({ updated });
  });
}
