import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing } from '@/theme';
import {
  LocationChip,
  IconButton,
  PulseCard,
  ReportPreviewCard,
  RadiusStepper,
  StandingCard,
  QuietHoursBanner,
  TownlyButton,
  EmptyState,
} from '@/components/ui';
import { Scaffold } from './Scaffold';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Placeholder tab shells wired to the real navigation tree. They render real
 * library components so the design + routing are verifiable, but are not the
 * final screens.
 */

export function MapShell() {
  const navigation = useNavigation<Nav>();
  const [radius, setRadius] = useState(0.8);
  return (
    <Scaffold
      showWordmark
      right={
        <IconButton
          icon="search"
          accessibilityLabel="Search reports"
          onPress={() => navigation.navigate('SearchList')}
        />
      }
    >
      <LocationChip label="Fishtown" onPress={() => undefined} style={{ marginTop: spacing.md }} />
      <PulseCard
        updatedLabel="updated 4 min ago"
        summary="Calm morning. One road closure on Girard, a found dog near Palmer Park, free produce at the church this afternoon."
        stats={[
          { value: 2, label: 'need attention', valueColor: undefined },
          { value: 7, label: 'confirmed' },
          { value: 3, label: 'resolved' },
        ]}
      />
      <RadiusStepper
        valueLabel={`${radius.toFixed(1)} km`}
        canDecrement={radius > 0.4}
        canIncrement={radius < 2}
        onDecrement={() => setRadius((r) => Math.max(0.4, +(r - 0.2).toFixed(1)))}
        onIncrement={() => setRadius((r) => Math.min(2, +(r + 0.2).toFixed(1)))}
      />
      <ReportPreviewCard
        category="SAFETY"
        title="Tree down blocking Berks St"
        distanceLabel="120 m"
        timeLabel="2h ago"
        confirmedCount={12}
        status="live"
        onPress={() => navigation.navigate('ReportDetail', { reportId: 'demo' })}
      />
      <TownlyButton
        label="Open list / search mode"
        icon="list"
        variant="secondary"
        onPress={() => navigation.navigate('SearchList')}
      />
    </Scaffold>
  );
}

export function PulseShell() {
  return (
    <Scaffold title="Pulse">
      <PulseCard
        updatedLabel="updated 4 min ago"
        summary="Fishtown is quiet. Confirmed reports are trending down week over week."
        stats={[
          { value: 2, label: 'need attention' },
          { value: 7, label: 'confirmed' },
          { value: 3, label: 'resolved' },
        ]}
      />
      <EmptyState
        icon="pulse"
        title="Neighborhood Pulse"
        message="A live summary of what's happening nearby will appear here."
      />
    </Scaffold>
  );
}

export function AlertsShell() {
  const [quiet, setQuiet] = useState(true);
  return (
    <Scaffold title="Alerts">
      <QuietHoursBanner
        enabled={quiet}
        hoursLabel={quiet ? '10 PM – 7 AM' : 'off'}
        subLabel={quiet ? 'Safety alerts still come through' : 'All alerts arrive immediately'}
        onToggle={() => setQuiet((q) => !q)}
      />
      <EmptyState icon="notifications-outline" title="You're all caught up" message="Nearby updates will be bundled here." />
    </Scaffold>
  );
}

export function YouShell() {
  const navigation = useNavigation<Nav>();
  return (
    <Scaffold title="You">
      <StandingCard
        tierLabel="tier 3 of 4"
        headline="Trusted"
        progress={0.78}
        trendLabel="steady"
        caption="Standing reflects accuracy and usefulness to neighbors — not popularity or post count."
      />
      <TownlyButton label="Verification" icon="shield-checkmark-outline" variant="secondary" onPress={() => navigation.navigate('Verification')} />
      <TownlyButton label="Settings" icon="settings-outline" variant="secondary" onPress={() => navigation.navigate('Settings')} />
      {__DEV__ ? (
        <TownlyButton label="Component gallery (dev)" icon="color-palette-outline" variant="ghost" onPress={() => navigation.navigate('ComponentGallery')} />
      ) : null}
    </Scaffold>
  );
}
