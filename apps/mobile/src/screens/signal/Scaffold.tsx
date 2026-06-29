import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { colors, layout, spacing } from '@/theme';
import { AppHeader } from '@/components/ui';

/**
 * Shared screen scaffold for the Signal shells: locked #F6F7F8 background, a
 * standard AppHeader, and a scrolling content area with the screen's horizontal
 * padding. Keeps every shell visually consistent while real screens are built.
 */
export interface ScaffoldProps {
  title?: string;
  showWordmark?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  scroll?: boolean;
  children?: React.ReactNode;
}

export function Scaffold({ title, showWordmark, onBack, right, scroll = true, children }: ScaffoldProps) {
  const Body = scroll ? ScrollView : View;
  return (
    <View style={styles.screen}>
      <AppHeader title={title} showWordmark={showWordmark} onBack={onBack} right={right} />
      <Body
        style={styles.body}
        contentContainerStyle={scroll ? styles.content : undefined}
      >
        {children}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, paddingHorizontal: layout.screenPaddingH },
  content: { paddingBottom: spacing.xl * 2, gap: spacing.md },
});
