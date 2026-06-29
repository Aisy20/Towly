import { useMemo } from 'react';
import type { Report } from '@townly/shared';
import { useMapStore } from '../../store/mapStore';
import { useReportStore } from '../../store/reportStore';
import { useNearbyReportsSync } from '../../hooks/useNearbyReportsSync';
import { useWebSocket } from '../../hooks/useWebSocket';
import { selectWindow, derivePulse, type PulseStats } from './home.data';
import type { LatLng } from '../../lib/geo';

export interface HomeView {
  center: LatLng | null;
  radiusMeters: number;
  /** Window (any status) — feeds Pulse counts. */
  windowReports: Report[];
  /** Active reports in-window — feeds map pins and the list. */
  visible: Report[];
  pulse: PulseStats;
  selectedReport: Report | null;
  isLoading: boolean;
  isError: boolean;
  isWaitingForLocation: boolean;
  usingDevData: boolean;
}

/**
 * Single source of derived Home state, shared by the native map and the web
 * list. Loads + hydrates the store, subscribes to live patches, and windows the
 * normalized reports by the active radius/categories — so pins, list, and Pulse
 * always agree.
 */
export function useHomeView(): HomeView {
  const sync = useNearbyReportsSync();
  const center = sync.center;
  const radiusMeters = useMapStore((s) => s.radiusMeters);
  const activeCategories = useMapStore((s) => s.activeCategories);
  const selectedReportId = useMapStore((s) => s.selectedReportId);
  const byId = useReportStore((s) => s.byId);

  // Live patches into the normalized store (no full-map refetch).
  useWebSocket(center?.lat ?? null, center?.lng ?? null, radiusMeters);

  const windowReports = useMemo(
    () => selectWindow(byId, { categories: activeCategories, center, radiusMeters }),
    [byId, activeCategories, center, radiusMeters],
  );
  const visible = useMemo(() => windowReports.filter((r) => r.status === 'ACTIVE'), [windowReports]);
  const pulse = useMemo(() => derivePulse(windowReports), [windowReports]);
  const selectedReport = selectedReportId ? byId[selectedReportId] ?? null : null;

  return {
    center,
    radiusMeters,
    windowReports,
    visible,
    pulse,
    selectedReport,
    isLoading: sync.isLoading,
    isError: sync.isError,
    isWaitingForLocation: sync.isWaitingForLocation,
    usingDevData: sync.usingDevData,
  };
}
