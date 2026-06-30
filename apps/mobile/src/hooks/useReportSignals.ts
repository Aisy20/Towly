import { useCallback, useRef } from 'react';
import type { Report } from '@townly/shared';
import { useAuthStore } from '../store/authStore';
import { useReportStore } from '../store/reportStore';
import { useSignalStore } from '../store/signalStore';
import { useVoteReport } from '../api/reports';

type Vote = 1 | -1 | null;

/** Recompute the denormalized tallies for moving a user's vote old → next. */
function voteCounts(report: Report, next: Vote) {
  const old = report.userVote ?? null;
  let upvotes = report.upvotes;
  let downvotes = report.downvotes;
  if (old === 1) upvotes--;
  else if (old === -1) downvotes--;
  if (next === 1) upvotes++;
  else if (next === -1) downvotes++;
  return { upvotes, downvotes, netScore: upvotes - downvotes };
}

/** Dev sample reports have no server row — signals stay local. */
function isDevSeed(report: Report) {
  return report.id.startsWith('seed-');
}

export interface ReportSignals {
  isAuthor: boolean;
  canResolve: boolean;
  confirmed: boolean;
  confirmCount: number;
  notThere: boolean;
  notThereCount: number;
  following: boolean;
  attending: boolean;
  resolved: boolean;
  pending: boolean;
  toggleConfirm: () => void;
  toggleNotThere: () => void;
  toggleFollow: () => void;
  toggleAttending: () => void;
  resolve: (reason: string, note: string, notifyFollowers: boolean) => void;
}

/**
 * All report-signal state + handlers for the detail sheet.
 *
 * Confirm / Not-there are a single mutually-exclusive vote (so conflicting
 * signals can't coexist). Taps update the normalized store optimistically and
 * roll back if the API rejects. Authors can't vote on their own report; the
 * in-flight guard keeps the mutation idempotent under rapid taps.
 */
export function useReportSignals(report: Report): ReportSignals {
  const user = useAuthStore((s) => s.user);
  const upsertOne = useReportStore((s) => s.upsertOne);
  const archive = useReportStore((s) => s.archive);
  const vote = useVoteReport();
  const followed = useSignalStore((s) => s.followed);
  const attending = useSignalStore((s) => s.attending);
  const toggleSignal = useSignalStore((s) => s.toggle);

  const inFlight = useRef(false);

  const isAuthor = !!user && report.authorId === user.id;
  const confirmed = report.userVote === 1;
  const notThere = report.userVote === -1;

  const applyVote = useCallback(
    (next: Vote) => {
      if (isAuthor) return; // authors can't confirm their own report
      if (inFlight.current) return; // ignore double-submits — keeps mutation idempotent

      const snapshot = report;
      upsertOne({ ...report, ...voteCounts(report, next), userVote: next });

      // No server row (dev seed) or clearing a vote (no unvote endpoint yet):
      // keep the optimistic local state.
      if (isDevSeed(report) || next === null) return;

      inFlight.current = true;
      vote.mutate(
        { reportId: report.id, value: next },
        {
          onError: () => upsertOne(snapshot), // roll back
          onSettled: () => {
            inFlight.current = false;
          },
        },
      );
    },
    [report, isAuthor, upsertOne, vote],
  );

  const toggleConfirm = useCallback(
    () => applyVote(confirmed ? null : 1),
    [applyVote, confirmed],
  );
  const toggleNotThere = useCallback(
    () => applyVote(notThere ? null : -1),
    [applyVote, notThere],
  );

  const resolve = useCallback(
    (_reason: string, _note: string, _notifyFollowers: boolean) => {
      // Preserve the report in history as ARCHIVED (drops from the live map/list
      // but still counts as resolved). A real resolver endpoint would persist the
      // reason / note / notification fanout.
      archive(report.id, new Date().toISOString());
    },
    [archive, report.id],
  );

  return {
    isAuthor,
    canResolve: isAuthor, // no dedicated resolver role in the model yet
    confirmed,
    confirmCount: report.upvotes,
    notThere,
    notThereCount: report.downvotes,
    following: followed.has(report.id),
    attending: attending.has(report.id),
    resolved: report.status !== 'ACTIVE',
    pending: vote.isPending,
    toggleConfirm,
    toggleNotThere,
    toggleFollow: () => toggleSignal('followed', report.id),
    toggleAttending: () => toggleSignal('attending', report.id),
    resolve,
  };
}
