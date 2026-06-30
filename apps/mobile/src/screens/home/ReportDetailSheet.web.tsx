/**
 * Web report-detail sheet. @gorhom/bottom-sheet relies on native gesture-handler
 * internals, so on web we present the same content in a slide-up RN Modal over a
 * dimmed scrim — visually a bottom sheet, no native-only dependency in the web
 * bundle. Same `ReportSheetContent`, so behavior matches the native sheet.
 */
import React from 'react';
import { Modal, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import type { Report } from '@townly/shared';
import { colors, radii, spacing, layout, shadows, palette } from '@/theme';
import { ReportSheetContent } from './ReportSheetContent';
import type { LatLng } from '../../lib/geo';

export interface ReportDetailSheetProps {
  report: Report | null;
  center: LatLng | null;
  onClose: () => void;
  onOpenEvidence: () => void;
  onOpenHelp: () => void;
  onToast: (message: string) => void;
}

export function ReportDetailSheet({ report, center, onClose, onOpenEvidence, onOpenHelp, onToast }: ReportDetailSheetProps) {
  return (
    <Modal transparent visible={!!report} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Dismiss report"
          onPress={onClose}
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {report ? (
              <ReportSheetContent
                report={report}
                center={center}
                onClose={onClose}
                onOpenEvidence={onOpenEvidence}
                onOpenHelp={onOpenHelp}
                onToast={onToast}
              />
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,16,10,0.34)' },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: spacing.sm,
    ...shadows.lg,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: palette.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.xl * 2,
  },
});
