import React from 'react';
import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, fontFamily, fontSize, hitSlop } from '@/theme';
import { Text } from './Text';

/**
 * Pill showing the active location. Static when read-only; when given `onPress`
 * it becomes a 44px-target button with a trailing chevron affordance. Its
 * visual height stays below 44 and is padded out to target via `hitSlop`.
 */
export interface LocationChipProps {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function LocationChip({ label, onPress, icon = 'location', style }: LocationChipProps) {
  const content = (
    <>
      <Ionicons name={icon} size={14} color={colors.brand} style={styles.leading} />
      <Text style={styles.label}>{label}</Text>
      {onPress ? (
        <Ionicons name="chevron-down" size={14} color={colors.textMuted} style={styles.trailing} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={hitSlop}
        style={({ pressed }) => [styles.pill, { opacity: pressed ? 0.85 : 1 }, style]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.pill, style]} accessibilityRole="text">
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
  },
  leading: { marginRight: spacing.xs },
  trailing: { marginLeft: spacing.xs },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
});
