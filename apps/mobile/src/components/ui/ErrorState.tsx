import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, spacing } from '@/theme';
import { Text } from './Text';
import { TownlyButton } from './TownlyButton';

/**
 * Full-bleed error block. Mirrors EmptyState/PermissionState — an alert icon, a
 * title, a muted supporting line, and an optional retry action — but signals a
 * failure rather than an empty result.
 */
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <Ionicons name="alert-circle" size={26} color={palette.safety} />
      </View>
      <Text variant="heading" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="bodyMuted" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <TownlyButton
          label={retryLabel}
          icon="refresh"
          onPress={onRetry}
          variant="primary"
          style={styles.action}
        />
      ) : null}
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
  message: { textAlign: 'center', maxWidth: 280 },
  action: { marginTop: spacing.sm },
});
