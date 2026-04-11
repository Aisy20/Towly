import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { CREDIBILITY_TIERS } from '@townly/shared';
import { useEvidence, useAddEvidence } from '../../api/reports';

interface Props {
  reportId: string;
  evidenceCount: number;
}

function getCredibilityTier(score: number) {
  return CREDIBILITY_TIERS.find((t) => score >= t.min) ?? CREDIBILITY_TIERS[CREDIBILITY_TIERS.length - 1];
}

export function EvidenceSection({ reportId, evidenceCount }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: evidence, isLoading } = useEvidence(reportId);
  const { mutate: addEvidence, isPending } = useAddEvidence();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const handleSubmit = () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('photo', {
      uri: selectedImage,
      type: 'image/jpeg',
      name: 'evidence.jpg',
    } as any);
    if (caption.trim()) {
      formData.append('caption', caption.trim());
    }

    addEvidence(
      { reportId, formData },
      {
        onSuccess: () => {
          setModalVisible(false);
          setCaption('');
          setSelectedImage(null);
          Alert.alert('Added!', 'Your evidence has been attached to this report.');
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.error ?? 'Could not upload evidence');
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerLeft}>
          <Ionicons name="camera-outline" size={18} color="#8b5cf6" />
          <Text style={styles.headerText}>
            Corroborating Evidence{evidenceCount > 0 ? ` (${evidenceCount})` : ''}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#94a3b8"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#8b5cf6" style={{ padding: 16 }} />
          ) : evidence && evidence.length > 0 ? (
            evidence.map((item) => {
              const tier = getCredibilityTier(item.user.credibilityScore);
              return (
                <View key={item.id} style={styles.evidenceCard}>
                  <Image source={{ uri: item.photoUrl }} style={styles.evidencePhoto} resizeMode="cover" />
                  {item.caption && (
                    <Text style={styles.evidenceCaption}>{item.caption}</Text>
                  )}
                  <View style={styles.evidenceMeta}>
                    <Text style={styles.evidenceUser}>
                      @{item.user.username}
                    </Text>
                    <Text style={[styles.evidenceTier, { color: tier.color }]}>
                      {tier.label}
                    </Text>
                    <Text style={styles.evidenceTime}>
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>
              No corroborating evidence yet. Add a photo to verify this report.
            </Text>
          )}

          <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
            <Ionicons name="add-circle-outline" size={18} color="#8b5cf6" />
            <Text style={styles.addBtnText}>Add Evidence Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upload modal */}
      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Corroborating Evidence</Text>

          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewPhoto} resizeMode="cover" />
          )}

          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption (optional)"
            value={caption}
            onChangeText={setCaption}
            maxLength={300}
            multiline
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => { setModalVisible(false); setSelectedImage(null); setCaption(''); }}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isPending}
            >
              <Text style={styles.submitText}>{isPending ? 'Uploading...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#faf5ff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e9d5ff',
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
  body: { borderTopWidth: 1, borderTopColor: '#e9d5ff', padding: 12, gap: 12 },
  evidenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  evidencePhoto: { width: '100%', height: 180 },
  evidenceCaption: {
    fontSize: 13,
    color: '#334155',
    padding: 10,
    paddingBottom: 4,
  },
  evidenceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    paddingTop: 4,
  },
  evidenceUser: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  evidenceTier: { fontSize: 10, fontWeight: '500' },
  evidenceTime: { fontSize: 11, color: '#94a3b8', marginLeft: 'auto' },
  emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 8 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#ede9fe',
    borderRadius: 10,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#8b5cf6' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  previewPhoto: { width: '100%', height: 200, borderRadius: 12 },
  captionInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    alignItems: 'center',
  },
  cancel: { fontSize: 15, color: '#64748b' },
  submitBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
