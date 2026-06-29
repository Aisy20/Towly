/**
 * Development-only sample reports. Used solely to make the Home screen visually
 * verifiable (and the Pulse stats meaningful) when no backend is running. Never
 * seeded in production — gated behind `__DEV__` by the caller.
 */
import type { Report, ReportCategory } from '@townly/shared';
import type { LatLng } from '../../lib/geo';

/** Fishtown, Philadelphia — matches the "Fishtown" location chip. */
export const DEFAULT_CENTER: LatLng = { lat: 39.9726, lng: -75.13 };

interface Seed {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  dLat: number;
  dLng: number;
  minutesAgo: number;
  netScore: number;
  status?: 'ACTIVE' | 'ARCHIVED';
  helpOffersCount?: number;
  evidenceCount?: number;
}

const SEEDS: Seed[] = [
  { id: 'seed-1', category: 'SAFETY', title: 'Tree down blocking Berks St', description: 'A large branch came down overnight and is blocking the eastbound lane. Easy to walk around.', dLat: 0.0012, dLng: -0.0009, minutesAgo: 22, netScore: 1, helpOffersCount: 1 },
  { id: 'seed-2', category: 'INFRASTRUCTURE', title: 'Streetlight out on Girard', description: 'The light near the corner has been dark for a couple nights.', dLat: -0.0016, dLng: 0.0014, minutesAgo: 95, netScore: 5, evidenceCount: 1 },
  { id: 'seed-3', category: 'ANIMALS', title: 'Found friendly dog near Palmer Park', description: 'Small brown dog, no collar, hanging around the park entrance. Seems calm.', dLat: 0.0008, dLng: 0.0019, minutesAgo: 40, netScore: 4, helpOffersCount: 2 },
  { id: 'seed-4', category: 'COMMUNITY', title: 'Free produce at the church, 3 PM', description: 'Weekly share is set up again this afternoon — bring a bag.', dLat: -0.0009, dLng: -0.0017, minutesAgo: 12, netScore: 7 },
  { id: 'seed-5', category: 'HELP', title: 'Neighbor needs a hand moving a couch', description: 'Looking for one more person for about 20 minutes this evening.', dLat: 0.0021, dLng: 0.0006, minutesAgo: 8, netScore: 0, helpOffersCount: 1 },
  { id: 'seed-6', category: 'INFRASTRUCTURE', title: 'Pothole near Frankford & Norris', description: 'Deepened after the rain — worth easing around on a bike.', dLat: -0.0024, dLng: 0.0008, minutesAgo: 180, netScore: 3 },
  { id: 'seed-7', category: 'COMMUNITY', title: 'Lost set of keys returned to cafe', description: 'Dropped them at the counter if they are yours.', dLat: 0.0004, dLng: -0.0022, minutesAgo: 320, netScore: 6, status: 'ARCHIVED' },
  { id: 'seed-8', category: 'ANIMALS', title: 'Cat reunited with owner on Thompson', description: 'The tabby from last night is home safe — thanks all.', dLat: -0.0006, dLng: 0.0011, minutesAgo: 600, netScore: 8, status: 'ARCHIVED' },
];

export function buildDevReports(center: LatLng = DEFAULT_CENTER): Report[] {
  const now = Date.now();
  return SEEDS.map((s) => {
    const createdAt = new Date(now - s.minutesAgo * 60 * 1000).toISOString();
    const upvotes = Math.max(s.netScore, 0) + 1;
    const downvotes = Math.max(upvotes - s.netScore, 0);
    return {
      id: s.id,
      authorId: `author-${s.id}`,
      author: {
        id: `author-${s.id}`,
        username: 'neighbor',
        avatarUrl: null,
        credibilityScore: 70,
      },
      category: s.category,
      title: s.title,
      description: s.description,
      photoUrl: null,
      latitude: center.lat + s.dLat,
      longitude: center.lng + s.dLng,
      address: null,
      upvotes,
      downvotes,
      netScore: s.netScore,
      status: s.status ?? 'ACTIVE',
      createdAt,
      archivedAt: s.status === 'ARCHIVED' ? createdAt : null,
      userVote: null,
      helpOffersCount: s.helpOffersCount ?? 0,
      evidenceCount: s.evidenceCount ?? 0,
    } satisfies Report;
  });
}
