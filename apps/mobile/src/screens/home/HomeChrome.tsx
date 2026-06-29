import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LocationChip, PulseCard } from '@/components/ui';
import { palette, spacing, layout } from '@/theme';
import { CategoryFilterBar } from './CategoryFilterBar';
import type { PulseStats } from './home.data';

/**
 * The Home "chrome" beneath the header: location chip, Neighborhood Pulse card,
 * and the category filter strip. Shared by the native map screen and the web
 * list screen so both present the same summary above their report view.
 */
export interface HomeChromeProps {
  pulse: PulseStats;
  summary: string;
  updatedLabel?: string;
  locationLabel?: string;
  onLocationPress?: () => void;
}

export function HomeChrome({
  pulse,
  summary,
  updatedLabel,
  locationLabel = 'Fishtown',
  onLocationPress,
}: HomeChromeProps) {
  return (
    <View>
      <View style={styles.padded}>
        <LocationChip label={locationLabel} onPress={onLocationPress} />
        <PulseCard
          title={`${locationLabel} Pulse`}
          updatedLabel={updatedLabel}
          summary={summary}
          stats={[
            { value: pulse.needAttention, label: 'Need attention', valueColor: palette.safety },
            { value: pulse.confirmed, label: 'Confirmed', valueColor: palette.help },
            { value: pulse.resolved, label: 'Resolved' },
          ]}
          style={styles.pulse}
        />
      </View>
      <CategoryFilterBar />
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing.sm,
  },
  pulse: {
    marginTop: spacing.xs,
  },
});
