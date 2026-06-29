import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ReportCategory } from '@townly/shared';
import { colors, palette, spacing } from '@/theme';
import {
  Text,
  TownlyLogo,
  TownlyWordmark,
  TownlyCard,
  TownlyButton,
  IconButton,
  LocationChip,
  CategoryChip,
  CategoryGridItem,
  StatusPill,
  StatTile,
  PulseCard,
  ProgressMetricRow,
  StandingCard,
  MapPin,
  RadiusStepper,
  ReportPreviewCard,
  ReportBottomSheet,
  ConfirmationButton,
  EvidenceButton,
  QuietHoursBanner,
  Toast,
  EmptyState,
  ErrorState,
  OfflineBanner,
  PermissionState,
  SkeletonCard,
} from '@/components/ui';
import { Scaffold } from '../signal/Scaffold';

const CATS: ReportCategory[] = ['SAFETY', 'INFRASTRUCTURE', 'ANIMALS', 'COMMUNITY', 'HELP'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="label" style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

/**
 * Development-only gallery of every Signal UI component and its key states.
 * Reached from the "You" tab when __DEV__ is true; never shipped to users.
 */
export function ComponentGalleryScreen() {
  const navigation = useNavigation();
  const [confirmed, setConfirmed] = useState(false);
  const [quiet, setQuiet] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(false);
  const [cats, setCats] = useState<Record<ReportCategory, boolean>>({
    SAFETY: true, INFRASTRUCTURE: true, ANIMALS: false, COMMUNITY: true, HELP: false,
  });
  const [gridCat, setGridCat] = useState<ReportCategory>('SAFETY');
  const [radius, setRadius] = useState(0.8);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2400);
  };

  return (
    <Scaffold title="Gallery" onBack={() => navigation.goBack()}>
      <Section title="Branding">
        <Row>
          <TownlyLogo size={40} tone="light" />
          <TownlyLogo size={40} tone="dark" />
          <TownlyWordmark height={28} />
        </Row>
        <View style={styles.onDark}>
          <TownlyWordmark height={26} tone="onDark" />
        </View>
      </Section>

      <Section title="Buttons">
        <TownlyButton label="Primary" icon="checkmark" onPress={() => undefined} />
        <TownlyButton label="Secondary" variant="secondary" onPress={() => undefined} />
        <TownlyButton label="Ghost" variant="ghost" onPress={() => undefined} />
        <TownlyButton label="Danger" variant="danger" onPress={() => undefined} />
        <Row>
          <TownlyButton label="Loading" loading onPress={() => undefined} />
          <TownlyButton label="Disabled" disabled onPress={() => undefined} />
        </Row>
      </Section>

      <Section title="Icon buttons">
        <Row>
          <IconButton icon="search" accessibilityLabel="Search" />
          <IconButton icon="add" accessibilityLabel="Add" variant="brand" />
          <IconButton icon="heart" accessibilityLabel="Selected" selected />
          <IconButton icon="trash" accessibilityLabel="Disabled" disabled />
          <IconButton icon="ellipsis-horizontal" accessibilityLabel="More" variant="ghost" />
        </Row>
      </Section>

      <Section title="Location & category chips">
        <Row>
          <LocationChip label="Fishtown" onPress={() => undefined} />
          <LocationChip label="Read only" />
        </Row>
        <Row>
          {CATS.map((c) => (
            <CategoryChip
              key={c}
              category={c}
              selected={cats[c]}
              onPress={() => setCats((p) => ({ ...p, [c]: !p[c] }))}
            />
          ))}
        </Row>
        <Row>
          {CATS.map((c) => (
            <CategoryGridItem key={c} category={c} selected={gridCat === c} onPress={() => setGridCat(c)} />
          ))}
        </Row>
      </Section>

      <Section title="Status pills">
        <Row>
          <StatusPill label="Safety · live" tone="safety" dot />
          <StatusPill label="Resolved" tone="help" icon="checkmark-circle" />
          <StatusPill label="Expires in 41h" tone="neutral" icon="time-outline" />
          <StatusPill label="Community" tone="community" dot />
        </Row>
      </Section>

      <Section title="Stats & pulse">
        <Row>
          <StatTile value={2} label="need attention" valueColor={palette.safety} />
          <StatTile value={7} label="confirmed" valueColor={palette.help} />
          <StatTile value={3} label="resolved" />
        </Row>
        <PulseCard
          updatedLabel="updated 4 min ago"
          summary="Calm morning. One road closure on Girard, a found dog near Palmer Park."
          stats={[{ value: 2, label: 'attention' }, { value: 7, label: 'confirmed' }, { value: 3, label: 'resolved' }]}
        />
      </Section>

      <Section title="Standing & progress">
        <StandingCard tierLabel="tier 3 of 4" headline="Trusted" progress={0.78} trendLabel="steady" caption="Standing reflects accuracy and usefulness to neighbors." />
        <TownlyCard>
          <ProgressMetricRow label="Confirmations that held up" valueLabel="94%" progress={0.94} />
          <View style={{ height: spacing.md }} />
          <ProgressMetricRow label="Evidence quality" valueLabel="High" progress={0.82} />
        </TownlyCard>
      </Section>

      <Section title="Map pins">
        <Row>
          {CATS.map((c) => (
            <MapPin key={c} category={c} live={c === 'SAFETY'} />
          ))}
          <MapPin category="SAFETY" resolved />
        </Row>
      </Section>

      <Section title="Radius & reports">
        <RadiusStepper
          valueLabel={`${radius.toFixed(1)} km`}
          canDecrement={radius > 0.4}
          canIncrement={radius < 2}
          onDecrement={() => setRadius((r) => Math.max(0.4, +(r - 0.2).toFixed(1)))}
          onIncrement={() => setRadius((r) => Math.min(2, +(r + 0.2).toFixed(1)))}
        />
        <ReportPreviewCard category="SAFETY" title="Tree down blocking Berks St" distanceLabel="120 m" timeLabel="2h ago" confirmedCount={12} status="live" onPress={() => undefined} />
        <ReportPreviewCard category="ANIMALS" title="Found dog near Palmer Park" distanceLabel="300 m" timeLabel="1h ago" status="resolved" onPress={() => undefined} />
      </Section>

      <Section title="Report actions">
        <ConfirmationButton confirmed={confirmed} count={confirmed ? 13 : 12} onPress={() => setConfirmed((c) => !c)} />
        <EvidenceButton count={3} onPress={() => undefined} />
        <TownlyButton label="Open report sheet" variant="secondary" icon="chevron-up" onPress={() => setSheet(true)} />
        <TownlyButton label="Show toast" variant="ghost" icon="notifications" onPress={showToast} />
      </Section>

      <Section title="Alerts">
        <QuietHoursBanner
          enabled={quiet}
          hoursLabel={quiet ? '10 PM – 7 AM' : 'off'}
          subLabel={quiet ? 'Safety alerts still come through' : 'All alerts arrive immediately'}
          onToggle={() => setQuiet((q) => !q)}
        />
      </Section>

      <Section title="Async & empty states">
        <OfflineBanner />
        <SkeletonCard showThumb lines={3} />
        <EmptyState icon="leaf-outline" title="Nothing nearby yet" message="When neighbors post reports, they'll show up here." actionLabel="Refresh" onAction={() => undefined} />
        <ErrorState message="We couldn't load nearby reports." onRetry={() => undefined} />
        <PermissionState title="Location is off" message="Townly needs your location to show nearby reports." actionLabel="Enable location" onAction={() => undefined} icon="location-outline" />
      </Section>

      <ReportBottomSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title="Tree down blocking Berks St"
        category="SAFETY"
        metaLabel="120 m away · 2h ago · verified neighbor"
        stats={[{ value: 12, label: 'confirmed', valueColor: palette.help }, { value: 3, label: 'evidence' }, { value: 1, label: 'not there' }]}
      >
        <View style={styles.sheetActions}>
          <ConfirmationButton confirmed={confirmed} count={confirmed ? 13 : 12} onPress={() => setConfirmed((c) => !c)} />
          <EvidenceButton onPress={() => undefined} />
        </View>
      </ReportBottomSheet>

      <Toast visible={toast} message="Report added — neighbors notified" />
    </Scaffold>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm },
  sectionBody: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  onDark: { backgroundColor: colors.brand, borderRadius: 14, padding: spacing.md, alignSelf: 'flex-start' },
  sheetActions: { gap: spacing.sm, marginTop: spacing.md },
});
