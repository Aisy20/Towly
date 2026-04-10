import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export function SignInScreen() {
  const navigation = useNavigation<any>();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email: email.trim(), password });
      await setAuth(data.user, data.accessToken, data.refreshToken);
    } catch (err: any) {
      Alert.alert('Sign In Failed', err?.response?.data?.error ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Welcome back</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Your password"
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, gap: 12, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569' },
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
    padding: 14, fontSize: 15, backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#22c55e', padding: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { fontSize: 14, color: '#3b82f6', textAlign: 'center', marginTop: 8 },
});
