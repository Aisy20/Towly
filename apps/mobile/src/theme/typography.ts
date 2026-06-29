/**
 * Townly typography tokens — LOCKED design system.
 *
 * Typeface: Space Grotesk.
 *
 * The font is loaded at app startup in App.tsx via
 * `@expo-google-fonts/space-grotesk`; the `fontFamily` names below must stay in
 * sync with the weights loaded there. `fontWeight` is kept on each variant as a
 * harmless system-font fallback (e.g. if font loading errors).
 */

import type { TextStyle } from 'react-native';
import { colors } from './colors';

/** Weight-specific font family names (resolved once Space Grotesk is loaded). */
export const fontFamily = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
} as const;

/** Numeric weights, typed to React Native's accepted `fontWeight` values. */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const satisfies Record<string, TextStyle['fontWeight']>;

/**
 * Font sizes from the locked scale:
 *  - Display: 26–40
 *  - Section heading: 18
 *  - Body: 13–14
 *  - Label: 10–11
 */
export const fontSize = {
  displayLg: 40,
  displayMd: 32,
  displaySm: 26,
  heading: 18,
  bodyLg: 14,
  body: 13,
  label: 11,
  labelSm: 10,
} as const;

export const letterSpacing = {
  tight: -0.4,
  normal: 0,
  /** Increased tracking for uppercase labels. */
  label: 0.8,
} as const;

/**
 * Named text variants — compose these into `StyleSheet.create` styles rather
 * than re-specifying size/weight/family at each call site.
 */
export const textVariants = {
  displayLg: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.displayLg,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight,
    color: colors.textPrimary,
  },
  displayMd: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.displayMd,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight,
    color: colors.textPrimary,
  },
  displaySm: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.displaySm,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.heading,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
  },
  bodyLgMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
  },
  bodyMuted: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.label,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
