import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { CREDIBILITY_TIERS } from '@townly/shared';

function getCredibilityTier(score: number) {
  return CREDIBILITY_TIERS.find((t) => score >= t.min) ?? CREDIBILITY_TIERS[CREDIBILITY_TIERS.length - 1];
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;
  const tier = getCredibilityTier(user.credibilityScore);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{user.username[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.username}>@{user.username}</Text>

      <View style={[styles.tierBadge, { backgroundColor: tier.color + '20' }]}>
        <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
      </View>

      <View style={styles.scoreBar}>
        <View style={[styles.scoreBarFill, { width: `${user.credibilityScore}%`, backgroundColor: tier.color }]} />
      </View>
      <Text style={styles.scoreLabel}>Credibility: {Math.round(user.credibilityScore)}/100</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{user.totalReports}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{user.accurateReports}</Text>
          <Text style={styles.statLabel}>Accurate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {user.totalReports > 0
              ? `${Math.round((user.accurateReports / user.totalReports) * 100)}%`
              : '—'}
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settingsBtnText}>Settings & Notifications</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, alignItems: 'center', gap: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: 36, fontWeight: '700', color: '#fff' },
  username: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  tierBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  tierText: { fontSize: 13, fontWeight: '700' },
  scoreBar: {
    width: '80%', height: 8, backgroundColor: '#e2e8f0',
    borderRadius: 4, overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scoreLabel: { fontSize: 13, color: '#64748b' },
  stats: {
    flexDirection: 'row', backgroundColor: '#f8fafc',
    borderRadius: 16, padding: 20, gap: 0, width: '100%',
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#e2e8f0' },
  settingsBtn: {
    width: '100%', padding: 16, backgroundColor: '#f1f5f9',
    borderRadius: 14, alignItems: 'center',
  },
  settingsBtnText: { fontSize: 15, fontWeight: '600', color: '#334155' },
});
