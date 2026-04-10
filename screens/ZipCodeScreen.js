import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform, Switch
} from 'react-native';
import { Colors, Shadow } from '../theme';

const POPULAR_ZIPS = ['11201', '10001', '10002', '11211', '11215'];

export default function ZipCodeScreen({ navigate }) {
  const [primaryZip, setPrimaryZip] = useState('');
  const [extraZips, setExtraZips] = useState([]);
  const [addingExtra, setAddingExtra] = useState(false);
  const [extraInput, setExtraInput] = useState('');
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const addExtraZip = () => {
    if (extraInput.length === 5 && extraZips.length < 2) {
      setExtraZips([...extraZips, extraInput]);
      setExtraInput('');
      setAddingExtra(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigate('VerifyID')}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={[styles.stepLine, styles.stepLineDone]} />
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={[styles.stepLine, styles.stepLineDone]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.title}>Your zip code</Text>
          <Text style={styles.sub}>
            You'll only see reports from your zip code. You can follow up to 3 zip codes total
            (home, work, kids' school etc.)
          </Text>

          {/* Primary zip */}
          <Text style={styles.label}>PRIMARY ZIP CODE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 11201"
            placeholderTextColor={Colors.gray}
            keyboardType="number-pad"
            maxLength={5}
            value={primaryZip}
            onChangeText={setPrimaryZip}
          />

          {/* Popular zips */}
          <Text style={styles.label}>POPULAR IN YOUR AREA</Text>
          <View style={styles.popularRow}>
            {POPULAR_ZIPS.map((z) => (
              <TouchableOpacity
                key={z}
                style={[styles.zipChip, primaryZip === z && styles.zipChipActive]}
                onPress={() => setPrimaryZip(z)}
              >
                <Text style={[styles.zipChipText, primaryZip === z && styles.zipChipTextActive]}>
                  {z}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Extra zips */}
          {extraZips.length > 0 && (
            <>
              <Text style={styles.label}>ALSO FOLLOWING</Text>
              {extraZips.map((z, i) => (
                <View key={i} style={styles.extraZipRow}>
                  <Text style={styles.extraZipText}>📍 {z}</Text>
                  <TouchableOpacity onPress={() => setExtraZips(extraZips.filter((_, idx) => idx !== i))}>
                    <Text style={styles.removeText}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Add extra zip */}
          {extraZips.length < 2 && (
            <>
              {addingExtra ? (
                <View style={styles.extraInputRow}>
                  <TextInput
                    style={styles.extraInput}
                    placeholder="Enter zip code"
                    placeholderTextColor={Colors.gray}
                    keyboardType="number-pad"
                    maxLength={5}
                    value={extraInput}
                    onChangeText={setExtraInput}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={addExtraZip}>
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAddingExtra(false); setExtraInput(''); }}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addZipBtn} onPress={() => setAddingExtra(true)}>
                  <Text style={styles.addZipBtnText}>+ Add another zip code</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Weekly digest */}
          <View style={styles.digestCard}>
            <View style={styles.digestText}>
              <Text style={styles.digestTitle}>📬 Weekly Neighborhood Digest</Text>
              <Text style={styles.digestSub}>
                Every Sunday at 8am — top 5 reports from your zip, resolved issues, and community highlights.
              </Text>
            </View>
            <Switch
              value={weeklyDigest}
              onValueChange={setWeeklyDigest}
              trackColor={{ false: Colors.border, true: Colors.green }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, !primaryZip && styles.btnDisabled]}
            onPress={() => primaryZip && navigate('Map')}
            activeOpacity={primaryZip ? 0.85 : 1}
          >
            <Text style={styles.btnText}>Enter Townly →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', ...Shadow.small,
  },
  backText: { fontSize: 18, color: Colors.dark },
  stepIndicator: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.green, width: 12, height: 12, borderRadius: 6 },
  stepDotDone: { backgroundColor: Colors.green },
  stepLine: { width: 24, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: Colors.green },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
  sub: { fontSize: 15, color: Colors.gray, lineHeight: 22, marginBottom: 28 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.gray, letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: Colors.white, borderRadius: 16, paddingHorizontal: 18,
    paddingVertical: 16, fontSize: 18, fontWeight: '600', color: Colors.dark,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 20, ...Shadow.small,
  },
  popularRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  zipChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
  },
  zipChipActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  zipChipText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
  zipChipTextActive: { color: Colors.white },
  extraZipRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  extraZipText: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  removeText: { fontSize: 13, color: Colors.red, fontWeight: '600' },
  extraInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  extraInput: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16,
    borderWidth: 1.5, borderColor: Colors.green, color: Colors.dark,
  },
  addBtn: { backgroundColor: Colors.green, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  addBtnText: { color: Colors.white, fontWeight: '700' },
  cancelBtn: { paddingHorizontal: 8 },
  cancelBtnText: { color: Colors.gray, fontWeight: '600' },
  addZipBtn: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.green, borderStyle: 'dashed', marginBottom: 20,
  },
  addZipBtnText: { color: Colors.green, fontSize: 15, fontWeight: '600' },
  digestCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    ...Shadow.small, gap: 12,
  },
  digestText: { flex: 1 },
  digestTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  digestSub: { fontSize: 13, color: Colors.gray, lineHeight: 18 },
  btn: {
    backgroundColor: Colors.green, borderRadius: 18, paddingVertical: 18,
    alignItems: 'center', ...Shadow.small,
  },
  btnDisabled: { backgroundColor: Colors.border },
  btnText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
});
