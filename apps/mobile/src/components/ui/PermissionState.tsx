import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Text } from './Text';
import { TownlyButton } from './TownlyButton';

/**
 * Full-bleed permission prompt. Mirrors EmptyState/ErrorState — an icon, a
 * title, a muted supporting line, and a single primary action that requests the
 * relevant OS permission (location, notifications, etc.).
 */
export interface PermissionStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function PermissionState({
  title,
  message,
  actionLabel,
  onAction,
  icon = 'lock-closed-outline',
  style,
}: PermissionStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="summary">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.textMuted} />
      </View>
      <Text variant="heading" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMuted" style={styles.message}>
        {message}
      </Text>
      <TownlyButton
        label={actionLabel}
        onPress={onAction}
        variant="primary"
        style={styles.action}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', maxWidth: 300 },
  action: { marginTop: spacing.sm },
});
