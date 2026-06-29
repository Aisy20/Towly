import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing, fontFamily } from '@/theme';
import { Text } from './Text';

/**
 * Labeled progress row — a label/value header above a thin progress track.
 * `progress` is a 0..1 fraction and is clamped to that range.
 */
export interface ProgressMetricRowProps {
  label: string;
  valueLabel: string;
  progress: number;
  barColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ProgressMetricRow({
  label,
  valueLabel,
  progress,
  barColor = colors.brand,
  style,
}: ProgressMetricRowProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const percent = Math.round(clamped * 100);

  return (
    <View
      style={style}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{valueLabel}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: { fontFamily: fontFamily.medium },
  value: { fontFamily: fontFamily.bold },
  track: {
    height: 7,
    borderRadius: 5,
    backgroundColor: colors.surfaceSecondary,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 5 },
});
