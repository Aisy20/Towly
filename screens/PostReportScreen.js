// ─── POST REPORT SCREEN ───────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput
} from 'react-native';
import { Colors, Shadow, Categories } from '../theme';

export function PostReportScreen({ navigate }) {
  const [selectedCat, setSelectedCat] = useState('infrastructure');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigate('Map')}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Post a Report</Text>
      </View>
      <ScrollView style={s.form} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.label}>CATEGORY</Text>
        <View style={s.catGrid}>
          {Categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                s.catOption,
                selectedCat === cat.id && { borderColor: Colors.green, backgroundColor: Colors.greenLight },
              ]}
              onPress={() => setSelectedCat(cat.id)}
            >
              <Text style={s.catEmoji}>{cat.emoji}</Text>
              <Text style={s.catName}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>WHAT'S HAPPENING?</Text>
        <TextInput
          style={s.textArea}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what you see... be specific and factual."
          placeholderTextColor={Colors.gray}
        />

        <Text style={s.label}>PHOTO (OPTIONAL)</Text>
        <TouchableOpacity style={s.photoUpload}>
          <Text style={{ fontSize: 28 }}>📷</Text>
          <Text style={s.photoText}>Tap to add a photo</Text>
        </TouchableOpacity>

        <Text style={s.label}>LOCATION (AUTO-DETECTED)</Text>
        <View style={s.locationBar}>
          <Text>📍</Text>
          <Text style={s.locationText}>Maple St & 3rd Ave · Zip 11201</Text>
        </View>

        <TouchableOpacity style={s.submitBtn} onPress={() => navigate('Success')} activeOpacity={0.85}>
          <Text style={s.submitText}>Post Report →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PostReportScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', ...Shadow.small,
  },
  backText: { fontSize: 18, color: Colors.dark },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark },
  form: { flex: 1, paddingHorizontal: 20 },
  label: {
    fontSize: 11, fontWeight: '700', color: Colors.gray,
    letterSpacing: 1, marginBottom: 10, marginTop: 20,
  },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  catOption: {
    width: '30%', aspectRatio: 1, borderRadius: 16,
    backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', gap: 6, ...Shadow.small,
  },
  catEmoji: { fontSize: 24 },
  catName: { fontSize: 12, fontWeight: '600', color: Colors.dark },
  textArea: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    fontSize: 15, color: Colors.dark, borderWidth: 1.5, borderColor: Colors.border,
    minHeight: 110, textAlignVertical: 'top', ...Shadow.small,
  },
  photoUpload: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 24,
    alignItems: 'center', borderWidth: 2, borderColor: Colors.border,
    borderStyle: 'dashed', gap: 8,
  },
  photoText: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
  locationBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  locationText: { fontSize: 14, color: Colors.dark, fontWeight: '500' },
  submitBtn: {
    backgroundColor: Colors.green, borderRadius: 18, paddingVertical: 18,
    alignItems: 'center', marginTop: 28, ...Shadow.small,
  },
  submitText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
});
