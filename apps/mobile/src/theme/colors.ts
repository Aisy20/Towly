/**
 * Townly color tokens — LOCKED design system.
 *
 * These are the single source of truth for color in the production mobile app.
 * Do not introduce ad-hoc hex values in screens or components; reference these
 * tokens (or the semantic `colors` roles below) instead.
 *
 * Townly is a calm neighborhood utility — the palette is intentionally muted,
 * with category color always paired with an icon and label (never color alone).
 */

import type { ReportCategory } from '@townly/shared';

/**
 * Raw palette — every locked value, named literally. Prefer the semantic
 * `colors` roles below in UI code; reach into `palette` only when a role does
 * not yet exist.
 */
export const palette = {
  // Brand — Slate
  slate: '#3C4D59',
  slateShade: '#232E36',
  slateSoft: '#ECEEF1',
  onSlate: '#FFFFFF',

  // Neutrals
  background: '#F6F7F8',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF1F3',
  ink: '#1B252C',
  inkMuted: '#66727A',
  border: '#E3E7EA',

  // Semantic category colors (design-system names)
  safety: '#D95C4F',
  infrastructure: '#E79C43',
  animals: '#8A6FD1',
  community: '#5CA9D6',
  help: '#5FA82E',

  // Map
  mapGround: '#E7EAE7',
  mapBlocks: '#F4F6F4',
  mapWater: '#D8E6EE',
  mapPark: '#DDEFE0',
  userLocation: '#2E73C9',

  // Utility
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export type PaletteColor = keyof typeof palette;

/**
 * Semantic color roles — what most UI code should consume. Roles decouple
 * components from raw palette names so a future re-skin touches one file.
 */
export const colors = {
  brand: palette.slate,
  brandShade: palette.slateShade,
  brandSoft: palette.slateSoft,
  onBrand: palette.onSlate,

  background: palette.background,
  surface: palette.surface,
  surfaceSecondary: palette.surfaceSecondary,
  border: palette.border,

  textPrimary: palette.ink,
  textMuted: palette.inkMuted,
  textOnBrand: palette.onSlate,

  map: {
    ground: palette.mapGround,
    blocks: palette.mapBlocks,
    water: palette.mapWater,
    park: palette.mapPark,
    userLocation: palette.userLocation,
  },
} as const;

/**
 * Category palette keyed by the design-system category names.
 * The product surfaces five categories: Safety, Infrastructure, Animals,
 * Community, and Help.
 */
export const categoryPalette = {
  safety: palette.safety,
  infrastructure: palette.infrastructure,
  animals: palette.animals,
  community: palette.community,
  help: palette.help,
} as const;

export type CategoryName = keyof typeof categoryPalette;

/**
 * Category color mapped to the canonical `ReportCategory` enum from
 * `@townly/shared`, so callers stay type-safe against the real domain model.
 * The enum keys mirror the design-system category names one-to-one.
 */
export const categoryColor: Record<ReportCategory, string> = {
  SAFETY: palette.safety,
  INFRASTRUCTURE: palette.infrastructure,
  ANIMALS: palette.animals,
  COMMUNITY: palette.community,
  HELP: palette.help,
};
