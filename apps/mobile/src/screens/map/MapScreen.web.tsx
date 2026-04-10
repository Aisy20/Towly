/**
 * Web fallback for MapScreen.
 * react-native-maps is not supported on web. This renders a scrollable
 * list of nearby reports with the same filter/radius controls.
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Report, ReportCategory, CATEGORY_META, RADIUS_OPTIONS } from '@townly/shared';
import { formatDistanceToNow } from 'date-fns';
import { useMapStore } from '../../store/mapStore';
import { useLocation } from '../../hooks/useLocation';
import { useNearbyReports } from '../../api/reports';

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { location } = useLocation();
  const { radiusMeters, activeCategories, setRadius, toggleCategory } = useMapStore();
  const [showRadiusPanel, setShowRadiusPanel] = useState(false);

  const lat = location?.lat ?? null;
  const lng = location?.lng ?? null;

  const { data, isLoading, fetchNextPage, hasNextPage } = useNearbyReports(
    lat,
    lng,
    radiusMeters,
    activeCategories ?? undefined,
  );
  const reports = data?.pages.flatMap((p) => p.reports) ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏘️ Townly</Text>
        <TouchableOpacity onPress={() => setShowRadiusPanel((v) => !v)} style={styles.radiusBtn}>
          <Ionicons name="radio-outline" size={16} color="#334155" />
          <Text style={styles.radiusBtnText}>
            {RADIUS_OPTIONS.find((o) => o.meters === radiusMeters)?.label ?? 'Radius'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Radius panel */}
      {showRadiusPanel && (
        <View style={styles.radiusPanel}>
          {RADIUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.meters}
              style={[styles.radiusOption, radiusMeters === opt.meters && styles.radiusOptionActive]}
              onPress={() => { setRadius(opt.meters); setShowRadiusPanel(false); }}
            >
              <Text style={[styles.radiusText, radiusMeters === opt.meters && styles.radiusTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterChips}>
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

      {/* No location warning */}
      {!location && !isLoading && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>📍 Allow location access to see nearby reports</Text>
        </View>
      )}

      {/* Reports list */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#22c55e" size="large" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reports in your area. Be the first to post one!</Text>
          }
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          renderItem={({ item: report }) => {
            const meta = CATEGORY_META[report.category];
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ReportDetail', { id: report.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: meta.color + '20' }]}>
                    <Text style={[styles.categoryText, { color: meta.color }]}>
                      {meta.emoji} {meta.label}
                    </Text>
                  </View>
                  <Text style={styles.cardTime}>
                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{report.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{report.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardMeta}>@{report.author.username}</Text>
                  <Text style={styles.cardScore}>👍 {report.upvotes} · 👎 {report.downvotes}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => navigation.navigate('Post')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  radiusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  radiusBtnText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  radiusPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  radiusOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  radiusOptionActive: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  radiusText: { fontSize: 13, color: '#64748b' },
  radiusTextActive: { color: '#16a34a', fontWeight: '700' },
  filterScroll: { backgroundColor: '#fff', maxHeight: 52 },
  filterChips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  notice: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  noticeText: { fontSize: 14, color: '#92400e', textAlign: 'center' },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  categoryText: { fontSize: 12, fontWeight: '600' },
  cardTime: { fontSize: 11, color: '#94a3b8' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
  cardScore: { fontSize: 12, color: '#64748b' },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 60, paddingHorizontal: 32 },
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
