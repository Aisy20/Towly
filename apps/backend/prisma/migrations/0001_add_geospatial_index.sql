-- Enable PostGIS if not already enabled (run once on new database)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Geospatial index on Report lat/lng for ST_DWithin queries
-- This is a GIST index on a computed geography point expression.
-- Prisma does not support expression indexes in schema.prisma, so this is managed manually.
CREATE INDEX IF NOT EXISTS report_location_gist_idx
  ON "Report"
  USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  );

-- Index for archive cron job (filter ACTIVE reports older than 48h)
CREATE INDEX IF NOT EXISTS report_archive_scan_idx
  ON "Report" (status, "createdAt")
  WHERE status = 'ACTIVE';
