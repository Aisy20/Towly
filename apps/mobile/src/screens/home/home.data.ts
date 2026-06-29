/**
 * Pure windowing / sorting / summary logic for the Home screen. Both the native
 * map and the web list derive their pins, list rows, and Pulse stats from these
 * functions over the normalized report store, so the two stay consistent.
 */
import { formatDistanceToNow } from 'date-fns';
import type { Report, ReportCategory } from '@townly/shared';
import { ACCURATE_REPORT_NET_SCORE_THRESHOLD } from '@townly/shared';
import { haversineMeters, type LatLng } from '../../lib/geo';

export type SortMode = 'priority' | 'distance' | 'newest' | 'help';

export const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'priority', label: 'Priority' },
  { key: 'distance', label: 'Distance' },
  { key: 'newest', label: 'Newest' },
  { key: 'help', label: 'Needs help' },
];

const HOUR_MS = 60 * 60 * 1000;

/** Lower number = surfaced earlier under the "Priority" sort. */
const CATEGORY_PRIORITY: Record<ReportCategory, number> = {
  SAFETY: 0,
  INFRASTRUCTURE: 1,
  HELP: 2,
  ANIMALS: 3,
  COMMUNITY: 4,
};

export function isLive(report: Report): boolean {
  return (
    report.status === 'ACTIVE' &&
    Date.now() - new Date(report.createdAt).getTime() < HOUR_MS
  );
}

export function isConfirmed(report: Report): boolean {
  return report.netScore >= ACCURATE_REPORT_NET_SCORE_THRESHOLD;
}

export interface WindowOptions {
  categories: ReportCategory[] | null; // null = all
  center: LatLng | null;
  radiusMeters: number;
}

/**
 * All reports inside the current geo-window (radius + category), regardless of
 * status. Distance is only applied when we know the user's location.
 */
export function selectWindow(
  byId: Record<string, Report>,
  { categories, center, radiusMeters }: WindowOptions,
): Report[] {
  return Object.values(byId).filter((r) => {
    if (categories && !categories.includes(r.category)) return false;
    if (center) {
      const d = haversineMeters(center, { lat: r.latitude, lng: r.longitude });
      if (d > radiusMeters) return false;
    }
    return true;
  });
}

/** Visible reports for the map pins / list — the active subset of the window. */
export function selectVisible(
  byId: Record<string, Report>,
  opts: WindowOptions,
): Report[] {
  return selectWindow(byId, opts).filter((r) => r.status === 'ACTIVE');
}

export function distanceMeters(report: Report, center: LatLng | null): number | null {
  if (!center) return null;
  return haversineMeters(center, { lat: report.latitude, lng: report.longitude });
}

function priorityScore(report: Report): number {
  // Category weight, then unconfirmed-and-live boost, then recency.
  const cat = CATEGORY_PRIORITY[report.category] * 1000;
  const attention = isLive(report) && !isConfirmed(report) ? -500 : 0;
  const ageHours = (Date.now() - new Date(report.createdAt).getTime()) / HOUR_MS;
  return cat + attention + Math.min(ageHours, 48);
}

export function sortReports(
  reports: Report[],
  mode: SortMode,
  center: LatLng | null,
): Report[] {
  const list = [...reports];
  switch (mode) {
    case 'distance':
      if (!center) return sortReports(list, 'newest', center);
      return list.sort(
        (a, b) =>
          haversineMeters(center, { lat: a.latitude, lng: a.longitude }) -
          haversineMeters(center, { lat: b.latitude, lng: b.longitude }),
      );
    case 'newest':
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'help':
      return list.sort((a, b) => {
        const aHelp = a.category === 'HELP' ? 0 : 1;
        const bHelp = b.category === 'HELP' ? 0 : 1;
        if (aHelp !== bHelp) return aHelp - bHelp;
        return (b.helpOffersCount ?? 0) - (a.helpOffersCount ?? 0);
      });
    case 'priority':
    default:
      return list.sort((a, b) => priorityScore(a) - priorityScore(b));
  }
}

export interface PulseStats {
  needAttention: number;
  confirmed: number;
  resolved: number;
}

/** Pulse tiles over the full window (any status). Calm, non-alarmist counts. */
export function derivePulse(windowReports: Report[]): PulseStats {
  let needAttention = 0;
  let confirmed = 0;
  let resolved = 0;
  for (const r of windowReports) {
    if (r.status !== 'ACTIVE') {
      resolved++;
    } else if (isConfirmed(r)) {
      confirmed++;
    } else if (isLive(r)) {
      needAttention++;
    }
  }
  return { needAttention, confirmed, resolved };
}

export function reportStatus(report: Report): 'live' | 'resolved' | 'active' {
  if (report.status !== 'ACTIVE') return 'resolved';
  if (isLive(report)) return 'live';
  return 'active';
}

/** Calm, non-alarmist summary sentence for the Pulse card. */
export function pulseSummary(s: PulseStats): string {
  const total = s.needAttention + s.confirmed + s.resolved;
  if (total === 0) {
    return "It's quiet on your block right now — nothing needs your attention.";
  }
  const parts: string[] = [];
  if (s.confirmed) parts.push(`${s.confirmed} confirmed by neighbors`);
  if (s.needAttention) parts.push(`${s.needAttention} still settling in`);
  if (s.resolved) parts.push(`${s.resolved} resolved`);
  return `A calm view of your block — ${parts.join(', ')}.`;
}

/** "updated 4 min ago" from the freshest report in view; undefined if empty. */
export function lastUpdatedLabel(reports: Report[]): string | undefined {
  if (reports.length === 0) return undefined;
  const newest = reports.reduce((a, b) =>
    new Date(a.createdAt).getTime() >= new Date(b.createdAt).getTime() ? a : b,
  );
  return `updated ${formatDistanceToNow(new Date(newest.createdAt))} ago`;
}
