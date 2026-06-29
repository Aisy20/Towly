import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { CATEGORY_META, type ReportCategory } from '@townly/shared';
import { colors, radii, spacing, shadows } from '@/theme';
import { Text } from './Text';
import { StatusPill, type PillTone } from './StatusPill';
import { StatTile } from './StatTile';
import { IconButton } from './IconButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Bottom sheet for an expanded report — a category pill header, title, meta
 * line, optional stat row, and a slot for action buttons. Slides up over a
 * dimmed scrim; honors reduce motion by appearing instantly.
 */
export interface ReportBottomSheetStat {
  value: string | number;
  label: string;
  valueColor?: string;
}

export interface ReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  category?: ReportCategory;
  metaLabel?: string;
  stats?: ReportBottomSheetStat[];
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const CATEGORY_TONE: Record<ReportCategory, PillTone> = {
  SAFETY: 'safety',
  INFRASTRUCTURE: 'infrastructure',
  ANIMALS: 'animals',
  COMMUNITY: 'community',
  HELP: 'help',
};

export function ReportBottomSheet({
  visible,
  onClose,
  title,
  category,
  metaLabel,
  stats,
  children,
  style,
}: ReportBottomSheetProps) {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(visible ? 1 : 0);
      return;
    }
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [visible, reducedMotion, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [320, 0],
  });

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[styles.sheet, { transform: [{ translateY }] }, style]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            {category ? (
              <StatusPill
                label={CATEGORY_META[category].label}
                dot
                tone={CATEGORY_TONE[category]}
              />
            ) : null}
            <View style={styles.spacer} />
            <IconButton
              icon="close"
              accessibilityLabel="Close"
              onPress={onClose}
              variant="surface"
            />
          </View>
          <Text variant="displaySm" style={styles.title}>
            {title}
          </Text>
          {metaLabel ? (
            <Text variant="bodyMuted" style={styles.meta}>
              {metaLabel}
            </Text>
          ) : null}
          {stats && stats.length > 0 ? (
            <View style={styles.stats}>
              {stats.map((stat, i) => (
                <StatTile
                  key={`${stat.label}-${i}`}
                  value={stat.value}
                  label={stat.label}
                  valueColor={stat.valueColor}
                />
              ))}
            </View>
          ) : null}
          {children ? <View style={styles.actions}>{children}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,16,10,0.34)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.lg,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  spacer: { flex: 1 },
  title: { marginTop: spacing.md },
  meta: { marginTop: spacing.xs },
  stats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
});
