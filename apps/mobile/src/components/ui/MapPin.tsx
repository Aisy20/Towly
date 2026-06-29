import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { categoryColor, hitSlop, shadows, palette } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CATEGORY_META, type ReportCategory } from '@townly/shared';
import { Text } from './Text';

/**
 * Map teardrop pin for a report. The pin is a rotated rounded square (teardrop)
 * filled with the category color, carrying the category emoji so meaning is
 * never color alone. A `live` pin pulses a ring (static when reduce-motion is
 * on); a `resolved` pin is dimmed. Tappable when `onPress` is provided.
 */
export interface MapPinProps {
  category: ReportCategory;
  live?: boolean;
  resolved?: boolean;
  /** Raised + ringed + slightly enlarged when this pin is the active selection. */
  selected?: boolean;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function MapPin({
  category,
  live = false,
  resolved = false,
  selected = false,
  size = 36,
  onPress,
  accessibilityLabel,
  style,
}: MapPinProps) {
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;

  const animated = live && !reduced;

  useEffect(() => {
    if (!animated) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, pulse]);

  const meta = CATEGORY_META[category];
  const color = categoryColor[category];
  const ringSize = size * 1.6;

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const label =
    accessibilityLabel ??
    `${meta.label} report${live ? ' (live)' : ''}${selected ? ', selected' : ''}`;

  const content = (
    <View
      style={[
        styles.wrap,
        { width: size, height: size },
        resolved ? styles.resolved : null,
        selected ? styles.wrapSelected : null,
      ]}
    >
      {live ? (
        animated ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ring,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                backgroundColor: color,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
        ) : (
          <View
            pointerEvents="none"
            style={[
              styles.ring,
              styles.staticRing,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                backgroundColor: color,
              },
            ]}
          />
        )
      ) : null}
      <View
        style={[
          styles.pin,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          selected ? styles.pinSelected : null,
        ]}
      >
        <Text
          variant="body"
          style={[styles.emoji, { fontSize: size * 0.5 }]}
        >
          {meta.emoji}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        style={({ pressed }) => [styles.container, { opacity: pressed ? 0.85 : 1 }, style]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      hitSlop={hitSlop}
      style={[styles.container, style]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolved: {
    opacity: 0.5,
  },
  wrapSelected: {
    transform: [{ scale: 1.18 }],
  },
  pinSelected: {
    borderWidth: 3,
    borderColor: palette.white,
    ...shadows.md,
  },
  ring: {
    position: 'absolute',
  },
  staticRing: {
    opacity: 0.18,
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 4,
    transform: [{ rotate: '45deg' }],
    ...shadows.sm,
  },
  emoji: {
    transform: [{ rotate: '-45deg' }],
  },
});
