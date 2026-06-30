import React, { useState } from 'react';
import { View, Pressable, TextInput, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import {
  CATEGORY_META,
  REPORT_ARCHIVE_HOURS,
  type Report,
  type ReportCategory,
} from '@townly/shared';
import {
  Text,
  StatusPill,
  StatTile,
  IconButton,
  ConfirmationButton,
  TownlyButton,
  TownlyCard,
  type PillTone,
} from '@/components/ui';
import { colors, palette, spacing, radii, layout, fontFamily, fontSize, hitSlop } from '@/theme';
import { useReportSignals } from '../../hooks/useReportSignals';
import { CATEGORY_ACTIONS, RESOLUTION_REASONS, type ReportAction } from './reportActions';
import { distanceMeters, isLive } from './home.data';
import { formatDistance, type LatLng } from '../../lib/geo';

const CATEGORY_TONE: Record<ReportCategory, PillTone> = {
  SAFETY: 'safety',
  INFRASTRUCTURE: 'infrastructure',
  ANIMALS: 'animals',
  COMMUNITY: 'community',
  HELP: 'help',
};

function archivePill(createdAt: string): { label: string; tone: PillTone } {
  const remainingH =
    (new Date(createdAt).getTime() + REPORT_ARCHIVE_HOURS * 3_600_000 - Date.now()) / 3_600_000;
  if (remainingH <= 0) return { label: 'Expired', tone: 'warning' };
  const label = remainingH < 1 ? `${Math.round(remainingH * 60)}m left` : `${Math.floor(remainingH)}h left`;
  return { label, tone: remainingH < 6 ? 'warning' : 'neutral' };
}

function uploaderTier(score: number): { label: string; tone: PillTone } {
  if (score >= 80) return { label: 'Trusted neighbor', tone: 'help' };
  if (score >= 60) return { label: 'Verified neighbor', tone: 'community' };
  if (score >= 40) return { label: 'Member', tone: 'neutral' };
  return { label: 'New member', tone: 'neutral' };
}

export interface ReportSheetContentProps {
  report: Report;
  center: LatLng | null;
  onClose: () => void;
  onOpenEvidence: () => void;
  onOpenHelp: () => void;
  onToast: (message: string) => void;
}

/**
 * The full report-detail content rendered inside the bottom sheet (native gorhom
 * sheet or web modal). Header → stat tiles → category-specific structured
 * actions → help preview → evidence preview → resolution. No generic like/comment
 * row. The close button comes first in accessibility order for correct focus.
 */
export function ReportSheetContent({
  report,
  center,
  onClose,
  onOpenEvidence,
  onOpenHelp,
  onToast,
}: ReportSheetContentProps) {
  const s = useReportSignals(report);
  const [showResolve, setShowResolve] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);

  const meta = CATEGORY_META[report.category];
  const dist = distanceMeters(report, center);
  const archive = archivePill(report.createdAt);
  const tier = uploaderTier(report.author.credibilityScore);
  const verified = report.author.credibilityScore >= 60;

  const actions = CATEGORY_ACTIONS[report.category];
  const confirmAction = actions.find((a) => a.kind === 'confirm');
  const helpPrimary = actions.find((a) => a.kind === 'help' && a.primary);
  const notThereAction = actions.find((a) => a.kind === 'notThere');
  const handledKeys = new Set(
    [confirmAction?.key, helpPrimary?.key, notThereAction?.key].filter(Boolean) as string[],
  );
  const secondary = actions.filter((a) => !handledKeys.has(a.key));

  const onSecondary = (action: ReportAction) => {
    switch (action.kind) {
      case 'resolve':
        if (s.canResolve) setShowResolve(true);
        else onToast('Flagged as possibly resolved');
        break;
      case 'evidence':
        onOpenEvidence();
        break;
      case 'help':
        onOpenHelp();
        break;
      case 'follow':
        s.toggleFollow();
        break;
      case 'share':
        onToast('Update shared with your followers');
        break;
      case 'signal':
        s.toggleAttending();
        break;
    }
  };

  const secondarySelected = (action: ReportAction) =>
    action.kind === 'follow' ? s.following : action.kind === 'signal' ? s.attending : false;

  const confirmResolution = () => {
    s.resolve(reason ?? 'resolved', note, notify);
    setShowResolve(false);
    onToast(notify ? 'Report resolved — followers notified' : 'Report resolved');
    onClose();
  };

  return (
    <View accessibilityViewIsModal>
      {/* Header */}
      <View style={styles.headerRow}>
        <StatusPill label={meta.label} dot tone={CATEGORY_TONE[report.category]} />
        <StatusPill label={archive.label} tone={archive.tone} icon="time-outline" style={styles.gap} />
        <View style={styles.flex} />
        <IconButton icon="close" accessibilityLabel="Close report" onPress={onClose} />
      </View>

      <Text variant="displaySm" style={styles.title}>
        {report.title}
      </Text>

      <View style={styles.metaRow}>
        {dist != null ? <MetaItem icon="navigate" label={formatDistance(dist)} /> : null}
        <MetaItem icon="time-outline" label={formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })} />
        <MetaItem
          icon={verified ? 'shield-checkmark' : 'person-outline'}
          label={verified ? 'Verified neighbor' : 'Neighbor'}
          tone={verified ? palette.help : colors.textMuted}
        />
      </View>

      {report.description ? (
        <Text variant="body" style={styles.description}>
          {report.description}
        </Text>
      ) : null}

      {/* Stat tiles */}
      <View style={styles.stats}>
        <StatTile value={report.upvotes} label="Confirmed" valueColor={palette.help} />
        <StatTile value={report.evidenceCount} label="Evidence" />
        <StatTile value={report.downvotes} label="Not there" valueColor={palette.safety} />
      </View>

      {/* Resolved banner OR structured actions */}
      {s.resolved ? (
        <View style={styles.resolvedBanner}>
          <Ionicons name="checkmark-circle" size={18} color={palette.help} />
          <Text variant="bodyLgMedium" style={styles.resolvedText}>
            This report has been resolved and kept in history.
          </Text>
        </View>
      ) : (
        <View style={styles.actions}>
          {helpPrimary ? (
            <TownlyButton
              label={helpPrimary.label}
              icon={helpPrimary.icon}
              onPress={onOpenHelp}
              fullWidth
            />
          ) : null}

          {confirmAction ? (
            <ConfirmationButton
              confirmed={s.confirmed}
              count={s.confirmCount}
              label={confirmAction.label}
              loading={s.pending}
              disabled={s.isAuthor}
              onPress={s.toggleConfirm}
            />
          ) : null}

          {notThereAction ? (
            <SignalButton
              icon={notThereAction.icon}
              label={notThereAction.label}
              selected={s.notThere}
              tone="danger"
              disabled={s.isAuthor}
              fullWidth
              onPress={s.toggleNotThere}
            />
          ) : null}

          {s.isAuthor ? (
            <Text variant="bodyMuted" style={styles.authorNote}>
              You're the reporter — you can't confirm your own report.
            </Text>
          ) : null}

          <View style={styles.grid}>
            {secondary.map((action) => (
              <SignalButton
                key={action.key}
                icon={action.icon}
                label={action.label}
                selected={secondarySelected(action)}
                onPress={() => onSecondary(action)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Resolution panel */}
      {showResolve ? (
        <TownlyCard style={styles.block}>
          <Text variant="label">Resolve report</Text>
          <View style={styles.reasonRow}>
            {RESOLUTION_REASONS[report.category].map((r) => {
              const sel = reason === r.key;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => setReason(r.key)}
                  hitSlop={hitSlop}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: sel }}
                  style={[styles.reasonChip, sel ? styles.reasonChipActive : null]}
                >
                  <Text style={[styles.reasonText, sel ? styles.reasonTextActive : null]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a closing note (optional)"
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.noteInput}
            accessibilityLabel="Closing note"
          />
          <View style={styles.notifyRow}>
            <Text variant="body">Notify followers</Text>
            <Switch
              value={notify}
              onValueChange={setNotify}
              trackColor={{ true: colors.brand, false: colors.border }}
            />
          </View>
          <TownlyButton
            label="Mark resolved"
            icon="checkmark-done"
            onPress={confirmResolution}
            disabled={!reason}
            fullWidth
          />
        </TownlyCard>
      ) : null}

      {/* Help thread preview */}
      <TownlyCard onPress={onOpenHelp} style={styles.block} accessibilityLabel="Open help thread">
        <View style={styles.previewHead}>
          <Ionicons name="chatbubbles-outline" size={18} color={palette.help} />
          <Text variant="bodyLgMedium" style={styles.previewTitle}>
            Help thread
          </Text>
          {report.helpOffersCount > 0 ? <View style={styles.unreadDot} /> : null}
          <Text variant="bodyMuted" style={styles.previewCount}>
            {report.helpOffersCount} {report.helpOffersCount === 1 ? 'reply' : 'replies'}
          </Text>
        </View>
        <Text variant="bodyMuted" numberOfLines={2} style={styles.previewBody}>
          {report.helpOffersCount > 0
            ? 'A neighbor offered to help — open the thread to coordinate.'
            : 'No replies yet. Offer help or ask a question to start the thread.'}
        </Text>
        <View style={styles.previewAction}>
          <Text style={styles.previewLink}>Open thread</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.brand} />
        </View>
      </TownlyCard>

      {/* Evidence preview */}
      <TownlyCard style={styles.block}>
        <View style={styles.previewHead}>
          <Ionicons name="images-outline" size={18} color={colors.brand} />
          <Text variant="bodyLgMedium" style={styles.previewTitle}>
            Evidence
          </Text>
          <Text variant="bodyMuted" style={styles.previewCount}>
            {report.evidenceCount} {report.evidenceCount === 1 ? 'photo' : 'photos'}
          </Text>
        </View>
        {report.evidenceCount > 0 ? (
          <>
            <View style={styles.thumbRow}>
              {Array.from({ length: Math.min(report.evidenceCount, 4) }).map((_, i) => (
                <View key={i} style={styles.thumb} accessibilityLabel={`Evidence photo ${i + 1}`}>
                  <Ionicons name="image" size={20} color={colors.textMuted} />
                </View>
              ))}
            </View>
            <View style={styles.evidenceMeta}>
              <StatusPill label="Reviewed" tone="help" icon="shield-checkmark" />
              <StatusPill label={tier.label} tone={tier.tone} icon="ribbon-outline" style={styles.gap} />
            </View>
          </>
        ) : (
          <Text variant="bodyMuted" style={styles.previewBody}>
            No evidence yet. Add a photo to help neighbors verify this.
          </Text>
        )}
        <Pressable
          onPress={onOpenEvidence}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Add evidence"
          style={({ pressed }) => [styles.previewAction, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons name="camera-outline" size={16} color={colors.brand} />
          <Text style={styles.previewLink}>Add evidence</Text>
        </Pressable>
      </TownlyCard>
    </View>
  );
}

function MetaItem({
  icon,
  label,
  tone = colors.textMuted,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={tone} style={styles.metaIcon} />
      <Text variant="bodyMuted" style={{ color: tone }}>
        {label}
      </Text>
    </View>
  );
}

interface SignalButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  tone?: 'neutral' | 'danger';
}

function SignalButton({
  icon,
  label,
  onPress,
  selected = false,
  disabled = false,
  fullWidth = false,
  tone = 'neutral',
}: SignalButtonProps) {
  const accent = tone === 'danger' ? palette.safety : colors.brand;
  const fg = selected ? colors.onBrand : disabled ? colors.textMuted : colors.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.signalBtn,
        fullWidth ? styles.signalFull : styles.signalHalf,
        {
          backgroundColor: selected ? accent : colors.surface,
          borderColor: selected ? accent : colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={fg} style={styles.signalIcon} />
      <Text style={[styles.signalLabel, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  gap: { marginLeft: spacing.xs },
  flex: { flex: 1 },
  title: { marginTop: spacing.md },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { marginRight: 4 },
  description: { marginTop: spacing.md },
  stats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  authorNote: { marginTop: -2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  signalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTouchTarget,
    borderWidth: 1.5,
    borderRadius: radii.controlLarge,
    paddingHorizontal: spacing.md,
  },
  signalHalf: { flexGrow: 1, flexBasis: '47%' },
  signalFull: { flexBasis: '100%' },
  signalIcon: { marginRight: spacing.xs },
  signalLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.body },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: palette.slateSoft,
  },
  resolvedText: { flex: 1 },
  block: { marginTop: spacing.md },
  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  reasonChip: {
    paddingHorizontal: spacing.md,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  reasonText: { fontFamily: fontFamily.bold, fontSize: fontSize.label, color: colors.textMuted },
  reasonTextActive: { color: colors.onBrand },
  noteInput: {
    marginTop: spacing.sm,
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.control,
    padding: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyLg,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  previewHead: { flexDirection: 'row', alignItems: 'center' },
  previewTitle: { marginLeft: spacing.sm },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.safety,
    marginLeft: spacing.sm,
  },
  previewCount: { marginLeft: 'auto' },
  previewBody: { marginTop: spacing.xs },
  previewAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  previewLink: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.brand },
  thumbRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.control,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
});
