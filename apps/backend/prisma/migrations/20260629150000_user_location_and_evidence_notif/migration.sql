-- Opt-in user location for "new nearby report" push fan-out. Nullable: only set
-- once a user shares their location, and compared against each report's point
-- within the user's notifyRadius. Plus a dedicated EVIDENCE_ADDED notification
-- type (evidence notifications previously reused NEW_NEARBY_REPORT).

ALTER TABLE "User" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "longitude" DOUBLE PRECISION;

-- PostgreSQL 12+: ADD VALUE may run in a migration transaction as long as the
-- new value is not used in the same transaction (it is not here).
ALTER TYPE "NotificationType" ADD VALUE 'EVIDENCE_ADDED';
