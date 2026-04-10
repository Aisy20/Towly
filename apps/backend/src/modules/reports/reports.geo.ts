import { prisma } from '../../config/database';
import { ReportCategory, ReportStatus } from '@townly/shared';
import { MAX_RADIUS_METERS } from '@townly/shared';

export interface GetReportsNearbyParams {
  lat: number;
  lng: number;
  radiusMeters: number;
  categories?: ReportCategory[];
  cursor?: string;
  limit?: number;
  requestingUserId?: string;
}

/**
 * Fetches active reports within a radius using PostGIS ST_DWithin.
 * The GIST index on the computed geography expression makes this efficient.
 */
export async function getReportsNearby(params: GetReportsNearbyParams) {
  const {
    lat,
    lng,
    radiusMeters,
    categories,
    cursor,
    limit = 50,
    requestingUserId,
  } = params;

  const safeRadius = Math.min(Math.max(radiusMeters, 1), MAX_RADIUS_METERS);

  // Raw SQL for the geospatial query — Prisma ORM cannot express ST_DWithin
  const categoryFilter =
    categories && categories.length > 0
      ? `AND category = ANY(ARRAY[${categories.map((c) => `'${c}'`).join(',')}]::\"ReportCategory\"[])`
      : '';

  const cursorFilter = cursor ? `AND r."createdAt" < (SELECT "createdAt" FROM "Report" WHERE id = '${cursor}')` : '';

  const rows: Array<{
    id: string;
    distance_m: number;
  }> = await prisma.$queryRawUnsafe(`
    SELECT r.id,
      ST_Distance(
        ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) AS distance_m
    FROM "Report" r
    WHERE r.status = 'ACTIVE'
      AND r."createdAt" > NOW() - INTERVAL '48 hours'
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
      ${categoryFilter}
      ${cursorFilter}
    ORDER BY r."createdAt" DESC
    LIMIT $4
  `, lng, lat, safeRadius, limit + 1);

  const hasMore = rows.length > limit;
  const ids = rows.slice(0, limit).map((r) => r.id);
  const distanceMap = new Map(rows.map((r) => [r.id, Math.round(r.distance_m)]));

  const reports = await prisma.report.findMany({
    where: { id: { in: ids } },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true, credibilityScore: true } },
      votes: requestingUserId
        ? { where: { userId: requestingUserId }, select: { value: true } }
        : false,
      _count: { select: { helpOffers: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const enriched = reports.map((r) => ({
    ...r,
    distanceMeters: distanceMap.get(r.id) ?? 0,
    userVote: requestingUserId && r.votes?.length ? r.votes[0].value : null,
    helpOffersCount: r._count.helpOffers,
    votes: undefined,
    _count: undefined,
  }));

  return {
    reports: enriched,
    nextCursor: hasMore ? ids[ids.length - 1] : null,
  };
}

/**
 * Finds all users whose notifyRadius covers a given point,
 * excluding the report author. Used for push notification fan-out.
 */
export async function getUsersNearPoint(
  lat: number,
  lng: number,
  excludeUserId: string,
): Promise<Array<{ id: string; expoPushToken: string | null }>> {
  // Join user notifyRadius against the report location
  return prisma.$queryRawUnsafe<Array<{ id: string; expoPushToken: string | null }>>(
    `
    SELECT u.id, u."expoPushToken"
    FROM "User" u
    WHERE u.id != $3
      AND u."expoPushToken" IS NOT NULL
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        u."notifyRadius"
      )
    `,
    lat,
    lng,
    excludeUserId,
  );
}
