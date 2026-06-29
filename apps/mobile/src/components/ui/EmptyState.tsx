import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';
import { TownlyButton } from './TownlyButton';

/**
 * Calm empty-state block. Exemplar for the library's full-bleed "state"
 * components (EmptyState / ErrorState / PermissionState) — an icon, a title, a
 * supporting line, and an optional single action, all centered and token-driven.
 */
export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ icon = 'leaf-outline', title, message, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="summary">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.textMuted} />
      </View>
      <Text variant="heading" style={styles.title}>{title}</Text>
      {message ? (
        <Text variant="bodyMuted" style={styles.message}>{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TownlyButton label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { textAlign: 'center', fontFamily: fontFamily.bold, fontSize: fontSize.heading },
  message: { textAlign: 'center', maxWidth: 280 },
  action: { marginTop: spacing.sm },
});
