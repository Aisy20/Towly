import type { Report } from '@townly/shared';

/**
 * Canonical Prisma `include` for serializing a report to the `@townly/shared`
 * `Report` DTO. Pass the requesting user's id to resolve `userVote`.
 */
export function reportInclude(requestingUserId?: string) {
  return {
    author: { select: { id: true, username: true, avatarUrl: true, credibilityScore: true } },
    votes: requestingUserId
      ? ({ where: { userId: requestingUserId }, select: { value: true } } as const)
      : (false as const),
    _count: { select: { helpOffers: true, evidence: true } },
  };
}

/**
 * Maps a Prisma report row (loaded with `reportInclude`) to the exact shape the
 * mobile client expects. The single place report responses are shaped, so every
 * endpoint — list, detail, create, mine, and the WS broadcast — stays in sync
 * with `@townly/shared` `Report` (flattened counts, resolved `userVote`, ISO
 * dates). `distanceMeters` is added only by the nearby feed.
 */
export function toReportDTO(
  row: any,
  distanceMeters?: number,
): Report & { distanceMeters?: number } {
  const userVote = row.votes && row.votes.length > 0 ? (row.votes[0].value as 1 | -1) : null;
  const dto: Report & { distanceMeters?: number } = {
    id: row.id,
    authorId: row.authorId,
    author: {
      id: row.author.id,
      username: row.author.username,
      avatarUrl: row.author.avatarUrl ?? null,
      credibilityScore: row.author.credibilityScore,
    },
    category: row.category,
    title: row.title,
    description: row.description,
    photoUrl: row.photoUrl ?? null,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address ?? null,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    netScore: row.netScore,
    status: row.status,
    createdAt: toISO(row.createdAt),
    archivedAt: row.archivedAt ? toISO(row.archivedAt) : null,
    userVote,
    helpOffersCount: row._count?.helpOffers ?? 0,
    evidenceCount: row._count?.evidence ?? 0,
  };
  if (distanceMeters != null) dto.distanceMeters = distanceMeters;
  return dto;
}

function toISO(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}
