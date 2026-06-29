import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radii, spacing, fontFamily } from '@/theme';
import { Text } from './Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Transient confirmation toast. Floats centered as a dark pill, slides + fades
 * in on mount, and announces itself politely to assistive tech. Honors reduce
 * motion by rendering the final resting state with no transition.
 */
export interface ToastProps {
  visible: boolean;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'brand' | 'neutral';
  style?: StyleProp<ViewStyle>;
}

export function Toast({
  visible,
  message,
  icon = 'checkmark-circle',
  tone = 'brand',
  style,
}: ToastProps) {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [reducedMotion, progress, visible]);

  if (!visible) return null;

  const iconColor = tone === 'brand' ? palette.help : colors.onBrand;
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.pill,
        { opacity: progress, transform: [{ translateY }] },
        style,
      ]}
    >
      <Ionicons name={icon} size={18} color={iconColor} style={styles.icon} />
      <Text style={styles.message} color={colors.onBrand}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandShade,
    borderRadius: radii.controlLarge,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  icon: { marginRight: spacing.sm },
  message: { fontFamily: fontFamily.bold },
});
