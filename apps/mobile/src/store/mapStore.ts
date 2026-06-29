import { create } from 'zustand';
import { ReportCategory } from '@townly/shared';
import type { SortMode } from '../screens/home/home.data';

/** Radius bounds for the Home stepper: 0.4 km → 2.0 km in 0.2 km steps. */
export const RADIUS_MIN_M = 400;
export const RADIUS_MAX_M = 2000;
export const RADIUS_STEP_M = 200;
const RADIUS_DEFAULT_M = 800;

const clampRadius = (m: number) =>
  Math.min(RADIUS_MAX_M, Math.max(RADIUS_MIN_M, Math.round(m / RADIUS_STEP_M) * RADIUS_STEP_M));

const ALL_CATEGORIES: ReportCategory[] = ['SAFETY', 'INFRASTRUCTURE', 'ANIMALS', 'COMMUNITY', 'HELP'];

interface MapState {
  radiusMeters: number;
  activeCategories: ReportCategory[] | null; // null = all
  userLocation: { lat: number; lng: number } | null;
  /** Home view mode — false = map, true = nearby list. */
  listMode: boolean;
  sortMode: SortMode;
  selectedReportId: string | null;

  setRadius: (meters: number) => void;
  /** Step the radius by ±RADIUS_STEP_M, clamped to [min, max]. */
  stepRadius: (direction: 1 | -1) => void;
  canStepRadius: (direction: 1 | -1) => boolean;
  toggleCategory: (cat: ReportCategory) => void;
  setAllCategories: () => void;
  setUserLocation: (lat: number, lng: number) => void;
  setListMode: (on: boolean) => void;
  setSortMode: (mode: SortMode) => void;
  setSelectedReport: (id: string | null) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  radiusMeters: RADIUS_DEFAULT_M,
  activeCategories: null,
  userLocation: null,
  listMode: false,
  sortMode: 'priority',
  selectedReportId: null,

  setRadius: (meters) => set({ radiusMeters: clampRadius(meters) }),

  stepRadius: (direction) =>
    set((s) => ({ radiusMeters: clampRadius(s.radiusMeters + direction * RADIUS_STEP_M) })),

  canStepRadius: (direction) => {
    const next = get().radiusMeters + direction * RADIUS_STEP_M;
    return next >= RADIUS_MIN_M && next <= RADIUS_MAX_M;
  },

  toggleCategory: (cat) => {
    const current = get().activeCategories;
    if (current === null) {
      set({ activeCategories: ALL_CATEGORIES.filter((c) => c !== cat) });
    } else if (current.includes(cat)) {
      const next = current.filter((c) => c !== cat);
      set({ activeCategories: next.length === 0 ? null : next });
    } else {
      const next = [...current, cat];
      set({ activeCategories: next.length === ALL_CATEGORIES.length ? null : next });
    }
  },

  setAllCategories: () => set({ activeCategories: null }),

  setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),

  setListMode: (on) => set({ listMode: on }),

  setSortMode: (mode) => set({ sortMode: mode }),

  setSelectedReport: (id) => set({ selectedReportId: id }),
}));
