import React from 'react';
import {
  Pressable,
  View,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, fontFamily, fontSize } from '@/theme';
import { Text } from './Text';

/**
 * Toggle for confirming a report ("Confirm" / "Confirmed"). Product language is
 * always confirm — never "upvote". Filled brand when confirmed, outlined brand
 * when not, with an optional confirmation count and a loading state.
 */
export interface ConfirmationButtonProps {
  confirmed: boolean;
  onPress: () => void;
  count?: number;
  /** Override the default "Confirm" verb (e.g. "Seen here", "Helpful"). */
  label?: string;
  /** Override the default confirmed-state verb (e.g. "Seen", "Marked helpful"). */
  confirmedLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ConfirmationButton({
  confirmed,
  onPress,
  count,
  label: labelProp,
  confirmedLabel,
  loading = false,
  disabled = false,
  style,
}: ConfirmationButtonProps) {
  const isDisabled = disabled || loading;
  const fg = confirmed ? colors.onBrand : colors.brand;
  const baseLabel = confirmed
    ? confirmedLabel ?? labelProp ?? 'Confirmed'
    : labelProp ?? 'Confirm';
  const label = count != null ? `${baseLabel} · ${count}` : baseLabel;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={baseLabel}
      accessibilityState={{ selected: confirmed, busy: loading, disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        confirmed ? styles.confirmed : styles.unconfirmed,
        { opacity: isDisabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {confirmed ? (
            <Ionicons name="checkmark" size={18} color={fg} style={styles.icon} />
          ) : null}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: radii.controlLarge,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmed: {
    backgroundColor: colors.brand,
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  unconfirmed: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyLg,
  },
});
