import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView
} from 'react-native';
import { Colors, Shadow, Badges } from '../theme';

const RECENT_REPORTS = [
  { emoji: '🔠', bg: '#FEF0EB', title: 'Pothole on Maple Ave', meta: '2 days ago · 18 upvotes · Verified ✓' },
  { emoji: '🐾', bg: '#FEF6E7', title: 'Lost cat – found & reunited!', meta: '1 week ago · 31 upvotes · Resolved ✓' },
  { emoji: '🌿', bg: '#E8F5EE', title: 'Free furniture on curb – Oak St', meta: '2 weeks ago · 24 upvotes · Archived' },
];

const MY_BADGES = ['block_captain', 'trusted_reporter'];

export default function ProfileScreen({ navigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>😊</Text>
          </View>
          <Text style={styles.name}>NeighborJay</Text>
          <View style={styles.zipPill}>
            <Text style={styles.zipText}>📍 Zip 11201 · Brooklyn, NY</Text>
          </View>
          <Text style={styles.since}>Member since Jan 2025 · ID Verified ✓</Text>
        </View>

        {/* Credibility */}
        <View style={styles.credCard}>
          <Text style={styles.credLabel}>CREDIBILITY SCORE</Text>
          <Text style={styles.credScore}>78</Text>
          <View style={styles.credBarBg}>
            <View style={[styles.credBarFill, { width: '78%' }]} />
          </View>
          <Text style={styles.credSub}>Trusted Reporter · 94% of your reports verified ✓</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { num: '23', label: 'REPORTS' },
            { num: '8', label: 'HELPED' },
            { num: '142', label: 'UPVOTES' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statNum}>{stat.num}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* My Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY BADGES</Text>
          <View style={styles.badgesRow}>
            {Badges.map((badge) => {
              const earned = MY_BADGES.includes(badge.id);
              return (
                <View key={badge.id} style={[styles.badgeCard, !earned && styles.badgeCardLocked]}>
                  <View style={[styles.badgeIcon, { backgroundColor: earned ? badge.bg : Colors.border }]}>
                    <Text style={[styles.badgeEmoji, !earned && { opacity: 0.3 }]}>{badge.emoji}</Text>
                  </View>
                  <Text style={[styles.badgeLabel, { color: earned ? badge.color : Colors.gray }]}>
                    {badge.label}
                  </Text>
                  {!earned && <Text style={styles.badgeLock}>🔒</Text>}
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT REPORTS</Text>
          {RECENT_REPORTS.map((report, i) => (
            <View key={i} style={styles.reportRow}>
              <View style={[styles.reportIcon, { backgroundColor: report.bg }]}>
                <Text style={styles.reportEmoji}>{report.emoji}</Text>
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportMeta}>{report.meta}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('Map')}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
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
    alignItems: 'center', paddingTop: 32, paddingBottom: 24,
    paddingHorizontal: 24, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, ...Shadow.small,
  },
  avatarEmoji: { fontSize: 40 },
  name: { fontSize: 24, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  zipPill: {
    backgroundColor: Colors.greenLight, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 6,
  },
  zipText: { fontSize: 13, color: Colors.green, fontWeight: '600' },
  since: { fontSize: 13, color: Colors.gray },
  credCard: {
    margin: 16, backgroundColor: Colors.green, borderRadius: 20,
    padding: 20, ...Shadow.small,
  },
  credLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 4 },
  credScore: { fontSize: 52, fontWeight: '700', color: Colors.white, lineHeight: 60 },
  credBarBg: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginVertical: 10,
  },
  credBarFill: { height: 8, backgroundColor: Colors.white, borderRadius: 4 },
  credSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 10,
  },
  statBox: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16,
    padding: 16, alignItems: 'center', ...Shadow.small,
  },
  statNum: { fontSize: 26, fontWeight: '700', color: Colors.dark },
  statLabel: { fontSize: 10, fontWeight: '700', color: Colors.gray, letterSpacing: 0.5, marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.gray,
    letterSpacing: 1, marginBottom: 12,
  },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: {
    width: '29%', backgroundColor: Colors.white, borderRadius: 16,
    padding: 12, alignItems: 'center', ...Shadow.small,
  },
  badgeCardLocked: { opacity: 0.6 },
  badgeIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  badgeEmoji: { fontSize: 22 },
  badgeLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
  badgeLock: { fontSize: 12, marginTop: 4 },
  reportRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginBottom: 8, ...Shadow.small,
  },
  reportIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  reportEmoji: { fontSize: 20 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
  reportMeta: { fontSize: 12, color: Colors.gray },
  bottomNav: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navIcon: { fontSize: 22, marginBottom: 2 },
  navLabel: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  navLabelActive: { color: Colors.green, fontWeight: '700' },
});
