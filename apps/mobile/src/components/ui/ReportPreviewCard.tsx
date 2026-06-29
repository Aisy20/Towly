import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { spacing } from '@/theme';
import { CATEGORY_META, type ReportCategory } from '@townly/shared';
import { Text } from './Text';
import { TownlyCard } from './TownlyCard';
import { StatusPill, type PillTone } from './StatusPill';

/**
 * Compact preview of a report for lists and map callouts. Leads with a category
 * pill (color + label) and an optional live/resolved status pill, then the
 * title and a muted meta line (distance · time · confirmations).
 */
export interface ReportPreviewCardProps {
  category: ReportCategory;
  title: string;
  distanceLabel?: string;
  timeLabel?: string;
  confirmedCount?: number;
  status?: 'live' | 'resolved' | 'active';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const CATEGORY_TONE: Record<ReportCategory, PillTone> = {
  SAFETY: 'safety',
  INFRASTRUCTURE: 'infrastructure',
  ANIMALS: 'animals',
  COMMUNITY: 'community',
  HELP: 'help',
};

export function ReportPreviewCard({
  category,
  title,
  distanceLabel,
  timeLabel,
  confirmedCount,
  status = 'active',
  onPress,
  style,
}: ReportPreviewCardProps) {
  const meta = [
    distanceLabel,
    timeLabel,
    confirmedCount != null ? `${confirmedCount} confirmed` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <TownlyCard onPress={onPress} style={style}>
      <View style={styles.topRow}>
        <StatusPill label={CATEGORY_META[category].label} dot tone={CATEGORY_TONE[category]} />
        {status === 'live' ? (
          <StatusPill label="Live" tone="safety" icon="radio" style={styles.statusPill} />
        ) : status === 'resolved' ? (
          <StatusPill label="Resolved" tone="help" icon="checkmark-circle" style={styles.statusPill} />
        ) : null}
      </View>

      <Text variant="bodyLgMedium" style={styles.title}>
        {title}
      </Text>

      {meta ? (
        <Text variant="bodyMuted" style={styles.meta}>
          {meta}
        </Text>
      ) : null}
    </TownlyCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    marginLeft: 'auto',
  },
  title: {
    marginTop: spacing.xs,
  },
  meta: {
    marginTop: spacing.xs,
  },
});
