import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Report, ReportCategory, CATEGORY_META, RADIUS_OPTIONS } from '@townly/shared';
import { useMapStore } from '../../store/mapStore';
import { useLocation } from '../../hooks/useLocation';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useNearbyReports } from '../../api/reports';
import { ReportPin } from '../../components/map/ReportPin';
import { ReportDetailSheet } from '../../components/reports/ReportDetailSheet';

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const { location, error: locationError } = useLocation();
  const { radiusMeters, activeCategories, setRadius, toggleCategory } = useMapStore();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);

  const lat = location?.lat ?? null;
  const lng = location?.lng ?? null;

  // Live updates via WebSocket
  useWebSocket(lat, lng, radiusMeters);

  const { data, isLoading } = useNearbyReports(lat, lng, radiusMeters, activeCategories ?? undefined);
  const reports = data?.pages.flatMap((p) => p.reports) ?? [];

  const handlePinPress = useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  const centerOnUser = useCallback(() => {
    if (!location) return;
    mapRef.current?.animateToRegion({
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 400);
  }, [location]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={
          location
            ? { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }
            : { latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.05, longitudeDelta: 0.05 }
        }
      >
        {/* Radius circle */}
        {location && (
          <Circle
            center={{ latitude: location.lat, longitude: location.lng }}
            radius={radiusMeters}
            strokeColor="rgba(34,197,94,0.4)"
            fillColor="rgba(34,197,94,0.06)"
          />
        )}

        {/* Report pins */}
        {reports.map((report) => (
          <ReportPin
            key={report.id}
            report={report}
            onPress={handlePinPress}
          />
        ))}
      </MapView>

      {/* Top: Category filter chips */}
      <View style={[styles.filterBar, { top: insets.top + 8 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {(Object.keys(CATEGORY_META) as ReportCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const active = activeCategories === null || activeCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, { borderColor: meta.color, backgroundColor: active ? meta.color : '#fff' }]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : meta.color }]}>
                  {meta.emoji} {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Right: Controls */}
      <View style={[styles.controls, { bottom: insets.bottom + 100 }]}>
        {isLoading && <ActivityIndicator color="#22c55e" style={styles.controlBtn} />}

        <TouchableOpacity style={styles.controlBtn} onPress={centerOnUser}>
          <Ionicons name="locate" size={22} color="#334155" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setShowRadiusSlider((v) => !v)}
        >
          <Ionicons name="radio-outline" size={22} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Radius selector */}
      {showRadiusSlider && (
        <View style={[styles.radiusPanel, { bottom: insets.bottom + 160 }]}>
          {RADIUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.meters}
              style={[styles.radiusOption, radiusMeters === opt.meters && styles.radiusOptionActive]}
              onPress={() => { setRadius(opt.meters); setShowRadiusSlider(false); }}
            >
              <Text style={[styles.radiusText, radiusMeters === opt.meters && styles.radiusTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* FAB: Create report */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => navigation.navigate('Post')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom sheet: Report detail */}
      {selectedReport && (
        <ReportDetailSheet
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onViewFull={() => {
            navigation.navigate('ReportDetail', { id: selectedReport.id });
            setSelectedReport(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  filterBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  chips: { paddingHorizontal: 12, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  controls: {
    position: 'absolute',
    right: 16,
    gap: 8,
  },
  controlBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  radiusPanel: {
    position: 'absolute',
    right: 68,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    gap: 4,
  },
  radiusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  radiusOptionActive: { backgroundColor: '#dcfce7' },
  radiusText: { fontSize: 14, color: '#475569' },
  radiusTextActive: { color: '#16a34a', fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
