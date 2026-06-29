# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Townly — a hyperlocal, real-time community reporting app. Neighbors post geotagged reports (safety, infrastructure, animals, community, help) that appear live on a map within a configurable radius. Reports auto-archive after 48 hours. See `README.md` for the product overview.

## Repository layout — two app layers

This is an **npm-workspaces monorepo**, but it also contains an older standalone prototype at the root. Know which one you're touching:

- **Root `App.js` + `screens/` + `theme.js`** — a legacy single-file Expo mockup wired together with local `useState` navigation (no API, no TypeScript). The root `npm start` runs this. `screens/MapScreen.js` imports `react-native-maps`, which is **native-only and breaks the web bundle** — the root mockup cannot run on web.
- **`apps/mobile/`** — the actively developed Expo / React Native app (TypeScript). This is the real client. It has a `MapScreen.web.tsx` fallback so it *does* bundle on web.
- **`apps/backend/`** — Fastify + Prisma API server (`@townly/backend`).
- **`packages/shared/`** — `@townly/shared`: TypeScript types (`types.ts`) and constants (`constants.ts`) imported by both backend and mobile. Source-only package (no build step; `main` points at `src/index.ts`).

## Commands

Install once at the root (`npm install`) — it hydrates all workspaces.

**Backend** (`apps/backend`, run with `--workspace @townly/backend` or `cd apps/backend`):
- `npm run dev` — hot-reload server via `tsx watch` (listens on `:3000`, health check `GET /health`)
- `npm run build` / `npm run start` — compile TS / run compiled `dist`
- `npm run db:migrate` — `prisma migrate dev`
- `npm run db:generate` — regenerate Prisma client (run after editing `schema.prisma`)
- `npm run db:studio` — Prisma Studio

**Mobile** (`apps/mobile`):
- `npm run start` — Expo dev server (scan QR with Expo Go, or `i`/`a` for simulator)
- `npm run web` — run in the browser (see Metro web note below)

There is **no test suite or linter configured** in any workspace.

### Running the backend locally

Requires **PostgreSQL with the PostGIS extension**, **Redis**, and a **Cloudinary** account. `apps/backend/src/config/env.ts` validates env with Zod and **hard-exits** if anything is missing. Create `apps/backend/.env` with: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET` (≥32 chars), `JWT_REFRESH_SECRET` (≥32 chars), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. The mobile app reads `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_WS_URL` from `apps/mobile/.env` (default `http://localhost:3000`).

## Backend architecture

Fastify app assembled in `src/app.ts` (`buildApp()`): registers cors, multipart (10 MB cap), rate-limit (100/min), the auth and websocket plugins, decorates the instance with `prisma`, then mounts modules under `/api/v1`. Entry point is `src/index.ts`.

**Module pattern** — each feature in `src/modules/<name>/` splits into `*.routes.ts` (Fastify handlers), `*.service.ts` (business logic), and `*.schema.ts` (Zod validation). Modules: `auth`, `reports`, `votes`, `help`, `evidence`, `notifications`, `websocket`. Votes/help/evidence routes are all mounted under the `/api/v1/reports` prefix.

**Geospatial queries use raw SQL, not Prisma ORM.** `src/modules/reports/reports.geo.ts` runs `ST_DWithin` against a PostGIS geography expression (GiST-indexed) — Prisma cannot express this. When touching nearby-report logic, edit the raw SQL here, and note it interpolates category values into the query string.

**Real-time = Redis pub/sub → WebSocket fan-out** (the key cross-file flow):
1. A route handler mutates the DB, then `redis.publish()` to a channel in `REDIS_CHANNELS` (`config/redis.ts`).
2. `modules/websocket/ws.broadcaster.ts` (`startBroadcaster()`, run once at boot) subscribes to those channels and pushes `WsServerMessage`s to connected clients in `ws.handler.ts`'s `connections` map.
3. **New-report broadcasts are radius-filtered** per connection using `lib/haversine.ts`; votes/archive/help/evidence broadcast to all connections. Each WS connection stores the client's `lat`/`lng`/`radiusMeters`.

**Credibility** — `lib/credibility.ts` `recalculateCredibility(userId)` is called after every vote event. A report counts as "accurate" once its `netScore ≥ ACCURATE_REPORT_NET_SCORE_THRESHOLD` (from shared constants). Score = `clamp(50 + (accuracyRate − 0.5)·80 + min(totalReports·0.5, 10), 0, 100)`.

**Archiving** — `jobs/archiveReports.job.ts` is a node-cron job (every 15 min) that flips `ACTIVE` reports older than 48h to `ARCHIVED` and publishes to `REPORTS_ARCHIVED` so clients drop the pins.

**Data model** — `apps/backend/prisma/schema.prisma`: `User`, `Report`, `Vote`, `HelpOffer`, `Evidence`, `Notification`, `RefreshToken`. Postgres + PostGIS (`postgresqlExtensions` preview feature). Denormalized `upvotes`/`downvotes`/`netScore` live on `Report`.

## Mobile architecture

- **API layer** — `src/api/client.ts` is a single axios instance with interceptors that attach the access token and **auto-refresh on 401** (posts to `/auth/refresh`, retries once, clears tokens + bails on failure). Base URL from `EXPO_PUBLIC_API_URL`. Tokens persist via `src/lib/storage.ts` (Expo SecureStore; `storage.web.ts` is the web fallback).
- **State** — Zustand stores in `src/store/` (`authStore`, `mapStore`) for client state; TanStack Query for server state.
- **Real-time** — `src/hooks/useWebSocket.ts` connects to `EXPO_PUBLIC_WS_URL`; `useLocation` and `usePushNotifications` wrap Expo APIs.
- **Navigation** — React Navigation (`src/navigation/`); screens grouped by feature under `src/screens/`.
- **Platform-specific files** — `.web.tsx` / `.web.ts` variants (e.g. `MapScreen.web.tsx`, `storage.web.ts`) are how web avoids native-only modules. `metro.config.js` lists `web` in `resolver.platforms`.

### Metro web gotcha (already fixed — don't revert)

`apps/mobile/metro.config.js` sets `resolver.unstable_conditionNames = ['require', 'react-native', 'browser']`. This forces CommonJS resolution so packages shipping ESM with `import.meta` (zustand v4) don't reach the browser — Metro serves the web bundle as a classic script, and a stray `import.meta` throws "Cannot use 'import.meta' outside a module", rendering a **blank page**. If the web app goes blank, check for newly-added ESM deps that use `import.meta`.

## Known divergence

`ReportCategory` differs between layers: `packages/shared` and the mobile constants use `HELP` as the fifth category, but `apps/backend/prisma/schema.prisma`'s `ReportCategory` enum still defines `POSITIVE`. Reconcile these (Prisma migration vs. shared types) if you touch category logic.
