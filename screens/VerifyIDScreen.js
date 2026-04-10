import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView
} from 'react-native';
import { Colors, Shadow } from '../theme';

// ─── iDENFY INTEGRATION NOTE FOR DEVELOPER ───────────────────────────────────
// 1. Sign up at https://idenfy.com and get your API key
// 2. Install SDK: npm install @idenfy/react-native-sdk
// 3. Replace the mock flow below with the real iDenfy SDK call:
//
//    import { IdenfyReactNative } from '@idenfy/react-native-sdk';
//
//    const startVerification = async () => {
//      const authToken = await fetch('YOUR_BACKEND/idenfy-token', {
//        method: 'POST',
//        headers: { 'Authorization': 'Bearer YOUR_IDENFY_API_KEY' }
//      }).then(r => r.json());
//
//      const result = await IdenfyReactNative.start({ authToken });
//      if (result.status === 'APPROVED') navigate('ZipCode');
//    };
//
// iDenfy handles: ID photo capture, selfie, liveness check, document validation
// All verified data is stored securely — never shown to other users
// ─────────────────────────────────────────────────────────────────────────────

export default function VerifyIDScreen({ navigate }) {
  const [step, setStep] = useState('intro'); // 'intro' | 'scanning' | 'done'

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('VerifyPhone')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'intro' && (
          <>
            <Text style={styles.emoji}>🪪</Text>
            <Text style={styles.title}>Verify your identity</Text>
            <Text style={styles.sub}>
              To keep Townly safe and accountable, we need to verify who you are.
              Your identity is never shared with other users — only stored privately by Townly.
            </Text>

            {/* What we collect */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>What we collect:</Text>
              {[
                '🪪  Government-issued ID (passport or driver\'s license)',
                '🤳  A quick selfie to match your face',
                '📋  Your real name, DOB, and address (stored privately)',
              ].map((item, i) => (
                <Text key={i} style={styles.infoItem}>{item}</Text>
              ))}
            </View>

            {/* What we DON'T share */}
            <View style={[styles.infoCard, { backgroundColor: Colors.greenLight }]}>
              <Text style={[styles.infoTitle, { color: Colors.green }]}>What we DON'T share:</Text>
              {[
                '✅  Your real name is NEVER shown to neighbors',
                '✅  Your ID document is NEVER shown to anyone',
                '✅  You stay 100% anonymous in the community',
              ].map((item, i) => (
                <Text key={i} style={[styles.infoItem, { color: Colors.dark }]}>{item}</Text>
              ))}
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => setStep('scanning')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Start Verification →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'scanning' && (
          <>
            <Text style={styles.emoji}>📸</Text>
            <Text style={styles.title}>Scanning your ID</Text>
            <Text style={styles.sub}>
              The iDenfy SDK would launch here for real ID + selfie capture.
              For now, tap below to simulate a successful verification.
            </Text>
            <View style={styles.scanBox}>
              <Text style={styles.scanText}>[ iDenfy Camera View ]</Text>
              <Text style={styles.scanSub}>Real implementation: install @idenfy/react-native-sdk</Text>
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setStep('done')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Simulate Approved ✓</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'done' && (
          <>
            <Text style={styles.emoji}>✅</Text>
            <Text style={styles.title}>Identity verified!</Text>
            <Text style={styles.sub}>
              You're now a verified member of Townly. Your real identity is stored
              securely and will never be shared with other neighbors.
            </Text>
            <View style={[styles.infoCard, { backgroundColor: Colors.greenLight }]}>
              <Text style={[styles.infoTitle, { color: Colors.green }]}>✅ Verification complete</Text>
              <Text style={[styles.infoItem, { color: Colors.dark }]}>
                Your account is now verified. You can post reports and build credibility in your community.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigate('ZipCode')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Continue →</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  sub: { fontSize: 15, color: Colors.gray, lineHeight: 22, marginBottom: 24 },
  infoCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 20,
    marginBottom: 16, ...Shadow.small,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  infoItem: { fontSize: 14, color: Colors.gray, lineHeight: 24, marginBottom: 4 },
  scanBox: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 32,
    alignItems: 'center', marginBottom: 24, borderWidth: 2,
    borderColor: Colors.border, borderStyle: 'dashed',
  },
  scanText: { fontSize: 16, color: Colors.gray, fontWeight: '600', marginBottom: 8 },
  scanSub: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
  btn: {
    backgroundColor: Colors.green, borderRadius: 18, paddingVertical: 18,
    alignItems: 'center', ...Shadow.small, marginTop: 8,
  },
  btnText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
});
