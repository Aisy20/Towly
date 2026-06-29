import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, layout, fontFamily, fontSize } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Text } from './Text';

/**
 * Brand-filled banner advertising quiet hours, with a custom switch on the
 * right. The knob animates between off/on (static when reduce-motion is on).
 */
export interface QuietHoursBannerProps {
  enabled: boolean;
  hoursLabel: string;
  subLabel: string;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const KNOB_SIZE = 22;
const KNOB_INSET = (TRACK_HEIGHT - KNOB_SIZE) / 2;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;

export function QuietHoursBanner({
  enabled,
  hoursLabel,
  subLabel,
  onToggle,
  style,
}: QuietHoursBannerProps) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(enabled ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(enabled ? 1 : 0);
      return;
    }
    Animated.timing(progress, {
      toValue: enabled ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [enabled, reduced, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, KNOB_TRAVEL],
  });

  return (
    <View style={[styles.banner, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name="moon" size={20} color={colors.onBrand} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.title}>{`Quiet hours · ${hoursLabel}`}</Text>
        <Text style={styles.sub}>{subLabel}</Text>
      </View>

      <Pressable
        onPress={onToggle}
        accessibilityRole="switch"
        accessibilityLabel="Quiet hours"
        accessibilityState={{ checked: enabled }}
        style={styles.switchTarget}
      >
        <View
          style={[
            styles.track,
            { backgroundColor: enabled ? colors.onBrand : colors.brandShade },
          ]}
        >
          <Animated.View
            style={[
              styles.knob,
              {
                backgroundColor: enabled ? colors.brand : colors.onBrand,
                transform: [{ translateX }],
              },
            ]}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.control,
    backgroundColor: colors.brandShade,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  middle: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyLg,
    color: colors.onBrand,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.brandSoft,
    marginTop: 2,
  },
  switchTarget: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    justifyContent: 'center',
    paddingHorizontal: KNOB_INSET,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
  },
});
