/**
 * Townly spacing & layout tokens — LOCKED design system.
 */

import type { Insets } from 'react-native';

/**
 * Spacing rhythm: 6, 8, 12, 16, 18.
 * Use these named steps instead of raw numbers so spacing stays consistent.
 */
export const spacing = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
} as const;

export type SpacingStep = keyof typeof spacing;

/**
 * Screen-level layout constants.
 *  - Horizontal screen padding: 16–18
 *  - Minimum touch target: 44×44
 */
export const layout = {
  screenPaddingH: 16,
  screenPaddingHWide: 18,
  minTouchTarget: 44,
} as const;

/**
 * Default hit slop for small interactive elements, expanding their touch area
 * toward the 44×44 minimum without changing visual size.
 */
export const hitSlop: Insets = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
} as const;
