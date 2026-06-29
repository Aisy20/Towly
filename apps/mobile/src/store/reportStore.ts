import { create } from 'zustand';
import type { Report } from '@townly/shared';

/**
 * Normalized, real-time report store — the single source of truth shared by the
 * map pins and the nearby-report list. Reports are keyed by id so WebSocket
 * events can patch one entry in place (add, vote, archive) without refetching
 * the whole geo-window. The initial fetch hydrates it via `upsertMany`; live
 * events mutate it incrementally.
 *
 * Windowing (radius + category + active-status) is applied at read time by the
 * selectors in `screens/home/home.data.ts`, so a shrinking radius simply hides
 * entries rather than dropping them from memory.
 */
interface ReportStoreState {
  byId: Record<string, Report>;
  /** Merge a fetched page/window into the store (does not evict existing). */
  upsertMany: (reports: Report[]) => void;
  /** Insert or replace a single report (e.g. a new nearby report over WS). */
  upsertOne: (report: Report) => void;
  /** Patch the denormalized vote tallies for one report. */
  patchVote: (
    reportId: string,
    v: { netScore: number; upvotes: number; downvotes: number },
  ) => void;
  /** Increment a denormalized count (help offers / evidence). */
  bumpCount: (reportId: string, field: 'helpOffersCount' | 'evidenceCount') => void;
  /** Mark a report archived (drops from the map/list, still counts as resolved). */
  archive: (reportId: string, archivedAt: string) => void;
  remove: (reportId: string) => void;
  clear: () => void;
}

export const useReportStore = create<ReportStoreState>((set) => ({
  byId: {},

  upsertMany: (reports) =>
    set((s) => {
      if (reports.length === 0) return s;
      const byId = { ...s.byId };
      for (const r of reports) byId[r.id] = { ...byId[r.id], ...r };
      return { byId };
    }),

  upsertOne: (report) =>
    set((s) => ({ byId: { ...s.byId, [report.id]: { ...s.byId[report.id], ...report } } })),

  patchVote: (reportId, v) =>
    set((s) => {
      const r = s.byId[reportId];
      if (!r) return s;
      return { byId: { ...s.byId, [reportId]: { ...r, ...v } } };
    }),

  bumpCount: (reportId, field) =>
    set((s) => {
      const r = s.byId[reportId];
      if (!r) return s;
      return { byId: { ...s.byId, [reportId]: { ...r, [field]: (r[field] ?? 0) + 1 } } };
    }),

  archive: (reportId, archivedAt) =>
    set((s) => {
      const r = s.byId[reportId];
      if (!r) return s;
      return { byId: { ...s.byId, [reportId]: { ...r, status: 'ARCHIVED', archivedAt } } };
    }),

  remove: (reportId) =>
    set((s) => {
      if (!s.byId[reportId]) return s;
      const next = { ...s.byId };
      delete next[reportId];
      return { byId: next };
    }),

  clear: () => set({ byId: {} }),
}));
