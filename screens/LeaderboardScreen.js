import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, FlatList
} from 'react-native';
import { Colors, Shadow, Badges } from '../theme';

const LEADERBOARD = [
  { rank: 1, username: 'NeighborJay', score: 78, reports: 23, helped: 8, badges: ['block_captain', 'trusted_reporter'] },
  { rank: 2, username: 'MapleStreetMom', score: 71, reports: 18, helped: 12, badges: ['good_samaritan'] },
  { rank: 3, username: 'BrooklynWatcher', score: 65, reports: 15, helped: 4, badges: ['trusted_reporter'] },
  { rank: 4, username: 'OakStNeighbor', score: 58, reports: 12, helped: 6, badges: [] },
  { rank: 5, username: 'ParkSlopePat', score: 52, reports: 10, helped: 3, badges: ['first_responder'] },
  { rank: 6, username: 'BlockCaptain99', score: 47, reports: 8, helped: 5, badges: [] },
  { rank: 7, username: 'QuietCornerKid', score: 41, reports: 7, helped: 2, badges: [] },
];

const RANK_COLORS = { 1: '#F5A623', 2: '#8A8A9A', 3: '#CD7F32' };
const RANK_EMOJIS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardScreen({ navigate }) {
  const [activeTab, setActiveTab] = useState('monthly');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('Map')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Zip badge */}
        <View style={styles.zipBadge}>
          <Text style={styles.zipText}>📍 Zip Code 11201 · Brooklyn, NY</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['weekly', 'monthly', 'all time'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top 3 podium */}
        <View style={styles.podium}>
          {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((user) => {
            const isFirst = user.rank === 1;
            return (
              <View key={user.rank} style={[styles.podiumItem, isFirst && styles.podiumItemFirst]}>
                <Text style={styles.podiumEmoji}>{RANK_EMOJIS[user.rank]}</Text>
                <View style={[styles.podiumAvatar, { borderColor: RANK_COLORS[user.rank] }]}>
                  <Text style={styles.podiumAvatarText}>{user.username.charAt(0)}</Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{user.username}</Text>
                <Text style={[styles.podiumScore, { color: RANK_COLORS[user.rank] }]}>
                  {user.score} pts
                </Text>
              </View>
            );
          })}
        </View>

        {/* Full ranked list */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>FULL RANKINGS</Text>
          {LEADERBOARD.map((user) => {
            const badgesInfo = Badges.filter((b) => user.badges.includes(b.id));
            return (
              <View key={user.rank} style={styles.rankRow}>
                <View style={[
                  styles.rankNum,
                  user.rank <= 3 && { backgroundColor: RANK_COLORS[user.rank] },
                ]}>
                  <Text style={[styles.rankNumText, user.rank <= 3 && { color: Colors.white }]}>
                    {user.rank}
                  </Text>
                </View>
                <View style={styles.rankAvatar}>
                  <Text style={styles.rankAvatarText}>{user.username.charAt(0)}</Text>
                </View>
                <View style={styles.rankInfo}>
                  <Text style={styles.rankName}>{user.username}</Text>
                  <View style={styles.rankMeta}>
                    <Text style={styles.rankStat}>{user.reports} reports</Text>
                    <Text style={styles.rankDot}>·</Text>
                    <Text style={styles.rankStat}>{user.helped} helped</Text>
                    {badgesInfo.slice(0, 2).map((b) => (
                      <Text key={b.id} style={styles.rankBadge}>{b.emoji}</Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.rankScore}>{user.score}</Text>
              </View>
            );
          })}
        </View>

        {/* Badge directory */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>EARN BADGES</Text>
          {Badges.map((badge) => (
            <View key={badge.id} style={styles.badgeDirectoryRow}>
              <View style={[styles.badgeDirIcon, { backgroundColor: badge.bg }]}>
                <Text style={styles.badgeDirEmoji}>{badge.emoji}</Text>
              </View>
              <View style={styles.badgeDirInfo}>
                <Text style={[styles.badgeDirLabel, { color: badge.color }]}>{badge.label}</Text>
                <Text style={styles.badgeDirDesc}>{badge.description}</Text>
                <Text style={styles.badgeDirReq}>Requirement: {badge.requirement}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('Map')}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Leaders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 18, color: Colors.dark },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark },
  zipBadge: {
    margin: 16, backgroundColor: Colors.white, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'center',
    ...Shadow.small,
  },
  zipText: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 20,
    backgroundColor: Colors.white, borderRadius: 16, padding: 4, ...Shadow.small,
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12,
  },
  tabActive: { backgroundColor: Colors.dark },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  tabTextActive: { color: Colors.white },
  podium: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    marginHorizontal: 16, marginBottom: 24, gap: 12,
  },
  podiumItem: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 18, padding: 12, ...Shadow.small,
  },
  podiumItemFirst: { paddingTop: 20, marginBottom: -8 },
  podiumEmoji: { fontSize: 24, marginBottom: 6 },
  podiumAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.greenLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 6,
  },
  podiumAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  podiumName: { fontSize: 11, fontWeight: '700', color: Colors.dark, textAlign: 'center' },
  podiumScore: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  listSection: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.gray,
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: 14, padding: 12,
    marginBottom: 8, ...Shadow.small,
  },
  rankNum: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  rankNumText: { fontSize: 13, fontWeight: '700', color: Colors.gray },
  rankAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.greenLight,
    alignItems: 'center', justifyContent: 'center',
  },
  rankAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  rankMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rankStat: { fontSize: 12, color: Colors.gray },
  rankDot: { fontSize: 12, color: Colors.gray },
  rankBadge: { fontSize: 14 },
  rankScore: { fontSize: 18, fontWeight: '700', color: Colors.green },
  badgeDirectoryRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginBottom: 8, ...Shadow.small,
  },
  badgeDirIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeDirEmoji: { fontSize: 24 },
  badgeDirInfo: { flex: 1 },
  badgeDirLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  badgeDirDesc: { fontSize: 13, color: Colors.dark, lineHeight: 18, marginBottom: 4 },
  badgeDirReq: { fontSize: 12, color: Colors.gray },
  bottomNav: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navIcon: { fontSize: 22, marginBottom: 2 },
  navLabel: { fontSize: 11, color: Colors.gray, fontWeight: '500' },
  navLabelActive: { color: Colors.green, fontWeight: '700' },
});
