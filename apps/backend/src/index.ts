import { buildApp } from './app';
import { env } from './config/env';
import { redis, redisSub } from './config/redis';
import { prisma } from './config/database';
import { startBroadcaster } from './modules/websocket/ws.broadcaster';
import { startArchiveJob } from './jobs/archiveReports.job';

async function main() {
  const app = await buildApp();

  // Connect infrastructure
  await redis.connect();
  await prisma.$connect();
  console.log('[db] PostgreSQL connected');

  // Start real-time broadcaster and archive cron
  await startBroadcaster();
  startArchiveJob();

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  console.log(`[server] Listening on port ${env.PORT}`);
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
