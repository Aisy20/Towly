import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import type { Report } from '@townly/shared';
import { colors, spacing, layout } from '@/theme';
import { ReportSheetContent } from './ReportSheetContent';
import type { LatLng } from '../../lib/geo';

/**
 * Native report-detail bottom sheet. Uses @gorhom/bottom-sheet (already a repo
 * dependency; GestureHandlerRootView + reanimated are configured in App.tsx) so
 * it slides up OVER the map with a peek/expand gesture instead of replacing the
 * screen. Controlled by `report` — non-null opens it, null closes it.
 */
export interface ReportDetailSheetProps {
  report: Report | null;
  center: LatLng | null;
  onClose: () => void;
  onOpenEvidence: () => void;
  onOpenHelp: () => void;
  onToast: (message: string) => void;
}

export function ReportDetailSheet({ report, center, onClose, onOpenEvidence, onOpenHelp, onToast }: ReportDetailSheetProps) {
  const snapPoints = useMemo(() => ['55%', '92%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  return (
    <BottomSheet
      index={report ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
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
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: colors.surface, borderRadius: 26 },
  handle: { backgroundColor: colors.border, width: 42 },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.xl * 3,
  },
});
