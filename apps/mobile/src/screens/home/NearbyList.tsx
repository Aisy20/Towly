import React, { useMemo } from 'react';
import { View, Pressable, FlatList, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import type { Report } from '@townly/shared';
import { EmptyState, ReportPreviewCard, Text } from '@/components/ui';
import { colors, radii, spacing, layout, fontFamily, fontSize, hitSlop } from '@/theme';
import { useMapStore } from '../../store/mapStore';
import {
  SORT_OPTIONS,
  sortReports,
  reportStatus,
  isConfirmed,
  distanceMeters,
} from './home.data';
import { formatDistance, type LatLng } from '../../lib/geo';

export interface NearbyListProps {
  reports: Report[];
  center: LatLng | null;
  onSelectReport: (report: Report) => void;
  /** Optional node rendered above the sort bar (e.g. pulse + filters on web). */
  header?: React.ReactElement | null;
  emptyMessage?: string;
}

function SortBar() {
  const sortMode = useMapStore((s) => s.sortMode);
  const setSortMode = useMapStore((s) => s.setSortMode);
  return (
    <View style={styles.sortBar} accessibilityRole="tablist" accessibilityLabel="Sort nearby reports">
      {SORT_OPTIONS.map((opt) => {
        const selected = sortMode === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => setSortMode(opt.key)}
            hitSlop={hitSlop}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`Sort by ${opt.label}`}
            style={({ pressed }) => [
              styles.sortChip,
              selected ? styles.sortChipActive : null,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.sortText, selected ? styles.sortTextActive : null]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Accessible nearby-report list backed by the same normalized store as the map.
 * Rows are buttons; the sort bar is a tablist — screen readers get a full
 * equivalent of the map. Distance is shown as a coarse label, never coordinates.
 */
export function NearbyList({ reports, center, onSelectReport, header, emptyMessage }: NearbyListProps) {
  const sortMode = useMapStore((s) => s.sortMode);
  const sorted = useMemo(() => sortReports(reports, sortMode, center), [reports, sortMode, center]);

  return (
    <FlatList
      data={sorted}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          {header}
          <View style={styles.sortHeader}>
            <Text variant="label">{sorted.length} nearby</Text>
            <SortBar />
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="leaf-outline"
          title="Nothing nearby yet"
          message={emptyMessage ?? "When neighbors post reports in range, they'll show up here."}
        />
      }
      renderItem={({ item }) => {
        const dist = distanceMeters(item, center);
        return (
          <ReportPreviewCard
            category={item.category}
            title={item.title}
            distanceLabel={dist != null ? formatDistance(dist) : undefined}
            timeLabel={formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            confirmedCount={isConfirmed(item) ? item.upvotes : undefined}
            status={reportStatus(item)}
            onPress={() => onSelectReport(item)}
            style={styles.row}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.xl * 4,
  },
  sortHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sortBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sortChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  sortText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.label,
    color: colors.textMuted,
  },
  sortTextActive: {
    color: colors.onBrand,
  },
  row: {
    marginBottom: spacing.sm,
  },
});
