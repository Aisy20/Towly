import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { CATEGORY_META, type ReportCategory } from '@townly/shared';
import { colors, categoryColor, radii, spacing, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';

/**
 * Square-ish category tile for grid pickers. A large emoji over a small label,
 * with the category color used for the selected border and label tint.
 */
export interface CategoryGridItemProps {
  category: ReportCategory;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CategoryGridItem({ category, selected, onPress, style }: CategoryGridItemProps) {
  const meta = CATEGORY_META[category];
  const accent = categoryColor[category];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={meta.label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.tile,
        {
          borderWidth: selected ? 2 : 1.5,
          borderColor: selected ? accent : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={styles.emoji}>{meta.emoji}</Text>
      <Text style={[styles.label, { color: selected ? accent : colors.textMuted }]}>
        {meta.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.controlLarge,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  emoji: { fontSize: 22 },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.labelSm,
    marginTop: 2,
    textAlign: 'center',
  },
});
