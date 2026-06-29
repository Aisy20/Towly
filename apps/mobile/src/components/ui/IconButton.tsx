import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radii, hitSlop } from '@/theme';

/**
 * Compact icon-only control. Exemplar for the library's small-target pressable
 * pattern: a sub-44px visual square whose touch area is expanded to 44×44 via
 * `hitSlop`, with strict variants and full a11y state.
 */
export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accessibilityLabel: string;
  variant?: 'surface' | 'brand' | 'ghost';
  /** Visual square size in px. Default 38; touch target stays ≥44. */
  size?: number;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANT: Record<
  NonNullable<IconButtonProps['variant']>,
  { bg: string; border: string; icon: string }
> = {
  surface: { bg: colors.surface, border: colors.border, icon: colors.textPrimary },
  brand: { bg: colors.brand, border: colors.brand, icon: colors.onBrand },
  ghost: { bg: palette.transparent, border: palette.transparent, icon: colors.textMuted },
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = 38,
  selected = false,
  disabled = false,
  style,
}: IconButtonProps) {
  const v = VARIANT[variant];
  const bg = selected ? colors.brand : v.bg;
  const border = selected ? colors.brand : v.border;
  const iconColor = selected ? colors.onBrand : v.icon;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
