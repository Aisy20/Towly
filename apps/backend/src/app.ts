import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyPlugin from 'fastify-plugin';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { env } from './config/env';
import authPlugin from './plugins/auth.plugin';
import websocketPlugin from './plugins/websocket.plugin';
import { authRoutes } from './modules/auth/auth.routes';
import { reportRoutes } from './modules/reports/reports.routes';
import { votesRoutes } from './modules/votes/votes.routes';
import { helpRoutes } from './modules/help/help.routes';
import { evidenceRoutes } from './modules/evidence/evidence.routes';

export async function buildApp() {
  const app = Fastify({
    logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' },
  });

  // Plugins
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB max
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(authPlugin);
  await app.register(websocketPlugin);

  // Decorate with prisma for route handlers
  app.decorate('prisma', prisma);

  // Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(reportRoutes, { prefix: '/api/v1/reports' });
  await app.register(fastifyPlugin(async (instance) => {
    instance.register(votesRoutes, { prefix: '/api/v1/reports' });
    instance.register(helpRoutes, { prefix: '/api/v1/reports' });
    instance.register(evidenceRoutes, { prefix: '/api/v1/reports' });
  }));

  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}
