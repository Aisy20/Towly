# Townly

> Your neighborhood, live.

Townly is a hyperlocal, real-time community reporting app. Neighbors post geotagged reports — safety incidents, infrastructure issues, lost animals, community notices, and positive happenings — that appear live on a map for anyone nearby. The community keeps reports trustworthy by up/downvoting, offering help, and adding photo evidence, while a credibility system rewards accurate reporters. Reports auto-archive after 48 hours to keep the map focused on what's happening *now*.

## Features

- **Live map** — geotagged reports rendered as category-colored pins, scoped to a configurable radius (500 ft → 2 mi).
- **Five report categories** — Safety 🔴, Infrastructure 🟠, Animals 🐾, Community 📢, Positive 💚.
- **Real-time updates** — new nearby reports, votes, and help offers stream over WebSockets.
- **Community trust** — upvote/downvote reports, offer help, and attach photo evidence.
- **Credibility scores** — reporters earn a score (and tier, e.g. *Trusted Neighbor*) based on how accurate their past reports were.
- **Push notifications** — nearby reports, votes on your reports, help offers, and archive events.
- **Auto-archiving** — reports archive automatically 48 hours after posting via a scheduled job.

## Tech stack

**Backend** — [Fastify](https://fastify.dev), [Prisma](https://www.prisma.io) + PostgreSQL (with PostGIS), [Redis](https://redis.io) (ioredis), JWT auth, WebSockets, [Cloudinary](https://cloudinary.com) for image uploads, [Zod](https://zod.dev) validation, `node-cron` for jobs.

**Mobile** — [Expo](https://expo.dev) / React Native, React Navigation, `react-native-maps`, [TanStack Query](https://tanstack.com/query), [Zustand](https://github.com/pmndrs/zustand), React Hook Form, Expo Location / Camera / Notifications / Secure Store.

**Shared** — TypeScript types and constants shared between backend and mobile.

## Monorepo layout

This is an npm-workspaces monorepo:

```
Towly/
├── apps/
│   ├── backend/          # Fastify + Prisma API server
│   │   ├── prisma/       # schema.prisma + migrations
│   │   └── src/
│   │       ├── config/   # env, database, redis
│   │       ├── plugins/  # auth, websocket
│   │       ├── modules/  # auth, reports, votes, help, evidence, notifications, websocket
│   │       ├── lib/       # haversine, credibility, cloudinary
│   │       └── jobs/     # archiveReports cron job
│   └── mobile/           # Expo / React Native app
│       └── src/          # navigation, screens, components, hooks, api, store
├── packages/
│   └── shared/           # shared TS types + constants (@townly/shared)
├── screens/              # legacy single-file Expo mockup (see note below)
└── App.js                # entry for the legacy mockup
```

> **Note on the legacy mockup:** the root-level `App.js`, `screens/`, and `theme.js` are an earlier standalone prototype that wires the screens together with simple local state. The actively developed app lives in `apps/mobile`. The root `npm start` runs the legacy mockup.

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL with the PostGIS extension
- Redis
- A [Cloudinary](https://cloudinary.com) account (for photo uploads)
- [Expo Go](https://expo.dev/go) on your phone, or an iOS/Android simulator

### Install

```bash
npm install
```

This installs dependencies for all workspaces.

### Backend setup

1. Create an env file at `apps/backend/.env`:

   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/townly
   REDIS_URL=redis://localhost:6379
   JWT_ACCESS_SECRET=<at least 32 characters>
   JWT_REFRESH_SECRET=<at least 32 characters>
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CORS_ORIGIN=*
   ```

2. Generate the Prisma client and run migrations:

   ```bash
   npm run db:generate --workspace @townly/backend
   npm run db:migrate  --workspace @townly/backend
   ```

3. Start the API server (hot-reload):

   ```bash
   npm run dev --workspace @townly/backend
   ```

   The server listens on `http://localhost:3000`. Health check: `GET /health`.

### Mobile setup

```bash
npm run start --workspace @townly/mobile   # or: android / ios / web
```

Scan the QR code with Expo Go, or press `i` / `a` for a simulator. Point the app's API client at your backend (and set a Google Maps API key in `app.json` for native map builds).

## API

Base path: `/api/v1`

| Module     | Prefix                       | Responsibility                               |
|------------|------------------------------|----------------------------------------------|
| Auth       | `/api/v1/auth`               | Sign up / sign in, JWT access + refresh tokens |
| Reports    | `/api/v1/reports`            | Create/list/fetch reports (geo-queried)      |
| Votes      | `/api/v1/reports`            | Upvote / downvote                            |
| Help       | `/api/v1/reports`            | Offer help on a report                       |
| Evidence   | `/api/v1/reports`            | Attach photo evidence                        |
| WebSocket  | (plugin)                     | Real-time broadcast of nearby activity       |

Rate limited to 100 requests/minute; uploads capped at 10 MB.

## Data model

Core Prisma models: **User** (with `credibilityScore`, report stats, push token, notify radius), **Report** (category, geo-coordinates, vote tallies, status, 48h archive), **Vote**, **HelpOffer**, **Evidence**, **Notification**, and **RefreshToken**.

Enums: `ReportCategory` (SAFETY, INFRASTRUCTURE, ANIMALS, COMMUNITY, POSITIVE), `ReportStatus` (ACTIVE, ARCHIVED, REMOVED), `NotificationType` (NEW_NEARBY_REPORT, VOTE_ON_MY_REPORT, HELP_OFFERED, REPORT_ARCHIVED).

## Useful scripts

**Backend** (`apps/backend`)

| Script              | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Start with hot-reload (`tsx watch`)  |
| `npm run build`     | Compile TypeScript                   |
| `npm run start`     | Run compiled server                  |
| `npm run db:migrate`| Run Prisma migrations                |
| `npm run db:generate`| Regenerate Prisma client            |
| `npm run db:studio` | Open Prisma Studio                   |

**Mobile** (`apps/mobile`)

| Script           | Description                |
|------------------|----------------------------|
| `npm run start`  | Start Expo dev server      |
| `npm run ios`    | Open in iOS simulator      |
| `npm run android`| Open in Android emulator   |
| `npm run web`    | Run in the browser         |
