import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, spacing, fontFamily } from '@/theme';
import { Text } from './Text';

/**
 * Full-width connectivity strip shown when the device is offline, signaling
 * that the visible reports are the latest cached copy.
 */
export interface OfflineBannerProps {
  visible?: boolean;
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export function OfflineBanner({
  visible = true,
  message = "You're offline — showing the latest saved reports",
  style,
}: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View style={[styles.strip, style]} accessibilityRole="alert">
      <Ionicons
        name="cloud-offline-outline"
        size={16}
        color={colors.textMuted}
        style={styles.icon}
      />
      <Text variant="bodyMuted" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
  },
  icon: { marginRight: spacing.sm },
  message: { fontFamily: fontFamily.medium },
});
