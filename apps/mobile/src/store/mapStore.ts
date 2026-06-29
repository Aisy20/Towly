import { create } from 'zustand';
import { ReportCategory } from '@townly/shared';
import { DEFAULT_RADIUS_METERS } from '@townly/shared';

interface MapState {
  radiusMeters: number;
  activeCategories: ReportCategory[] | null; // null = all
  userLocation: { lat: number; lng: number } | null;
  setRadius: (meters: number) => void;
  toggleCategory: (cat: ReportCategory) => void;
  setAllCategories: () => void;
  setUserLocation: (lat: number, lng: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  radiusMeters: DEFAULT_RADIUS_METERS,
  activeCategories: null,
  userLocation: null,

  setRadius: (meters) => set({ radiusMeters: meters }),

  toggleCategory: (cat) => {
    const current = get().activeCategories;
    if (current === null) {
      // Was "all" — now switch to just this one deselected
      const all: ReportCategory[] = ['SAFETY', 'INFRASTRUCTURE', 'ANIMALS', 'COMMUNITY', 'HELP'];
      set({ activeCategories: all.filter((c) => c !== cat) });
    } else if (current.includes(cat)) {
      const next = current.filter((c) => c !== cat);
      set({ activeCategories: next.length === 0 ? null : next });
    } else {
      const next = [...current, cat];
      set({ activeCategories: next.length === 5 ? null : next });
    }
  },

  setAllCategories: () => set({ activeCategories: null }),

  setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
}));
