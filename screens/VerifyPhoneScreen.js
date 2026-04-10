import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Colors, Shadow } from '../theme';

export default function VerifyPhoneScreen({ navigate }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigate('Onboarding')}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>
        </View>

        <View style={styles.content}>
          {step === 'phone' ? (
            <>
              <Text style={styles.emoji}>📱</Text>
              <Text style={styles.title}>Verify your phone</Text>
              <Text style={styles.sub}>
                We'll send you a one-time code to confirm your number. This keeps Townly safe for everyone.
              </Text>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={Colors.gray}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TouchableOpacity
                style={styles.btn}
                onPress={() => setStep('code')}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>Send Code →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.emoji}>🔐</Text>
              <Text style={styles.title}>Enter your code</Text>
              <Text style={styles.sub}>
                We sent a 6-digit code to {phone || '+1 (555) 000-0000'}
              </Text>
              <Text style={styles.label}>6-DIGIT CODE</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="000000"
                placeholderTextColor={Colors.gray}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
              <TouchableOpacity
                style={styles.btn}
                onPress={() => navigate('VerifyID')}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>Verify →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resendBtn} onPress={() => {}}>
                <Text style={styles.resendText}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
  stepDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.border,
  },
  stepDotActive: { backgroundColor: Colors.green, width: 12, height: 12, borderRadius: 6 },
  stepDotDone: { backgroundColor: Colors.green },
  stepLine: { width: 24, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: Colors.green },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
  sub: { fontSize: 15, color: Colors.gray, lineHeight: 22, marginBottom: 32 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.gray, letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: Colors.white, borderRadius: 16, paddingHorizontal: 18,
    paddingVertical: 16, fontSize: 16, color: Colors.dark,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 16, ...Shadow.small,
  },
  codeInput: { fontSize: 28, fontWeight: '700', letterSpacing: 8, textAlign: 'center' },
  btn: {
    backgroundColor: Colors.green, borderRadius: 18, paddingVertical: 18,
    alignItems: 'center', ...Shadow.small, marginBottom: 12,
  },
  btnText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  resendBtn: { alignItems: 'center', paddingVertical: 8 },
  resendText: { color: Colors.green, fontSize: 15, fontWeight: '600' },
});
