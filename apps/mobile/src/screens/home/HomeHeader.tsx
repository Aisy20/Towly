import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppHeader, IconButton, Text, TownlyLogo } from '@/components/ui';
import { colors, palette, spacing, fontFamily, hitSlop } from '@/theme';

/**
 * Townly Home header: a 30×30 sprout tile + the "Townly" wordmark on the left,
 * a 38×38 search button and a 38×38 Slate avatar (white initial) on the right.
 */
export interface HomeHeaderProps {
  initial: string;
  onSearch?: () => void;
  onAvatar?: () => void;
}

export function HomeHeader({ initial, onSearch, onAvatar }: HomeHeaderProps) {
  return (
    <AppHeader
      left={
        <View style={styles.brand}>
          <TownlyLogo size={30} accessibilityLabel="Townly" />
          <Text style={styles.wordmark} accessibilityRole="header">
            Townly
          </Text>
        </View>
      }
      right={
        <View style={styles.actions}>
          <IconButton icon="search" accessibilityLabel="Search reports" onPress={onSearch} size={38} />
          <Pressable
            onPress={onAvatar}
            hitSlop={hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            style={({ pressed }) => [styles.avatar, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmark: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.textPrimary,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: palette.white,
  },
});
