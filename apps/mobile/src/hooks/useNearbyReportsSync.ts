import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import { useReportStore } from '../store/reportStore';
import { useNearbyReports } from '../api/reports';
import { useLocation } from './useLocation';
import { useDebouncedValue } from './useDebouncedValue';
import { buildDevReports, DEFAULT_CENTER } from '../screens/home/devSeed';
import type { LatLng } from '../lib/geo';

const RADIUS_DEBOUNCE_MS = 400;

export interface NearbyReportsSyncResult {
  /** Center used for distance/windowing — the user's location or a dev fallback. */
  center: LatLng | null;
  isLoading: boolean;
  isError: boolean;
  /** True when the geo-window query is paused (no location yet). */
  isWaitingForLocation: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  /** Whether the visible reports came from the dev seed rather than the API. */
  usingDevData: boolean;
}

/**
 * Loads the nearby-report geo-window and hydrates the normalized report store
 * that the map and list both read from. The radius is debounced before it
 * drives the query, while the live (un-debounced) radius still scales the halo.
 *
 * In development with no backend reachable, it seeds a small sample dataset so
 * the Home screen is fully verifiable.
 */
export function useNearbyReportsSync(): NearbyReportsSyncResult {
  const radiusMeters = useMapStore((s) => s.radiusMeters);
  const activeCategories = useMapStore((s) => s.activeCategories);
  const userLocation = useMapStore((s) => s.userLocation);
  const upsertMany = useReportStore((s) => s.upsertMany);

  // Requests foreground permission and keeps `mapStore.userLocation` populated.
  useLocation();

  const debouncedRadius = useDebouncedValue(radiusMeters, RADIUS_DEBOUNCE_MS);

  const lat = userLocation?.lat ?? null;
  const lng = userLocation?.lng ?? null;

  const query = useNearbyReports(lat, lng, debouncedRadius, activeCategories ?? undefined);

  const apiReports = query.data?.pages.flatMap((p) => p.reports) ?? [];

  // Hydrate the store whenever fresh API data arrives.
  useEffect(() => {
    if (apiReports.length > 0) upsertMany(apiReports);
  }, [query.data, upsertMany]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dev fallback: when no backend is reachable (no location yet, or the query
  // errored because there's no server), seed a deterministic sample dataset
  // around DEFAULT_CENTER so the Home screen is fully verifiable.
  const usingDevData =
    __DEV__ && apiReports.length === 0 && (lat === null || query.isError);

  useEffect(() => {
    if (usingDevData) upsertMany(buildDevReports(DEFAULT_CENTER));
  }, [usingDevData, upsertMany]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // In dev-seed mode the window is anchored to DEFAULT_CENTER so the sample
    // reports are always in range, regardless of the device's real location.
    center: usingDevData ? DEFAULT_CENTER : userLocation,
    isLoading: query.isLoading && !usingDevData,
    isError: query.isError && !usingDevData,
    isWaitingForLocation: lat === null && !usingDevData,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
    },
    refetch: () => query.refetch(),
    usingDevData,
  };
}
