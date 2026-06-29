import React from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReportCategory } from '@townly/shared';
import { CategoryChip } from '@/components/ui';
import { spacing, layout } from '@/theme';
import { useMapStore } from '../../store/mapStore';

const CATEGORIES: ReportCategory[] = ['SAFETY', 'INFRASTRUCTURE', 'ANIMALS', 'COMMUNITY', 'HELP'];

/**
 * Horizontal category filter strip. Drives `mapStore.activeCategories`, which
 * both the map pins and the nearby list window against — so toggling a filter
 * updates both consistently. `null` active = all categories on.
 */
export function CategoryFilterBar({ style }: { style?: StyleProp<ViewStyle> }) {
  const activeCategories = useMapStore((s) => s.activeCategories);
  const toggleCategory = useMapStore((s) => s.toggleCategory);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.content}
      accessibilityLabel="Category filters"
    >
      {CATEGORIES.map((cat) => (
        <CategoryChip
          key={cat}
          category={cat}
          selected={activeCategories === null || activeCategories.includes(cat)}
          onPress={() => toggleCategory(cat)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xs,
  },
});
