import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { CREDIBILITY_TIERS } from '@townly/shared';
import { useHelpThread, useHelpReport } from '../../api/reports';

interface Props {
  reportId: string;
  helpOffersCount: number;
}

function getCredibilityTier(score: number) {
  return CREDIBILITY_TIERS.find((t) => score >= t.min) ?? CREDIBILITY_TIERS[CREDIBILITY_TIERS.length - 1];
}

export function HelpThread({ reportId, helpOffersCount }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const { data: offers, isLoading } = useHelpThread(reportId);
  const { mutate: offerHelp, isPending } = useHelpReport();

  const handleSend = () => {
    if (!message.trim()) return;
    offerHelp(
      { reportId, message: message.trim() },
      {
        onSuccess: () => setMessage(''),
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.error ?? 'Could not send message');
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles-outline" size={18} color="#3b82f6" />
          <Text style={styles.headerText}>
            Mutual Aid Thread{helpOffersCount > 0 ? ` (${helpOffersCount})` : ''}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#94a3b8"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.threadBody}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" style={{ padding: 16 }} />
          ) : offers && offers.length > 0 ? (
            <FlatList
              data={offers}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const tier = getCredibilityTier(item.user.credibilityScore);
                return (
                  <View style={styles.messageRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.user.username[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.messageBubble}>
                      <View style={styles.messageHeader}>
                        <Text style={styles.username}>@{item.user.username}</Text>
                        <Text style={[styles.tierBadge, { color: tier.color }]}>
                          {tier.label}
                        </Text>
                      </View>
                      <Text style={styles.messageText}>{item.message}</Text>
                      <Text style={styles.messageTime}>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          ) : (
            <Text style={styles.emptyText}>
              No one has offered help yet. Be the first!
            </Text>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Offer to help..."
              value={message}
              onChangeText={setMessage}
              maxLength={300}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!message.trim() || isPending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!message.trim() || isPending}
            >
              <Ionicons
                name="send"
                size={18}
                color={message.trim() && !isPending ? '#fff' : '#94a3b8'}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  threadBody: { borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  messageRow: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 4,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  messageBubble: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  username: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  tierBadge: { fontSize: 10, fontWeight: '500' },
  messageText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  messageTime: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 20 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
    backgroundColor: '#fff',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#e2e8f0' },
});
