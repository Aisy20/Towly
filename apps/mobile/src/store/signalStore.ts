import { create } from 'zustand';

/**
 * Client-only report signals that have no server field yet (follow, attending).
 * Kept in Sets so toggles are idempotent and survive the sheet opening/closing.
 * When backend endpoints land, swap these for real mutations.
 */
type SignalSet = 'followed' | 'attending';

interface SignalStoreState {
  followed: Set<string>;
  attending: Set<string>;
  toggle: (set: SignalSet, reportId: string) => void;
}

export const useSignalStore = create<SignalStoreState>((set) => ({
  followed: new Set(),
  attending: new Set(),
  toggle: (which, reportId) =>
    set((s) => {
      const next = new Set(s[which]);
      if (next.has(reportId)) next.delete(reportId);
      else next.add(reportId);
      return { [which]: next } as Pick<SignalStoreState, SignalSet>;
    }),
}));
