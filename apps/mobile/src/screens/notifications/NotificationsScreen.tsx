import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@townly/shared';
import { apiClient } from '../../api/client';

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ notifications: Notification[] }>('/notifications');
      return data.notifications;
    },
  });

  const { mutate: markRead } = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.patch('/notifications/read', { ids });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handlePress = (n: Notification) => {
    if (!n.read) markRead([n.id]);
    if (n.reportId) navigation.navigate('ReportDetail', { id: n.reportId });
  };

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} color="#22c55e" />;
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(n) => n.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.empty}>No notifications yet. They'll appear when something happens nearby.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, !item.read && styles.unread]}
          onPress={() => handlePress(item)}
        >
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemBody}>{item.body}</Text>
            <Text style={styles.itemTime}>
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </Text>
          </View>
          {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 8 },
  item: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  unread: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  itemContent: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  itemBody: { fontSize: 13, color: '#64748b' },
  itemTime: { fontSize: 11, color: '#94a3b8' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginTop: 4 },
  empty: { textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 80, paddingHorizontal: 32 },
});
