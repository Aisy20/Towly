-- Aligns a freshly-migrated database with prisma/schema.prisma. Three corrections
-- that the initial migration missed, applied in order after the enum rename:
--   1. The Evidence table was never created.
--   2. HelpOffer was created as a single-offer UNIQUE(reportId,userId) with a
--      nullable message, but the product models a multi-message help thread.
--   3. The PostGIS GIST index lived in a loose, un-timestamped .sql file that
--      `prisma migrate` does not pick up, so it was never applied.

-- Ensure PostGIS is available for the geography index below (idempotent).
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Evidence -----------------------------------------------------------------
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caption" VARCHAR(300),
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Evidence_reportId_createdAt_idx" ON "Evidence"("reportId", "createdAt");

ALTER TABLE "Evidence"
    ADD CONSTRAINT "Evidence_reportId_fkey" FOREIGN KEY ("reportId")
    REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evidence"
    ADD CONSTRAINT "Evidence_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. HelpOffer: single offer -> thread ----------------------------------------
DROP INDEX "HelpOffer_reportId_userId_key";

-- Backfill any pre-existing null messages before enforcing NOT NULL.
UPDATE "HelpOffer" SET "message" = '' WHERE "message" IS NULL;
ALTER TABLE "HelpOffer" ALTER COLUMN "message" SET NOT NULL;

CREATE INDEX "HelpOffer_reportId_createdAt_idx" ON "HelpOffer"("reportId", "createdAt");

-- 3. Geospatial indexes -------------------------------------------------------
CREATE INDEX IF NOT EXISTS "report_location_gist_idx"
    ON "Report"
    USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography);

CREATE INDEX IF NOT EXISTS "report_archive_scan_idx"
    ON "Report" (status, "createdAt")
    WHERE status = 'ACTIVE';
