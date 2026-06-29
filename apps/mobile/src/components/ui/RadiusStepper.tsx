import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, layout, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';

/**
 * Stepper for adjusting a map/search radius. A minus and plus button flank a
 * center column showing the current value and a "RADIUS" label. Each button is
 * a 44px-min target and can be independently disabled.
 */
export interface RadiusStepperProps {
  valueLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
  canDecrement?: boolean;
  canIncrement?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function RadiusStepper({
  valueLabel,
  onDecrement,
  onIncrement,
  canDecrement = true,
  canIncrement = true,
  style,
}: RadiusStepperProps) {
  return (
    <View style={[styles.row, style]}>
      <Pressable
        onPress={onDecrement}
        disabled={!canDecrement}
        accessibilityRole="button"
        accessibilityLabel="Decrease radius"
        accessibilityState={{ disabled: !canDecrement }}
        style={({ pressed }) => [
          styles.button,
          styles.minus,
          { opacity: !canDecrement ? 0.4 : pressed ? 0.85 : 1 },
        ]}
      >
        <Ionicons name="remove" size={20} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.value}>{valueLabel}</Text>
        <Text variant="label">RADIUS</Text>
      </View>

      <Pressable
        onPress={onIncrement}
        disabled={!canIncrement}
        accessibilityRole="button"
        accessibilityLabel="Increase radius"
        accessibilityState={{ disabled: !canIncrement }}
        style={({ pressed }) => [
          styles.button,
          styles.plus,
          { opacity: !canIncrement ? 0.4 : pressed ? 0.85 : 1 },
        ]}
      >
        <Ionicons name="add" size={20} color={colors.onBrand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.controlLarge,
    padding: spacing.xs,
  },
  button: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: {
    backgroundColor: colors.surfaceSecondary,
  },
  plus: {
    backgroundColor: colors.brand,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyLg,
    color: colors.textPrimary,
  },
});
