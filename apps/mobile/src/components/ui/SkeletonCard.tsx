import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Loading placeholder shaped like a report card. Pulses a gentle shimmer while
 * content loads; honors reduce motion by rendering a static dimmed state. The
 * inner bars are hidden from assistive tech — the card announces "Loading".
 */
export interface SkeletonCardProps {
  lines?: number;
  showThumb?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BAR_WIDTHS = ['70%', '100%', '45%'] as const;

export function SkeletonCard({ lines = 3, showThumb = false, style }: SkeletonCardProps) {
  const reducedMotion = useReducedMotion();
  const shimmer = useRef(new Animated.Value(reducedMotion ? 0.6 : 0.5)).current;

  useEffect(() => {
    if (reducedMotion) {
      shimmer.setValue(0.6);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0.5, duration: 700, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, shimmer]);

  return (
    <Animated.View
      style={[styles.card, { opacity: shimmer }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
    >
      {showThumb ? (
        <Animated.View
          style={styles.thumb}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
      {Array.from({ length: lines }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            { width: BAR_WIDTHS[i % BAR_WIDTHS.length], marginTop: spacing.sm },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  thumb: {
    width: '100%',
    height: 120,
    borderRadius: radii.control,
    backgroundColor: colors.surfaceSecondary,
  },
  bar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
  },
});
