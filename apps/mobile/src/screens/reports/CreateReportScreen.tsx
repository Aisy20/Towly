import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCategory, CATEGORY_META } from '@townly/shared';
import { useMapStore } from '../../store/mapStore';
import { useCreateReport } from '../../api/reports';

export function CreateReportScreen() {
  const navigation = useNavigation();
  const { userLocation } = useMapStore();
  const { mutate: createReport, isPending } = useCreateReport();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [photo, setPhoto] = useState<{ uri: string; base64?: string } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) setPhoto({ uri: result.assets[0].uri });
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) setPhoto({ uri: result.assets[0].uri });
  };

  const handleSubmit = () => {
    if (!category || !title.trim() || !description.trim() || !userLocation) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('lat', String(userLocation.lat));
    formData.append('lng', String(userLocation.lng));

    if (photo) {
      const filename = photo.uri.split('/').pop() ?? 'photo.jpg';
      const ext = filename.split('.').pop()?.toLowerCase();
      formData.append('photo', { uri: photo.uri, name: filename, type: `image/${ext}` } as any);
    }

    createReport(formData, {
      onSuccess: () => {
        navigation.goBack();
        Alert.alert('Posted!', 'Your report is now live on the map.');
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.response?.data?.error ?? 'Failed to post report');
      },
    });
  };

  // Step 1: Category picker
  if (step === 1) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.stepTitle}>What's happening?</Text>
        <View style={styles.categoryGrid}>
          {(Object.keys(CATEGORY_META) as ReportCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTile, { borderColor: meta.color }]}
                onPress={() => { setCategory(cat); setStep(2); }}
              >
                <Text style={styles.categoryEmoji}>{meta.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: meta.color }]}>{meta.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // Step 2: Photo
  if (step === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>Add a photo</Text>
        <Text style={styles.stepSub}>Optional but helps neighbors understand the situation.</Text>

        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.previewPhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera-outline" size={48} color="#94a3b8" />
          </View>
        )}

        <TouchableOpacity style={styles.secondaryBtn} onPress={takePhoto}>
          <Text style={styles.secondaryBtnText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={pickPhoto}>
          <Text style={styles.secondaryBtnText}>Choose from Library</Text>
        </TouchableOpacity>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
            <Text style={styles.nextText}>{photo ? 'Next' : 'Skip'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 3: Title + description
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepTitle}>Describe it</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Brief title (e.g. Broken streetlight on Elm St)"
        value={title}
        onChangeText={setTitle}
        maxLength={120}
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="More details for your neighbors…"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={1000}
        textAlignVertical="top"
      />

      {!userLocation && (
        <Text style={styles.locationWarning}>
          Location not available — please enable location access.
        </Text>
      )}

      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => setStep(2)}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, (isPending || !userLocation) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending || !userLocation}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Post Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  stepSub: { fontSize: 14, color: '#64748b' },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryTile: {
    width: '46%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
  },
  categoryEmoji: { fontSize: 32 },
  categoryLabel: { fontSize: 14, fontWeight: '700' },
  previewPhoto: { width: '100%', height: 200, borderRadius: 12 },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  secondaryBtn: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#334155' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 100 },
  locationWarning: { fontSize: 13, color: '#ef4444' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  back: { fontSize: 15, color: '#64748b' },
  nextBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  submitBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
