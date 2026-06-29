import React from 'react';
import {
  Pressable,
  View,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radii, spacing, layout, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';

/**
 * Primary action button. Exemplar for the library's stateful-pressable pattern:
 * strict variants, pressed/disabled/loading states, 44px min target, an
 * optional leading icon paired with the text label, and full a11y state.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface TownlyButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ionicons glyph rendered before the label. */
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const FILL: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.brand, fg: colors.onBrand, border: colors.brand },
  secondary: { bg: colors.surface, fg: colors.textPrimary, border: colors.border },
  ghost: { bg: palette.transparent, fg: colors.brand, border: palette.transparent },
  danger: { bg: palette.safety, fg: palette.white, border: palette.safety },
};

export function TownlyButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  style,
}: TownlyButtonProps) {
  const c = FILL[variant];
  const isDisabled = disabled || loading;
  const height = size === 'lg' ? 52 : layout.minTouchTarget;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          minHeight: layout.minTouchTarget,
          paddingHorizontal: size === 'lg' ? spacing.lg : spacing.md,
          backgroundColor: c.bg,
          borderColor: c.border,
          opacity: isDisabled ? 0.45 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={18} color={c.fg} style={styles.icon} /> : null}
          <Text style={{ color: c.fg, fontFamily: fontFamily.bold, fontSize: fontSize.bodyLg }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.controlLarge,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm },
});
