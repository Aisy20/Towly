import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env';

export default fp(async function authPlugin(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
  });

  app.decorate(
    'authenticate',
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    },
  );
});

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
