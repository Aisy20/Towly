/**
 * Townly elevation tokens.
 *
 * Townly is a calm neighborhood utility, so shadows are soft and restrained —
 * used to lift surfaces (cards, the bottom sheet, the FAB) off the map, never
 * for decoration. Each token is a ready-to-spread React Native `ViewStyle`
 * covering both iOS (shadow*) and Android (elevation). The shadow color is the
 * primary ink so shadows read as a deepening of the surface, not pure black.
 */

import type { ViewStyle } from 'react-native';
import { palette } from './colors';

type Shadow = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const shadows = {
  /** No elevation — explicit reset. */
  none: {
    shadowColor: palette.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  /** Cards and chips resting just above the background. */
  sm: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  /** Floating controls and callouts (FAB, map callout card). */
  md: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  /** Modal surfaces — the report bottom sheet. */
  lg: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 12,
  },
} as const satisfies Record<string, Shadow>;

export type ShadowToken = keyof typeof shadows;
