import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';

/**
 * Compact stat cell — a prominent value over a muted caption. Designed to flex
 * equally inside a row of tiles (e.g. the Neighborhood Pulse card).
 */
export interface StatTileProps {
  value: string | number;
  label: string;
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatTile({ value, label, valueColor = colors.textPrimary, style }: StatTileProps) {
  return (
    <View style={[styles.tile, style]} accessibilityRole="text">
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.control,
    padding: spacing.sm,
  },
  value: { fontFamily: fontFamily.bold, fontSize: 16 },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.labelSm,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
