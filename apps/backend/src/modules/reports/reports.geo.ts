import { prisma } from '../../config/database';
import { ReportCategory } from '@townly/shared';
import { MAX_RADIUS_METERS } from '@townly/shared';
import { reportInclude, toReportDTO } from './reports.serializer';

/** The only legal category literals — used to whitelist before interpolation. */
const ALLOWED_CATEGORIES: ReadonlySet<ReportCategory> = new Set([
  'SAFETY',
  'INFRASTRUCTURE',
  'ANIMALS',
  'COMMUNITY',
  'HELP',
]);

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

  // Raw SQL for the geospatial query — Prisma ORM cannot express ST_DWithin.
  // SAFETY: positional params ($1..$n) carry all user values. The only
  // interpolated fragment is the category list, and it is whitelisted to the
  // fixed enum literals below, so it cannot carry injected SQL.
  const safeCategories = (categories ?? []).filter((c) => ALLOWED_CATEGORIES.has(c));
  const categoryFilter =
    safeCategories.length > 0
      ? `AND r.category = ANY(ARRAY[${safeCategories.map((c) => `'${c}'`).join(',')}]::"ReportCategory"[])`
      : '';

  const args: unknown[] = [lng, lat, safeRadius];
  let nextParam = 4;
  let cursorFilter = '';
  if (cursor) {
    cursorFilter = `AND r."createdAt" < (SELECT "createdAt" FROM "Report" WHERE id = $${nextParam})`;
    args.push(cursor);
    nextParam++;
  }
  const limitParam = `$${nextParam}`;
  args.push(limit + 1);

  const rows: Array<{ id: string; distance_m: number }> = await prisma.$queryRawUnsafe(
    `
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
    LIMIT ${limitParam}
  `,
    ...args,
  );

  const hasMore = rows.length > limit;
  const ids = rows.slice(0, limit).map((r) => r.id);
  const distanceMap = new Map(rows.map((r) => [r.id, Math.round(r.distance_m)]));

  const reports = await prisma.report.findMany({
    where: { id: { in: ids } },
    include: reportInclude(requestingUserId),
    orderBy: { createdAt: 'desc' },
  });

  const enriched = reports.map((r) => toReportDTO(r, distanceMap.get(r.id) ?? 0));

  return {
    reports: enriched,
    nextCursor: hasMore ? ids[ids.length - 1] : null,
  };
}

/**
 * Finds users whose shared location is within their own notifyRadius of a given
 * report point, excluding the author. Used for "new nearby report" push fan-out.
 * Users who haven't shared a location (latitude/longitude null) are skipped.
 */
export async function getUsersNearPoint(
  lat: number,
  lng: number,
  excludeUserId: string,
): Promise<Array<{ id: string; expoPushToken: string | null }>> {
  return prisma.$queryRawUnsafe<Array<{ id: string; expoPushToken: string | null }>>(
    `
    SELECT u.id, u."expoPushToken"
    FROM "User" u
    WHERE u.id != $3
      AND u."expoPushToken" IS NOT NULL
      AND u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        u."notifyRadius"
      )
    `,
    lat,
    lng,
    excludeUserId,
  );
}
