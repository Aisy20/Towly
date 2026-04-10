import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RADIUS_OPTIONS, ReportCategory, CATEGORY_META } from '@townly/shared';
import { useMapStore } from '../../store/mapStore';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/client';
import { storage } from '../../lib/storage';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { radiusMeters, setRadius } = useMapStore();
  const { clearAuth } = useAuthStore();
  const [notifyCategories, setNotifyCategories] = useState<Set<ReportCategory>>(
    new Set(['SAFETY', 'INFRASTRUCTURE', 'ANIMALS', 'COMMUNITY', 'POSITIVE'])
  );

  const toggleCategory = (cat: ReportCategory) => {
    setNotifyCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try {
            const refreshToken = await storage.getItem('townly_refresh_token');
            if (refreshToken) await apiClient.post('/auth/logout', { refreshToken });
          } catch {}
          await clearAuth();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Notification Radius</Text>
      <View style={styles.radiusOptions}>
        {RADIUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.meters}
            style={[styles.radiusOption, radiusMeters === opt.meters && styles.radiusOptionActive]}
            onPress={() => setRadius(opt.meters)}
          >
            <Text style={[styles.radiusText, radiusMeters === opt.meters && styles.radiusTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Notify Me About</Text>
      {(Object.keys(CATEGORY_META) as ReportCategory[]).map((cat) => {
        const meta = CATEGORY_META[cat];
        return (
          <View key={cat} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{meta.emoji} {meta.label}</Text>
            <Switch
              value={notifyCategories.has(cat)}
              onValueChange={() => toggleCategory(cat)}
              trackColor={{ true: meta.color }}
            />
          </View>
        );
      })}

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12 },
  radiusOptions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  radiusOption: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  radiusOptionActive: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  radiusText: { fontSize: 14, color: '#64748b' },
  radiusTextActive: { color: '#16a34a', fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  toggleLabel: { fontSize: 15, color: '#334155' },
  signOutBtn: {
    marginTop: 24, padding: 16, backgroundColor: '#fef2f2',
    borderRadius: 14, alignItems: 'center',
  },
  signOutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
