import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Report, CATEGORY_META } from '@townly/shared';
import { VoteButtons } from './VoteButtons';
import { HelpButton } from './HelpButton';
import { ArchiveCountdown } from './ArchiveCountdown';

interface Props {
  report: Report;
  onClose: () => void;
  onViewFull: () => void;
}

export function ReportDetailSheet({ report, onClose, onViewFull }: Props) {
  const meta = CATEGORY_META[report.category];

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: meta.color + '20' }]}>
            <Text style={[styles.categoryText, { color: meta.color }]}>
              {meta.emoji} {meta.label}
            </Text>
          </View>
          <ArchiveCountdown createdAt={report.createdAt} />
        </View>

        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{report.description}</Text>

        {report.photoUrl && (
          <Image source={{ uri: report.photoUrl }} style={styles.photo} resizeMode="cover" />
        )}

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            @{report.author.username} · {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
          </Text>
          {report.address && <Text style={styles.address}>{report.address}</Text>}
        </View>

        <View style={styles.actions}>
          <VoteButtons
            reportId={report.id}
            upvotes={report.upvotes}
            downvotes={report.downvotes}
            userVote={report.userVote}
          />
          <HelpButton reportId={report.id} helpOffersCount={report.helpOffersCount} />
          <TouchableOpacity style={styles.viewFull} onPress={onViewFull}>
            <Text style={styles.viewFullText}>View Full</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  description: { fontSize: 14, color: '#475569', lineHeight: 20 },
  photo: { width: '100%', height: 160, borderRadius: 10 },
  meta: { gap: 2 },
  metaText: { fontSize: 12, color: '#94a3b8' },
  address: { fontSize: 12, color: '#64748b' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  viewFull: {
    marginLeft: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  viewFullText: { fontSize: 13, fontWeight: '600', color: '#334155' },
});
