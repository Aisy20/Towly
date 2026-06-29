import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TownlyLogo } from '@/components/ui';

export function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <TownlyLogo size={72} accessibilityLabel="Townly" />
        <Text style={styles.title}>Townly</Text>
        <Text style={styles.subtitle}>
          Real-time updates for your block.{'\n'}Know what's happening right outside.
        </Text>
      </View>

      <View style={styles.features}>
        {[
          ['🔴', 'Safety alerts for your street'],
          ['🟠', 'Infrastructure issues nearby'],
          ['🐾', 'Lost pets & stray animals'],
          ['📢', 'Community announcements'],
          ['💚', 'Neighbors offering help'],
        ].map(([emoji, text]) => (
          <View key={text} style={styles.feature}>
            <Text style={styles.featureEmoji}>{emoji}</Text>
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.primaryText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.secondaryText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 28, justifyContent: 'space-between' },
  hero: { alignItems: 'center', paddingTop: 60, gap: 12 },
  icon: { fontSize: 64 },
  title: { fontSize: 36, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24 },
  features: { gap: 14 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureEmoji: { fontSize: 22, width: 32 },
  featureText: { fontSize: 15, color: '#334155' },
  actions: { gap: 16, alignItems: 'center' },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryText: { fontSize: 14, color: '#64748b' },
});
