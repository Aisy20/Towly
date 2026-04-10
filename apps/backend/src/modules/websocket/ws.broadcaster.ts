import { redisSub, REDIS_CHANNELS } from '../../config/redis';
import { connections, send } from './ws.handler';
import { distanceMeters } from '../../lib/haversine';
import { Report, WsServerMessage } from '@townly/shared';

/**
 * Subscribes to Redis pub/sub channels and fans out to relevant WebSocket connections.
 * Runs once at server startup.
 */
export async function startBroadcaster(): Promise<void> {
  await redisSub.connect();

  await redisSub.subscribe(
    REDIS_CHANNELS.REPORTS_NEW,
    REDIS_CHANNELS.REPORTS_VOTED,
    REDIS_CHANNELS.REPORTS_ARCHIVED,
  );

  redisSub.on('message', (channel: string, message: string) => {
    try {
      const payload = JSON.parse(message);
      switch (channel) {
        case REDIS_CHANNELS.REPORTS_NEW:
          broadcastNewReport(payload as Report);
          break;
        case REDIS_CHANNELS.REPORTS_VOTED:
          broadcastVoteUpdate(payload);
          break;
        case REDIS_CHANNELS.REPORTS_ARCHIVED:
          broadcastArchived(payload);
          break;
      }
    } catch (err) {
      console.error('[broadcaster] failed to process message:', err);
    }
  });

  console.log('[broadcaster] Redis pub/sub subscriptions active');
}

function broadcastNewReport(report: Report): void {
  const msg: WsServerMessage = { type: 'REPORT_CREATED', payload: report };
  for (const [id, conn] of connections) {
    const dist = distanceMeters(conn.lat, conn.lng, report.latitude, report.longitude);
    if (dist <= conn.radiusMeters) {
      send(id, msg);
    }
  }
}

function broadcastVoteUpdate(payload: {
  reportId: string;
  netScore: number;
  upvotes: number;
  downvotes: number;
}): void {
  const msg: WsServerMessage = { type: 'REPORT_VOTE_UPDATED', payload };
  for (const [id] of connections) {
    send(id, msg);
  }
}

function broadcastArchived(payload: { reportId: string }): void {
  const msg: WsServerMessage = { type: 'REPORT_ARCHIVED', payload };
  for (const [id] of connections) {
    send(id, msg);
  }
}
