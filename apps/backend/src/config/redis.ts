import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, { lazyConnect: true });
export const redisSub = new Redis(env.REDIS_URL, { lazyConnect: true });

export const REDIS_CHANNELS = {
  REPORTS_NEW: 'reports:new',
  REPORTS_VOTED: 'reports:voted',
  REPORTS_ARCHIVED: 'reports:archived',
} as const;
