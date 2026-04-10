import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../theme';

export default function SuccessScreen({ navigate }) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>Report posted!</Text>
        <Text style={styles.sub}>
          Your verified neighbors in zip 11201 have been notified.{'\n'}
          Thanks for keeping the block safe. 🏘️
        </Text>
        <View style={styles.credBox}>
          <Text style={styles.credText}>⭐ +2 credibility points earned</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => navigate('Map')}>
          <Text style={styles.btnText}>Back to Map</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.green },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  icon: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '700', color: Colors.white, marginBottom: 10 },
  sub: { fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  credBox: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 20, marginBottom: 32,
  },
  credText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  btn: {
    backgroundColor: Colors.white, borderRadius: 18, paddingVertical: 18,
    paddingHorizontal: 32, width: '100%', alignItems: 'center',
  },
  btnText: { color: Colors.green, fontSize: 16, fontWeight: '700' },
});
