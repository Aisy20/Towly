import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing, fontFamily } from '@/theme';
import { Text } from './Text';
import { TownlyCard } from './TownlyCard';
import { StatTile } from './StatTile';

/**
 * "Neighborhood Pulse" summary card — a titled, elevated card with a short
 * summary line above a row of equal-width stat tiles.
 */
export interface PulseStat {
  value: string | number;
  label: string;
  valueColor?: string;
}

export interface PulseCardProps {
  title?: string;
  updatedLabel?: string;
  summary: string;
  stats: PulseStat[];
  style?: StyleProp<ViewStyle>;
}

export function PulseCard({
  title = 'Neighborhood Pulse',
  updatedLabel,
  summary,
  stats,
  style,
}: PulseCardProps) {
  return (
    <TownlyCard elevated style={style}>
      <View style={styles.header}>
        <View style={styles.brandDot} />
        <Text style={styles.title}>{title}</Text>
        {updatedLabel ? (
          <Text variant="bodyMuted" style={styles.updated}>
            {updatedLabel}
          </Text>
        ) : null}
      </View>

      <Text variant="body" style={styles.summary}>
        {summary}
      </Text>

      <View style={styles.stats}>
        {stats.map((stat, index) => (
          <StatTile
            key={`${stat.label}-${index}`}
            value={stat.value}
            label={stat.label}
            valueColor={stat.valueColor}
          />
        ))}
      </View>
    </TownlyCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    marginRight: spacing.xs,
  },
  title: { fontFamily: fontFamily.bold },
  updated: { marginLeft: 'auto' },
  summary: { marginVertical: spacing.sm },
  stats: { flexDirection: 'row', gap: spacing.xs },
});
