import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVoteReport } from '../../api/reports';

interface Props {
  reportId: string;
  upvotes: number;
  downvotes: number;
  userVote?: 1 | -1 | null;
}

export function VoteButtons({ reportId, upvotes, downvotes, userVote }: Props) {
  const { mutate: vote, isPending } = useVoteReport();

  const handleVote = (value: 1 | -1) => {
    if (isPending) return;
    vote({ reportId, value: userVote === value ? (value * -1) as 1 | -1 : value });
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={() => handleVote(1)}>
        <Ionicons
          name={userVote === 1 ? 'thumbs-up' : 'thumbs-up-outline'}
          size={18}
          color={userVote === 1 ? '#22c55e' : '#64748b'}
        />
        <Text style={[styles.count, userVote === 1 && styles.activeUp]}>{upvotes}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => handleVote(-1)}>
        <Ionicons
          name={userVote === -1 ? 'thumbs-down' : 'thumbs-down-outline'}
          size={18}
          color={userVote === -1 ? '#ef4444' : '#64748b'}
        />
        <Text style={[styles.count, userVote === -1 && styles.activeDown]}>{downvotes}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  count: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  activeUp: { color: '#22c55e' },
  activeDown: { color: '#ef4444' },
});
