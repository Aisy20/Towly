/**
 * Townly design tokens — production design system for the mobile app.
 *
 * Single source of truth for color, type, spacing, radii, and elevation.
 * Components must consume these tokens rather than hardcoding values.
 *
 * Import named tokens directly:
 *   import { colors, spacing, textVariants } from '@/theme';
 *
 * Or the aggregate object when you need the whole system in one binding:
 *   import { theme } from '@/theme';
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radii';
export * from './shadows';

import {
  palette,
  colors,
  categoryColor,
  categoryPalette,
} from './colors';
import {
  fontFamily,
  fontWeight,
  fontSize,
  letterSpacing,
  textVariants,
} from './typography';
import { spacing, layout, hitSlop } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';

export const theme = {
  palette,
  colors,
  categoryColor,
  categoryPalette,
  fontFamily,
  fontWeight,
  fontSize,
  letterSpacing,
  textVariants,
  spacing,
  layout,
  hitSlop,
  radii,
  shadows,
} as const;

export type Theme = typeof theme;
