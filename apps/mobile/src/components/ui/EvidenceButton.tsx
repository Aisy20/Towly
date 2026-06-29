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
import { colors, radii, spacing, layout, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';

/**
 * Secondary action for attaching photo evidence to a report. Outlined neutral
 * surface with a camera glyph, an optional evidence count, and a loading state.
 */
export interface EvidenceButtonProps {
  onPress: () => void;
  count?: number;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EvidenceButton({
  onPress,
  count,
  loading = false,
  disabled = false,
  style,
}: EvidenceButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Add evidence"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        { opacity: isDisabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <View style={styles.row}>
          <Ionicons name="camera-outline" size={18} color={colors.textPrimary} style={styles.icon} />
          <Text style={styles.label}>Add evidence</Text>
          {count != null ? (
            <Text variant="bodyMuted" style={styles.count}>
              {count}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouchTarget,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.controlLarge,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyLg,
    color: colors.textPrimary,
  },
  count: {
    marginLeft: spacing.sm,
  },
});
