import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, TextInput, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHelpReport } from '../../api/reports';

interface Props {
  reportId: string;
  helpOffersCount: number;
}

export function HelpButton({ reportId, helpOffersCount }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const { mutate: offerHelp, isPending } = useHelpReport();

  const handleSubmit = () => {
    offerHelp(
      { reportId, message: message.trim() || undefined },
      {
        onSuccess: () => {
          setModalVisible(false);
          setMessage('');
          Alert.alert('Sent!', 'The neighbor has been notified you can help.');
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.error ?? 'Could not send offer');
        },
      },
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)}>
        <Ionicons name="hand-left-outline" size={16} color="#3b82f6" />
        <Text style={styles.text}>
          I Can Help{helpOffersCount > 0 ? ` (${helpOffersCount})` : ''}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Offer to Help</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a message (optional)"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={300}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, isPending && styles.sendBtnDisabled]}
                onPress={handleSubmit}
                disabled={isPending}
              >
                <Text style={styles.sendText}>{isPending ? 'Sending…' : 'Send'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  text: { fontSize: 13, color: '#3b82f6', fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, alignItems: 'center' },
  cancel: { fontSize: 15, color: '#64748b' },
  sendBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
