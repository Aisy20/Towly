/**
 * Category-specific structured actions for the report-detail sheet. Townly never
 * shows a generic "Like / Comment" row — each category surfaces the signals that
 * actually make sense for it. Each action maps to a `kind` that the sheet renders
 * and wires to the right behavior (vote, help flow, evidence flow, resolution…).
 */
import type { Ionicons } from '@expo/vector-icons';
import type { ReportCategory } from '@townly/shared';

export type ActionKind =
  | 'confirm' // positive vote — the 12⇄13 toggle
  | 'notThere' // negative vote
  | 'resolve' // opens the resolution flow (author/resolver only)
  | 'evidence' // opens the evidence flow
  | 'help' // opens the help thread / offer
  | 'follow' // local follow toggle
  | 'share' // share an update
  | 'signal'; // lightweight local toggle (e.g. "attending", "need this too")

export interface ReportAction {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  kind: ActionKind;
  /** The single most prominent action for the category. */
  primary?: boolean;
}

const SAFETY_INFRA: ReportAction[] = [
  { key: 'confirm', label: 'Confirm', icon: 'checkmark-circle', kind: 'confirm', primary: true },
  { key: 'notThere', label: 'Not there', icon: 'close-circle', kind: 'notThere' },
  { key: 'cleared', label: 'Report cleared', icon: 'sparkles', kind: 'resolve' },
  { key: 'evidence', label: 'Add evidence', icon: 'camera', kind: 'evidence' },
  { key: 'follow', label: 'Follow', icon: 'notifications', kind: 'follow' },
  { key: 'help', label: 'Offer help', icon: 'hand-left', kind: 'help' },
];

const ANIMALS: ReportAction[] = [
  { key: 'seen', label: 'Seen here', icon: 'eye', kind: 'confirm', primary: true },
  { key: 'owner', label: 'Owner found', icon: 'heart', kind: 'resolve' },
  { key: 'sighting', label: 'Add sighting', icon: 'camera', kind: 'evidence' },
  { key: 'transport', label: 'Offer transport', icon: 'car', kind: 'help' },
  { key: 'supplies', label: 'Offer supplies', icon: 'cube', kind: 'help' },
  { key: 'follow', label: 'Follow', icon: 'notifications', kind: 'follow' },
];

const COMMUNITY: ReportAction[] = [
  { key: 'helpful', label: 'Helpful', icon: 'thumbs-up', kind: 'confirm', primary: true },
  { key: 'attending', label: 'Attending', icon: 'calendar', kind: 'signal' },
  { key: 'share', label: 'Share update', icon: 'share-social', kind: 'share' },
  { key: 'followOrganizer', label: 'Follow organizer', icon: 'notifications', kind: 'follow' },
];

const HELP: ReportAction[] = [
  { key: 'canHelp', label: 'I can help', icon: 'hand-left', kind: 'help', primary: true },
  { key: 'needToo', label: 'Need this too', icon: 'add-circle', kind: 'confirm' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done', kind: 'resolve' },
  { key: 'share', label: 'Share update', icon: 'share-social', kind: 'share' },
  { key: 'follow', label: 'Follow', icon: 'notifications', kind: 'follow' },
];

export const CATEGORY_ACTIONS: Record<ReportCategory, ReportAction[]> = {
  SAFETY: SAFETY_INFRA,
  INFRASTRUCTURE: SAFETY_INFRA,
  ANIMALS,
  COMMUNITY,
  HELP,
};

/** Resolution reasons offered when an authorized resolver closes a report. */
export const RESOLUTION_REASONS: Record<ReportCategory, { key: string; label: string }[]> = {
  SAFETY: [
    { key: 'cleared', label: 'Cleared / resolved' },
    { key: 'handled', label: 'Handled by city' },
    { key: 'duplicate', label: 'Duplicate' },
    { key: 'not_there', label: "Wasn't there" },
  ],
  INFRASTRUCTURE: [
    { key: 'fixed', label: 'Fixed' },
    { key: 'reported', label: 'Reported to city' },
    { key: 'duplicate', label: 'Duplicate' },
    { key: 'not_there', label: "Wasn't there" },
  ],
  ANIMALS: [
    { key: 'owner_found', label: 'Owner found' },
    { key: 'safe', label: 'Animal is safe' },
    { key: 'moved_on', label: 'Moved on' },
    { key: 'duplicate', label: 'Duplicate' },
  ],
  COMMUNITY: [
    { key: 'ended', label: 'Event ended' },
    { key: 'updated', label: 'Details updated' },
    { key: 'duplicate', label: 'Duplicate' },
  ],
  HELP: [
    { key: 'completed', label: 'Completed' },
    { key: 'no_longer', label: 'No longer needed' },
    { key: 'duplicate', label: 'Duplicate' },
  ],
};
