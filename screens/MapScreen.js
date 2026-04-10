import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, FlatList
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Colors, Shadow, Categories } from '../theme';

const SAMPLE_REPORTS = [
  {
    id: '1', category: 'safety', emoji: '🔴', title: 'Suspicious vehicle',
    description: 'Suspicious vehicle parked for 3 days, no plates visible.',
    lat: 40.7128, lng: -74.006, time: '2 min ago', street: 'Oak St',
    upvotes: 12, comments: 4, color: Colors.red,
  },
  {
    id: '2', category: 'animals', emoji: '🐾', title: 'Lost golden retriever',
    description: 'Lost golden retriever, answers to "Biscuit." Wearing red collar.',
    lat: 40.714, lng: -74.003, time: '14 min ago', street: 'Park Ave',
    upvotes: 8, comments: 6, color: Colors.yellow,
  },
  {
    id: '3', category: 'positive', emoji: '🌿', title: 'Free produce giveaway',
    description: 'Free produce giveaway outside the community center today only!',
    lat: 40.711, lng: -74.009, time: '1 hr ago', street: '5th & Main',
    upvotes: 34, comments: 11, color: Colors.green,
  },
  {
    id: '4', category: 'infrastructure', emoji: '🔠', title: 'Broken streetlight',
    description: 'Streetlight out on the corner of Maple & 3rd. Been out 5 days.',
    lat: 40.7135, lng: -74.001, time: '3 hr ago', street: 'Maple & 3rd',
    upvotes: 19, comments: 2, color: Colors.orange,
  },
  {
    id: '5', category: 'community', emoji: '🏢', title: 'Block party Saturday',
    description: 'Block party this Saturday 2-8pm on Oak Street. Everyone welcome!',
    lat: 40.7122, lng: -74.007, time: '5 hr ago', street: 'Oak St',
    upvotes: 45, comments: 18, color: Colors.blue,
  },
];

const FILTERS = ['All', '🔴 Safety', '🔠 Infra', '🐾 Animals', '🏢 Community', '🌿 Positive'];

const NOTIFICATIONS = [
  { id: '1', text: 'New Safety report 0.2mi away on Oak St', time: '2 min ago' },
  { id: '2', text: 'Lost dog "Biscuit" reported near you', time: '14 min ago' },
  { id: '3', text: 'Free produce giveaway at community center', time: '1 hr ago' },
];

const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f0e8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#1A1A2E' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#EDE8E0' }] },
  { featureType: 'park', elementType: 'geometry', stylers: [{ color: '#C8E6C9' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#B3D9F5' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

export default function MapScreen({ navigate }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showNotifs, setShowNotifs] = useState(false);

  const filteredReports = activeFilter === 'All'
    ? SAMPLE_REPORTS
    : SAMPLE_REPORTS.filter((r) => activeFilter.toLowerCase().includes(r.category));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Townly.</Text>
          <Text style={styles.zipLabel}>📍 Zip 11201</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowNotifs(!showNotifs)}
          >
            <Text style={styles.iconBtnText}>🔔</Text>
            <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigate('Profile')}>
            <Text style={styles.iconBtnText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification dropdown */}
      {showNotifs && (
        <View style={styles.notifPanel}>
          {NOTIFICATIONS.map((n) => (
            <View key={n.id} style={styles.notifItem}>
              <Text style={styles.notifText}>{n.text}</Text>
              <Text style={styles.notifTime}>{n.time}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          customMapStyle={lightMapStyle}
          initialRegion={{
            latitude: 40.7128,
            longitude: -74.006,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {/* Radius circle */}
          <Circle
            center={{ latitude: 40.7128, longitude: -74.006 }}
            radius={800}
            strokeColor="rgba(76,175,125,0.4)"
            fillColor="rgba(76,175,125,0.08)"
            strokeWidth={2}
          />
          {/* Report markers */}
          {filteredReports.map((report) => (
            <Marker
              key={report.id}
              coordinate={{ latitude: report.lat, longitude: report.lng }}
            >
              <View style={[styles.marker, { backgroundColor: report.color }]}>
                <Text style={styles.markerEmoji}>{report.emoji}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Filter pills */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed strip */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.feedStrip}
        renderItem={({ item }) => (
          <View style={[styles.feedCard, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
            <View style={styles.feedCardHeader}>
              <Text style={styles.feedEmoji}>{item.emoji}</Text>
              <Text style={styles.feedTime}>{item.time}</Text>
            </View>
            <Text style={styles.feedTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.feedStreet}>{item.street}</Text>
            <View style={styles.feedActions}>
              <Text style={styles.feedStat}>▲ {item.upvotes}</Text>
              <Text style={styles.feedStat}>💬 {item.comments}</Text>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigate('PostReport')} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('Leaderboard')}>
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={styles.navLabel}>Leaders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.cream,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logo: { fontSize: 22, fontWeight: '700', color: Colors.dark, letterSpacing: -0.5 },
  zipLabel: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', ...Shadow.small,
  },
  iconBtnText: { fontSize: 18 },
  notifBadge: {
    position: 'absolute', top: 6, right: 6, width: 16, height: 16,
    borderRadius: 8, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  notifPanel: {
    position: 'absolute', top: 72, right: 16, zIndex: 100,
    backgroundColor: Colors.white, borderRadius: 16, padding: 12,
    width: 280, ...Shadow.large,
  },
  notifItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  notifText: { fontSize: 13, color: Colors.dark, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  marker: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center',
    justifyContent: 'center', borderWidth: 2, borderColor: Colors.white, ...Shadow.small,
  },
  markerEmoji: { fontSize: 16 },
  filtersWrapper: { backgroundColor: Colors.cream, paddingTop: 10 },
  filters: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
  },
  filterPillActive: { backgroundColor: Colors.dark, borderColor: Colors.dark },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  filterTextActive: { color: Colors.white },
  feedStrip: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  feedCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    width: 180, ...Shadow.small,
  },
  feedCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  feedEmoji: { fontSize: 18 },
  feedTime: { fontSize: 11, color: Colors.gray },
  feedTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
  feedStreet: { fontSize: 12, color: Colors.gray, marginBottom: 8 },
  feedActions: { flexDirection: 'row', gap: 10 },
  feedStat: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 80, right: 20,
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center',
    ...Shadow.large,
  },
  fabText: { color: Colors.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  bottomNav: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navIcon: { fontSize: 22, marginBottom: 2 },
  navLabel: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  navLabelActive: { color: Colors.green, fontWeight: '700' },
});
