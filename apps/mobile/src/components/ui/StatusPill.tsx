import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, colors, radii, spacing, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';

/**
 * Small status/label pill. Exemplar for the library's display-token pattern:
 * a semantic `tone` maps to a color, but meaning is never carried by color
 * alone — a `dot` and/or `icon` plus the text label always accompany it.
 */
export type PillTone =
  | 'neutral'
  | 'brand'
  | 'safety'
  | 'infrastructure'
  | 'animals'
  | 'community'
  | 'help'
  | 'warning';

const TONE: Record<PillTone, string> = {
  neutral: colors.textMuted,
  brand: palette.slate,
  safety: palette.safety,
  infrastructure: palette.infrastructure,
  animals: palette.animals,
  community: palette.community,
  help: palette.help,
  warning: palette.infrastructure,
};

export interface StatusPillProps {
  label: string;
  tone?: PillTone;
  /** Ionicons glyph shown before the label. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Show a colored status dot before the label. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StatusPill({ label, tone = 'neutral', icon, dot = false, style }: StatusPillProps) {
  const color = TONE[tone];
  return (
    <View style={[styles.pill, style]} accessibilityRole="text">
      {dot ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      {icon ? <Ionicons name={icon} size={12} color={color} style={styles.icon} /> : null}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  icon: { marginRight: spacing.xs },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.label,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
