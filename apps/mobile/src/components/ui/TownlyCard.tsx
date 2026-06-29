import React from 'react';
import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing, layout, shadows } from '@/theme';

/**
 * Surface container for grouped content. Exemplar for the library's
 * card pattern: a bordered surface that can be a static View or — when given
 * `onPress` — a 44px-min pressable, with optional selection and elevation.
 */
export interface TownlyCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function TownlyCard({
  children,
  onPress,
  selected = false,
  padded = true,
  elevated = false,
  style,
  accessibilityLabel,
}: TownlyCardProps) {
  const base: ViewStyle = {
    ...styles.card,
    padding: padded ? spacing.lg : 0,
    borderColor: selected ? colors.brand : colors.border,
    borderWidth: selected ? 1.5 : 1,
    ...(elevated ? shadows.sm : null),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [base, styles.pressable, { opacity: pressed ? 0.9 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[base, style]} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
  },
  pressable: {
    minHeight: layout.minTouchTarget,
  },
});
