import { ReportCategory } from './types';

// Radius options in meters
export const RADIUS_OPTIONS = [
  { label: '500 ft', meters: 152 },
  { label: '¼ mi', meters: 402 },
  { label: '½ mi', meters: 804 },
  { label: '1 mi', meters: 1609 },
  { label: '2 mi', meters: 3218 },
] as const;

export const DEFAULT_RADIUS_METERS = 804;
export const MAX_RADIUS_METERS = 3218;
export const REPORT_ARCHIVE_HOURS = 48;

export const CATEGORY_META: Record<ReportCategory, { label: string; color: string; emoji: string }> = {
  SAFETY:         { label: 'Safety',         color: '#ef4444', emoji: '🔴' },
  INFRASTRUCTURE: { label: 'Infrastructure', color: '#f97316', emoji: '🟠' },
  ANIMALS:        { label: 'Animals',        color: '#a855f7', emoji: '🐾' },
  COMMUNITY:      { label: 'Community',      color: '#3b82f6', emoji: '📢' },
  POSITIVE:       { label: 'Positive',       color: '#22c55e', emoji: '💚' },
};

export const CREDIBILITY_TIERS = [
  { min: 80, label: 'Trusted Neighbor', color: '#22c55e' },
  { min: 60, label: 'Active Member',    color: '#3b82f6' },
  { min: 40, label: 'New Member',       color: '#94a3b8' },
  { min: 0,  label: 'Needs Improvement', color: '#f59e0b' },
] as const;

export const ACCURATE_REPORT_NET_SCORE_THRESHOLD = 3;
