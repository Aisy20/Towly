import { FastifyInstance } from 'fastify';
import { castVote, removeVote } from './votes.service';

export async function votesRoutes(app: FastifyInstance) {
  app.post(
    '/:reportId/vote',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = (request.user as { sub: string }).sub;
      const { reportId } = request.params as { reportId: string };
      const { value } = request.body as { value: 1 | -1 };

      if (value !== 1 && value !== -1) {
        return reply.status(400).send({ error: 'value must be 1 or -1' });
      }

      try {
        const result = await castVote(reportId, userId, value);
        return reply.send(result);
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    },
  );

  app.delete(
    '/:reportId/vote',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = (request.user as { sub: string }).sub;
      const { reportId } = request.params as { reportId: string };
      await removeVote(reportId, userId);
      return reply.status(204).send();
    },
  );
}
