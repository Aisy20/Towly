import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, layout } from '@/theme';
import { Text } from './Text';
import { IconButton } from './IconButton';
import { TownlyWordmark } from './TownlyWordmark';

/**
 * Top-of-screen header. Pads for the safe-area top inset and lays out a left
 * zone (back button, custom node, wordmark, or title) against an optional right
 * zone. Branding wins when both `showWordmark` and `title` are supplied.
 */
export interface AppHeaderProps {
  title?: string;
  showWordmark?: boolean;
  onBack?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppHeader({ title, showWordmark, onBack, left, right, style }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  let leftZone: React.ReactNode = null;
  if (onBack) {
    leftZone = (
      <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={onBack} variant="surface" />
    );
  } else if (left) {
    leftZone = left;
  } else if (showWordmark) {
    leftZone = <TownlyWordmark />;
  } else if (title) {
    leftZone = <Text variant="displaySm">{title}</Text>;
  }

  return (
    <View
      accessibilityRole="header"
      style={[styles.container, { paddingTop: insets.top }, style]}
    >
      <View style={styles.row}>
        <View style={styles.leftZone}>{leftZone}</View>
        {right ? <View style={styles.rightZone}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.minTouchTarget,
  },
  leftZone: { flexShrink: 1, flexDirection: 'row', alignItems: 'center' },
  rightZone: { marginLeft: spacing.md, flexDirection: 'row', alignItems: 'center' },
});
