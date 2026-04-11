import React from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { CATEGORY_META, CREDIBILITY_TIERS } from '@townly/shared';
import { useReport } from '../../api/reports';
import { VoteButtons } from '../../components/reports/VoteButtons';
import { ArchiveCountdown } from '../../components/reports/ArchiveCountdown';
import { HelpThread } from '../../components/reports/HelpThread';
import { EvidenceSection } from '../../components/reports/EvidenceSection';

function getCredibilityTier(score: number) {
  return CREDIBILITY_TIERS.find((t) => score >= t.min) ?? CREDIBILITY_TIERS[CREDIBILITY_TIERS.length - 1];
}

export function ReportDetailScreen() {
  const route = useRoute<any>();
  const { id } = route.params as { id: string };
  const { data: report, isLoading } = useReport(id);

  if (isLoading || !report) {
    return <ActivityIndicator style={{ flex: 1 }} color="#22c55e" />;
  }

  const meta = CATEGORY_META[report.category];
  const tier = getCredibilityTier(report.author.credibilityScore);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {report.photoUrl && (
        <Image source={{ uri: report.photoUrl }} style={styles.photo} resizeMode="cover" />
      )}

      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: meta.color + '20' }]}>
          <Text style={[styles.categoryText, { color: meta.color }]}>
            {meta.emoji} {meta.label}
          </Text>
        </View>
        <ArchiveCountdown createdAt={report.createdAt} />
      </View>

      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.description}>{report.description}</Text>

      {report.address && (
        <Text style={styles.address}>📍 {report.address}</Text>
      )}

      <View style={styles.authorRow}>
        <View style={styles.authorAvatar}>
          <Text style={styles.authorInitial}>
            {report.author.username[0].toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.authorName}>@{report.author.username}</Text>
          <Text style={[styles.authorTier, { color: tier.color }]}>{tier.label}</Text>
        </View>
        <Text style={styles.time}>
          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
        </Text>
      </View>

      <View style={styles.actions}>
        <VoteButtons
          reportId={report.id}
          upvotes={report.upvotes}
          downvotes={report.downvotes}
          userVote={report.userVote}
        />
      </View>

      {report.evidenceCount > 0 && (
        <View style={styles.trustBanner}>
          <Text style={styles.trustText}>
            {report.evidenceCount} corroborating photo{report.evidenceCount !== 1 ? 's' : ''} · {report.upvotes} upvote{report.upvotes !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <EvidenceSection reportId={report.id} evidenceCount={report.evidenceCount} />

      <HelpThread reportId={report.id} helpOffersCount={report.helpOffersCount} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14 },
  photo: { width: '100%', height: 220, borderRadius: 14, marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  categoryText: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', lineHeight: 28 },
  description: { fontSize: 15, color: '#475569', lineHeight: 22 },
  address: { fontSize: 13, color: '#64748b' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center',
  },
  authorInitial: { fontSize: 16, fontWeight: '700', color: '#fff' },
  authorName: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  authorTier: { fontSize: 11, fontWeight: '500' },
  time: { marginLeft: 'auto', fontSize: 12, color: '#94a3b8' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  trustBanner: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  trustText: { fontSize: 13, color: '#16a34a', fontWeight: '600', textAlign: 'center' },
});
