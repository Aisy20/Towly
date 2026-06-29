import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Circle, Marker, type Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { Report } from '@townly/shared';
import {
  IconButton,
  MapPin,
  OfflineBanner,
  PermissionState,
  RadiusStepper,
  ReportPreviewCard,
  Text,
} from '@/components/ui';
import { colors, palette, spacing, layout, radii, shadows } from '@/theme';
import { useMapStore } from '../../store/mapStore';
import { useAuthStore } from '../../store/authStore';
import { fuzzCoordinate, formatDistance } from '../../lib/geo';
import { withAlpha } from '../../lib/color';
import { HomeHeader } from '../home/HomeHeader';
import { HomeChrome } from '../home/HomeChrome';
import { NearbyList } from '../home/NearbyList';
import { useHomeView } from '../home/useHomeView';
import {
  isLive,
  isConfirmed,
  reportStatus,
  pulseSummary,
  lastUpdatedLabel,
  distanceMeters,
} from '../home/home.data';
import { townlyMapStyle } from '../home/mapStyle';

const FALLBACK_REGION: Region = {
  latitude: 39.9726,
  longitude: -75.13,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function MapScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);

  const radiusMeters = useMapStore((s) => s.radiusMeters);
  const listMode = useMapStore((s) => s.listMode);
  const setListMode = useMapStore((s) => s.setListMode);
  const selectedReportId = useMapStore((s) => s.selectedReportId);
  const setSelectedReport = useMapStore((s) => s.setSelectedReport);
  const stepRadius = useMapStore((s) => s.stepRadius);
  const canStepRadius = useMapStore((s) => s.canStepRadius);

  const user = useAuthStore((s) => s.user);
  const initial = (user?.username?.[0] ?? 'Y').toUpperCase();

  const view = useHomeView();
  const { center, visible, pulse, selectedReport, isError, isWaitingForLocation } = view;

  const openDetail = useCallback(
    (report: Report) => navigation.navigate('ReportDetail', { reportId: report.id }),
    [navigation],
  );

  const recenter = useCallback(() => {
    if (!center) return;
    mapRef.current?.animateToRegion(
      { latitude: center.lat, longitude: center.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      350,
    );
  }, [center]);

  const region: Region = center
    ? { latitude: center.lat, longitude: center.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : FALLBACK_REGION;

  const updatedLabel = lastUpdatedLabel(view.windowReports);
  const summary = pulseSummary(pulse);

  return (
    <View style={styles.container}>
      <HomeHeader
        initial={initial}
        onSearch={() => navigation.navigate('SearchList')}
        onAvatar={() => navigation.navigate('You')}
      />

      <HomeChrome
        pulse={pulse}
        summary={summary}
        updatedLabel={updatedLabel}
        onLocationPress={() => navigation.navigate('SearchList')}
      />

      <View style={styles.viewport}>
        {listMode ? (
          <NearbyList reports={visible} center={center} onSelectReport={openDetail} />
        ) : isWaitingForLocation ? (
          <PermissionState
            icon="location-outline"
            title="Location is off"
            message="Townly uses your location to show what's happening nearby. Your exact position is never shown to others."
            actionLabel="Enable location"
            onAction={recenter}
          />
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              customMapStyle={townlyMapStyle}
              showsUserLocation
              showsMyLocationButton={false}
              showsPointsOfInterest={false}
              toolbarEnabled={false}
              onPress={() => setSelectedReport(null)}
            >
              {center ? (
                <Circle
                  center={{ latitude: center.lat, longitude: center.lng }}
                  radius={radiusMeters}
                  strokeColor={withAlpha(palette.slate, 0.4)}
                  fillColor={withAlpha(palette.slate, 0.07)}
                  strokeWidth={1.5}
                />
              ) : null}

              {visible.map((report) => {
                const c = fuzzCoordinate({ lat: report.latitude, lng: report.longitude }, report.id);
                const selected = report.id === selectedReportId;
                return (
                  <Marker
                    key={report.id}
                    coordinate={{ latitude: c.lat, longitude: c.lng }}
                    anchor={{ x: 0.5, y: 1 }}
                    onPress={() => setSelectedReport(report.id)}
                    tracksViewChanges={selected || isLive(report)}
                  >
                    <MapPin
                      category={report.category}
                      live={isLive(report)}
                      selected={selected}
                    />
                  </Marker>
                );
              })}
            </MapView>

            {isError ? <OfflineBanner style={styles.offline} /> : null}

            {/* Map controls */}
            <View style={styles.topControls} pointerEvents="box-none">
              <IconButton
                icon={listMode ? 'map' : 'list'}
                accessibilityLabel="Show nearby list"
                onPress={() => setListMode(true)}
              />
              <IconButton icon="locate" accessibilityLabel="Recenter map" onPress={recenter} />
            </View>

            {/* Bottom: floating preview + radius stepper */}
            <View style={styles.bottomDock} pointerEvents="box-none">
              {selectedReport ? (
                <ReportPreviewCard
                  category={selectedReport.category}
                  title={selectedReport.title}
                  distanceLabel={distanceLabel(selectedReport, center)}
                  timeLabel={isLive(selectedReport) ? 'Just now' : undefined}
                  confirmedCount={isConfirmed(selectedReport) ? selectedReport.upvotes : undefined}
                  status={reportStatus(selectedReport)}
                  onPress={() => openDetail(selectedReport)}
                  style={styles.preview}
                />
              ) : null}
              <View style={styles.stepperRow}>
                <RadiusStepper
                  valueLabel={`${(radiusMeters / 1000).toFixed(1)} km`}
                  canDecrement={canStepRadius(-1)}
                  canIncrement={canStepRadius(1)}
                  onDecrement={() => stepRadius(-1)}
                  onIncrement={() => stepRadius(1)}
                  style={styles.stepper}
                />
              </View>
            </View>
          </>
        )}

        {listMode ? (
          <View style={styles.listToggleDock} pointerEvents="box-none">
            <IconButton
              icon="map"
              accessibilityLabel="Show map"
              variant="brand"
              onPress={() => setListMode(false)}
              style={styles.listToggleBtn}
            />
          </View>
        ) : null}

        {view.isLoading ? (
          <View style={styles.loading} pointerEvents="none">
            <ActivityIndicator color={colors.brand} />
            <Text variant="bodyMuted" style={styles.loadingText}>
              Loading nearby reports…
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function distanceLabel(report: Report, center: ReturnType<typeof useHomeView>['center']) {
  const d = distanceMeters(report, center);
  return d != null ? formatDistance(d) : undefined;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  viewport: { flex: 1, overflow: 'hidden' },
  offline: { position: 'absolute', top: spacing.sm, left: spacing.lg, right: spacing.lg },
  topControls: {
    position: 'absolute',
    top: spacing.md,
    right: layout.screenPaddingH,
    gap: spacing.sm,
  },
  bottomDock: {
    position: 'absolute',
    left: layout.screenPaddingH,
    right: layout.screenPaddingH,
    bottom: spacing.lg,
    gap: spacing.sm,
  },
  preview: { ...shadows.md },
  stepperRow: { flexDirection: 'row' },
  stepper: { flex: 1, ...shadows.sm },
  listToggleDock: {
    position: 'absolute',
    right: layout.screenPaddingH,
    bottom: spacing.lg,
  },
  listToggleBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.controlLarge,
    ...shadows.md,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {},
});
