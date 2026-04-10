import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Colors, Shadow } from '../theme';

export default function OnboardingScreen({ navigate }) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.logo}>Townly.</Text>
          <Text style={styles.tagline}>Your neighborhood, live.</Text>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🗺️</Text>
            <Text style={styles.cardTitle}>Know what's happening on your block</Text>
            <Text style={styles.cardSub}>
              Real-time reports from verified neighbors — safety, lost pets,
              infrastructure, community events and more.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🔒</Text>
            <Text style={styles.cardTitle}>Safe & verified community</Text>
            <Text style={styles.cardSub}>
              Every neighbor is verified with a real ID. You stay anonymous
              to others, but we keep the community accountable.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}>📍</Text>
            <Text style={styles.cardTitle}>Your zip code only</Text>
            <Text style={styles.cardSub}>
              Only see reports from your neighborhood.
              No city-wide noise — just your block.
            </Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => navigate('VerifyPhone')} activeOpacity={0.85}>
            <Text style={styles.btnText}>Get Started →</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing you agree to Townly's Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.green },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40, alignItems: 'center' },
  logo: { fontSize: 52, fontWeight: '700', color: Colors.white, letterSpacing: -2, marginBottom: 8 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '300', marginBottom: 40 },
  card: {
    backgroundColor: Colors.white, borderRadius: 24, padding: 24,
    width: '100%', marginBottom: 14, ...Shadow.small,
  },
  cardEmoji: { fontSize: 32, marginBottom: 10 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  cardSub: { fontSize: 14, color: Colors.gray, lineHeight: 20 },
  btn: {
    backgroundColor: Colors.dark, borderRadius: 18, paddingVertical: 18,
    paddingHorizontal: 32, width: '100%', alignItems: 'center', marginTop: 8, ...Shadow.small,
  },
  btnText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  legal: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 20, lineHeight: 18 },
});
