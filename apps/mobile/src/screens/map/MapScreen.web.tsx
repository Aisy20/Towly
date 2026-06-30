/**
 * Web Home screen. react-native-maps is native-only, so on web the accessible
 * nearby-report list is the primary view. It reads the same normalized report
 * store as the native map, so filters / radius / real-time updates behave
 * identically — the list IS the screen-reader equivalent of the map. Tapping a
 * row opens the same report-detail sheet (a slide-up modal on web).
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { Report } from '@townly/shared';
import { OfflineBanner, PermissionState, RadiusStepper, Text, Toast } from '@/components/ui';
import { colors, palette, spacing, layout, radii } from '@/theme';
import { useMapStore } from '../../store/mapStore';
import { useAuthStore } from '../../store/authStore';
import { HomeHeader } from '../home/HomeHeader';
import { HomeChrome } from '../home/HomeChrome';
import { NearbyList } from '../home/NearbyList';
import { ReportDetailSheet } from '../home/ReportDetailSheet';
import { useHomeView } from '../home/useHomeView';
import { pulseSummary, lastUpdatedLabel } from '../home/home.data';

export function MapScreen() {
  const navigation = useNavigation<any>();
  const [toast, setToast] = useState<string | null>(null);
  const radiusMeters = useMapStore((s) => s.radiusMeters);
  const stepRadius = useMapStore((s) => s.stepRadius);
  const canStepRadius = useMapStore((s) => s.canStepRadius);
  const setSelectedReport = useMapStore((s) => s.setSelectedReport);

  const user = useAuthStore((s) => s.user);
  const initial = (user?.username?.[0] ?? 'Y').toUpperCase();

  const view = useHomeView();
  const { center, visible, pulse, selectedReport, isError, isWaitingForLocation } = view;

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  }, []);
  const openReport = useCallback((report: Report) => setSelectedReport(report.id), [setSelectedReport]);
  const closeSheet = useCallback(() => setSelectedReport(null), [setSelectedReport]);

  const header = (
    <View>
      <HomeChrome
        pulse={pulse}
        summary={pulseSummary(pulse)}
        updatedLabel={lastUpdatedLabel(view.windowReports)}
        onLocationPress={() => navigation.navigate('SearchList')}
      />
      <View style={styles.mapNote}>
        <Ionicons name="map-outline" size={18} color={colors.brand} />
        <Text variant="bodyMuted" style={styles.mapNoteText}>
          The live map is available in the Townly iOS & Android app. Here's everything nearby as a list.
        </Text>
      </View>
      <View style={styles.stepperWrap}>
        <RadiusStepper
          valueLabel={`${(radiusMeters / 1000).toFixed(1)} km`}
          canDecrement={canStepRadius(-1)}
          canIncrement={canStepRadius(1)}
          onDecrement={() => stepRadius(-1)}
          onIncrement={() => stepRadius(1)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader
        initial={initial}
        onSearch={() => navigation.navigate('SearchList')}
        onAvatar={() => navigation.navigate('You')}
      />

      {isError ? <OfflineBanner style={styles.offline} /> : null}

      {isWaitingForLocation ? (
        <PermissionState
          icon="location-outline"
          title="Location is off"
          message="Townly uses your location to show what's happening nearby. Your exact position is never shown to others."
          actionLabel="Enable location"
          onAction={() => undefined}
        />
      ) : (
        <NearbyList reports={visible} center={center} onSelectReport={openReport} header={header} />
      )}

      <ReportDetailSheet
        report={selectedReport}
        center={center}
        onClose={closeSheet}
        onOpenEvidence={() =>
          selectedReport && navigation.navigate('Evidence', { reportId: selectedReport.id })
        }
        onOpenHelp={() =>
          selectedReport && navigation.navigate('HelpThread', { reportId: selectedReport.id })
        }
        onToast={showToast}
      />

      <Toast visible={!!toast} message={toast ?? ''} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  offline: { marginHorizontal: layout.screenPaddingH, marginBottom: spacing.sm },
  mapNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: layout.screenPaddingH,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: palette.mapPark,
    borderRadius: radii.card,
  },
  mapNoteText: { flex: 1, color: colors.textPrimary },
  stepperWrap: { marginHorizontal: layout.screenPaddingH, marginTop: spacing.md },
});
