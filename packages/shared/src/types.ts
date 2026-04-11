export type ReportCategory = 'SAFETY' | 'INFRASTRUCTURE' | 'ANIMALS' | 'COMMUNITY' | 'POSITIVE';
export type ReportStatus = 'ACTIVE' | 'ARCHIVED' | 'REMOVED';
export type NotificationType = 'NEW_NEARBY_REPORT' | 'VOTE_ON_MY_REPORT' | 'HELP_OFFERED' | 'REPORT_ARCHIVED';

export interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  credibilityScore: number;
  totalReports: number;
  accurateReports: number;
  createdAt: string;
}

export interface Report {
  id: string;
  authorId: string;
  author: Pick<User, 'id' | 'username' | 'avatarUrl' | 'credibilityScore'>;
  category: ReportCategory;
  title: string;
  description: string;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  upvotes: number;
  downvotes: number;
  netScore: number;
  status: ReportStatus;
  createdAt: string;
  archivedAt: string | null;
  userVote?: 1 | -1 | null;
  helpOffersCount: number;
  evidenceCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  reportId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface HelpOffer {
  id: string;
  reportId: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl' | 'credibilityScore'>;
  message: string;
  createdAt: string;
}

export interface Evidence {
  id: string;
  reportId: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl' | 'credibilityScore'>;
  caption: string | null;
  photoUrl: string;
  createdAt: string;
}

// WebSocket message types
export type WsClientMessage =
  | { type: 'SET_BOUNDS'; payload: { lat: number; lng: number; radiusMeters: number } };

export type WsServerMessage =
  | { type: 'REPORT_CREATED'; payload: Report }
  | { type: 'REPORT_VOTE_UPDATED'; payload: { reportId: string; netScore: number; upvotes: number; downvotes: number } }
  | { type: 'REPORT_ARCHIVED'; payload: { reportId: string } }
  | { type: 'HELP_OFFERED'; payload: HelpOffer }
  | { type: 'EVIDENCE_ADDED'; payload: Evidence };
