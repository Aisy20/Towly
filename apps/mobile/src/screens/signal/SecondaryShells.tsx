import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportCategory } from '@townly/shared';
import { spacing } from '@/theme';
import {
  EmptyState,
  TownlyButton,
  ConfirmationButton,
  EvidenceButton,
  CategoryGridItem,
  ReportPreviewCard,
  PermissionState,
} from '@/components/ui';
import { Scaffold } from './Scaffold';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const CATS: ReportCategory[] = ['SAFETY', 'INFRASTRUCTURE', 'ANIMALS', 'COMMUNITY', 'HELP'];

export function ReportDetailShell() {
  const navigation = useNavigation<Nav>();
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Scaffold title="Report" onBack={() => navigation.goBack()}>
      <EmptyState icon="alert-circle-outline" title="Tree down blocking Berks St" message="Full report detail will render here. The action row below is live." />
      <ConfirmationButton confirmed={confirmed} count={confirmed ? 13 : 12} onPress={() => setConfirmed((c) => !c)} />
      <EvidenceButton count={3} onPress={() => navigation.navigate('Evidence', { reportId: 'demo' })} />
      <TownlyButton label="Open help thread" icon="people-outline" variant="secondary" onPress={() => navigation.navigate('HelpThread', { reportId: 'demo' })} />
    </Scaffold>
  );
}

export function CreateReportShell() {
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<ReportCategory>('SAFETY');
  return (
    <Scaffold title="New report" onBack={() => navigation.goBack()}>
      <View style={styles.grid}>
        {CATS.map((c) => (
          <CategoryGridItem key={c} category={c} selected={selected === c} onPress={() => setSelected(c)} />
        ))}
      </View>
      <TownlyButton label="Check & publish" icon="checkmark-circle-outline" onPress={() => navigation.navigate('DuplicateDetection', { draftId: 'demo' })} />
    </Scaffold>
  );
}

export function DuplicateDetectionShell() {
  const navigation = useNavigation<Nav>();
  return (
    <Scaffold title="Possible duplicate" onBack={() => navigation.goBack()}>
      <EmptyState icon="search" title="A neighbor already reported this nearby" message="Adding to it keeps the map clear and gets help to the right place faster." />
      <ReportPreviewCard category="SAFETY" title="Tree down blocking Berks St" distanceLabel="80 m" timeLabel="2h ago" confirmedCount={12} status="live" />
      <TownlyButton label="Add my evidence instead" icon="camera-outline" onPress={() => navigation.goBack()} />
      <TownlyButton label="Confirm it's still there" icon="checkmark" variant="secondary" onPress={() => navigation.goBack()} />
      <TownlyButton label="No, this is something different" variant="ghost" onPress={() => navigation.goBack()} />
    </Scaffold>
  );
}

export function EvidenceShell() {
  const navigation = useNavigation<Nav>();
  return (
    <Scaffold title="Evidence" onBack={() => navigation.goBack()}>
      <EmptyState icon="images-outline" title="No evidence yet" message="Corroborating photos neighbors add will appear here." actionLabel="Add evidence" onAction={() => undefined} />
    </Scaffold>
  );
}

export function HelpThreadShell() {
  const navigation = useNavigation<Nav>();
  return (
    <Scaffold title="Help thread" onBack={() => navigation.goBack()}>
      <EmptyState icon="people-outline" title="Offer help" message="Neighbors offering help will show up in this thread." actionLabel="Offer help" onAction={() => undefined} />
    </Scaffold>
  );
}

export function SettingsShell() {
  const navigation = useNavigation<Nav>();
  return (
    <Scaffold title="Settings" onBack={() => navigation.goBack()}>
      <EmptyState icon="settings-outline" title="Settings" message="Notification radius, quiet hours and category preferences will live here." />
    </Scaffold>
  );
}

export function VerificationShell() {
  const navigation = useNavigation<Nav>();
  return (
    <Scaffold title="Verification" onBack={() => navigation.goBack()}>
      <PermissionState
        icon="shield-checkmark-outline"
        title="Verify you're a neighbor"
        message="Verified neighbors keep Townly trustworthy. Phone and ID verification will run here."
        actionLabel="Start verification"
        onAction={() => undefined}
      />
    </Scaffold>
  );
}

export function SearchListShell() {
  const navigation = useNavigation<Nav>();
  return (
    <Scaffold title="List & search" onBack={() => navigation.goBack()}>
      <ReportPreviewCard category="SAFETY" title="Tree down blocking Berks St" distanceLabel="120 m" timeLabel="2h ago" confirmedCount={12} status="live" onPress={() => navigation.navigate('ReportDetail', { reportId: 'demo' })} />
      <ReportPreviewCard category="ANIMALS" title="Found dog near Palmer Park" distanceLabel="300 m" timeLabel="1h ago" confirmedCount={4} status="resolved" onPress={() => navigation.navigate('ReportDetail', { reportId: 'demo2' })} />
      <ReportPreviewCard category="COMMUNITY" title="Free produce at the church" distanceLabel="450 m" timeLabel="20 min ago" onPress={() => navigation.navigate('ReportDetail', { reportId: 'demo3' })} />
    </Scaffold>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
