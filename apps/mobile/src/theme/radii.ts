/**
 * Townly corner-radius tokens — LOCKED design system.
 *  - Controls: 12–14
 *  - Standard card: 14
 *  - Large: 16
 *  - Pills: 999
 */

export const radii = {
  control: 12,
  controlLarge: 14,
  card: 14,
  large: 16,
  pill: 999,
} as const;

export type Radius = keyof typeof radii;
