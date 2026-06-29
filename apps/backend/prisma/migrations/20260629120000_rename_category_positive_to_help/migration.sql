-- Rename ReportCategory enum value POSITIVE -> HELP.
--
-- Reconciles the data model with the locked Townly design system, whose fifth
-- category is "Help". `ALTER TYPE ... RENAME VALUE` (PostgreSQL 10+) renames the
-- label in place, preserving every existing row that already uses it — no data
-- migration or backfill required.
ALTER TYPE "ReportCategory" RENAME VALUE 'POSITIVE' TO 'HELP';
