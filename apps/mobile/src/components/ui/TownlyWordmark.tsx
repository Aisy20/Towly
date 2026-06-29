import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fontFamily } from '@/theme';
import { Text } from './Text';
import { TownlyLogo } from './TownlyLogo';

/**
 * Horizontal Townly lockup — the Sprout app mark followed by the word "Townly".
 * Geometry scales off `height`; use this for headers and branded surfaces.
 * For the compact icon alone, use <TownlyLogo/>.
 */
export interface TownlyWordmarkProps {
  /** Lockup height in px (drives mark size and word scale). Default 28. */
  height?: number;
  /** 'ink' for light surfaces, 'onDark' for dark/brand surfaces. */
  tone?: 'ink' | 'onDark';
  style?: StyleProp<ViewStyle>;
}

export function TownlyWordmark({ height = 28, tone = 'ink', style }: TownlyWordmarkProps) {
  const wordColor = tone === 'onDark' ? colors.textOnBrand : colors.textPrimary;
  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="image"
      accessibilityLabel="Townly"
    >
      <TownlyLogo size={height} tone={tone === 'onDark' ? 'dark' : 'light'} accessibilityLabel="" />
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: fontFamily.semibold,
          fontSize: height * 0.86,
          letterSpacing: height * -0.04,
          marginLeft: height * 0.34,
          color: wordColor,
        }}
      >
        Townly
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
