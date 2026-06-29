import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme';
import { Text } from './Text';
import { StatusPill } from './StatusPill';

/**
 * "Your Standing" card — a calm summary of the user's credibility tier with a
 * progress track toward the next tier. `progress` is a 0..1 fraction, clamped.
 */
export interface StandingCardProps {
  tierLabel: string;
  headline?: string;
  progress: number;
  caption?: string;
  trendLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function StandingCard({
  tierLabel,
  headline = 'Trusted',
  progress,
  caption,
  trendLabel,
  style,
}: StandingCardProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text variant="label">YOUR STANDING</Text>
        {trendLabel ? (
          <StatusPill label={trendLabel} tone="help" icon="trending-up" style={styles.pill} />
        ) : null}
      </View>

      <View style={styles.headlineRow}>
        <Text variant="displaySm">{headline}</Text>
        <Text variant="bodyMuted" style={styles.tier}>
          {tierLabel}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
      </View>

      {caption ? (
        <Text variant="bodyMuted" style={styles.caption}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.large,
    padding: spacing.lg,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  pill: { marginLeft: 'auto' },
  headlineRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs },
  tier: { marginLeft: spacing.sm },
  track: {
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.surfaceSecondary,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  fill: { height: '100%', borderRadius: 5, backgroundColor: colors.brand },
  caption: { marginTop: spacing.sm },
});
