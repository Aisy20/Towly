import React from 'react';
import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { CATEGORY_META, type ReportCategory } from '@townly/shared';
import { colors, categoryColor, radii, spacing, hitSlop, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';

/**
 * Selectable category filter pill. Pairs a category color dot with the
 * category emoji and label, so meaning never rests on color alone.
 */
export interface CategoryChipProps {
  category: ReportCategory;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CategoryChip({ category, selected, onPress, style }: CategoryChipProps) {
  const meta = CATEGORY_META[category];
  const accent = categoryColor[category];

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={`${meta.label} filter`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? accent : colors.border,
          opacity: pressed ? 0.85 : selected ? 1 : 0.7,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={styles.emoji}>{meta.emoji}</Text>
      <Text style={styles.label}>{meta.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  emoji: { fontSize: fontSize.bodyLg, marginRight: spacing.xs },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.label,
    color: colors.textPrimary,
  },
});
