# Townly Signal UI — Implementation Plan

Status: **planning + foundation landed**
Scope of this document: a complete audit of the production mobile app and a
sequenced plan to re-skin it to the locked "Signal" design system, without
losing existing functionality and without touching the legacy root prototype.

This plan reflects the **real repository structure** as of the audit. Paths are
relative to the monorepo root `/`.

---

## 1. Current production mobile architecture

Three packages make up the product:

- `apps/mobile` — Expo / React Native app (SDK 54, React 19, RN 0.81)
- `apps/backend` — Fastify / Prisma / PostgreSQL + PostGIS API
- `packages/shared` — shared TypeScript types, Zod-free constants, enums

### 1.1 App entry & providers
- `apps/mobile/index.js` → `registerRootComponent(App)`.
- `apps/mobile/App.tsx` wraps the tree in `GestureHandlerRootView` →
  `SafeAreaProvider` → `QueryClientProvider` → `RootNavigator`.
- **Fonts:** `App.tsx` now loads Space Grotesk (4 weights) via
  `@expo-google-fonts/space-grotesk` and gates render until the font is ready
  (foundation work, this step).
- TanStack Query client: `queries { retry: 1, staleTime: 30_000 }`,
  `mutations { retry: 0 }`.

### 1.2 Navigation (`apps/mobile/src/navigation/`)
- `RootNavigator.tsx` — native-stack **auth gate**. Calls `restoreAuth()` on
  mount; shows a spinner while `isLoading`. If `user` is null → `Welcome`,
  `SignUp`, `SignIn`. If authenticated → the `App` screen (`AppNavigator`).
- `AppNavigator.tsx` — **bottom tab navigator** (the tab-bar host) with nested
  stacks:
  - `MapTab` → stack: `Map` (`MapScreen`), `ReportDetail` (`ReportDetailScreen`)
  - `Post` → `CreateReportScreen` (tab title "Report")
  - `Notifications` → `NotificationsScreen`
  - `ProfileTab` → stack: `Profile` (`ProfileScreen`), `Settings` (`SettingsScreen`)
  - Active tint `#22c55e`, inactive `#94a3b8`, Ionicons per tab.
  - `usePushNotifications()` is invoked here (must run inside the
    NavigationContainer after auth).

### 1.3 State management (Zustand, `apps/mobile/src/store/`)
- `authStore.ts` (`useAuthStore`) — `{ user, accessToken, refreshToken, isLoading }`
  + `setAuth / clearAuth / restoreAuth / updateUser`. Persists to
  `lib/storage.ts` (native: `expo-secure-store`) / `lib/storage.web.ts`
  (web: `localStorage`) under keys `townly_access_token`, `townly_refresh_token`,
  `townly_user`.
- `mapStore.ts` (`useMapStore`) — `{ radiusMeters, activeCategories | null,
  userLocation }` + `setRadius / toggleCategory / setAllCategories /
  setUserLocation`. `activeCategories === null` means "all". Ephemeral (no
  persistence).

### 1.4 Data layer (`apps/mobile/src/api/`, `src/hooks/`)
- `api/client.ts` (`apiClient`) — Axios, base `${EXPO_PUBLIC_API_URL}/api/v1`,
  10s timeout. Request interceptor attaches `Bearer` token; response
  interceptor refreshes on 401 via `/auth/refresh` and retries.
- `api/reports.ts` — TanStack Query hooks + `reportKeys` factory:
  `useNearbyReports` (infinite), `useReport`, `useMyReports`, `useCreateReport`,
  `useVoteReport` (optimistic), `useHelpReport`, `useHelpThread`, `useEvidence`,
  `useAddEvidence`.
- Hooks: `useLocation` (foreground permission + watch, writes to mapStore),
  `useWebSocket(lat,lng,radius)` (live cache updates, auto-reconnect),
  `usePushNotifications` (Expo push token registration + tap → `ReportDetail`).

### 1.5 Design system foundation (landed this step, `apps/mobile/src/theme/`)
- `colors.ts` — `palette`, semantic `colors`, `categoryPalette`,
  enum-keyed `categoryColor`.
- `typography.ts` — Space Grotesk `fontFamily`, `fontWeight`, `fontSize`,
  `letterSpacing`, named `textVariants`.
- `spacing.ts` — `spacing` (6/8/12/16/18), `layout` (screen padding, 44px touch
  target), `hitSlop`.
- `radii.ts` — `radii` (control/card/large/pill).
- `shadows.ts` — soft `sm/md/lg` elevation tokens.
- `index.ts` — barrel + aggregate `theme`. Imported via the new `@/*` path alias.
- Brand: `src/components/brand/Brandmark.tsx` (Sprout icon via `react-native-svg`)
  and `Wordmark.tsx` (icon + "Townly" in Space Grotesk).

### 1.6 Brand assets (`apps/mobile/assets/brand/`)
`townly-icon.svg`, `townly-icon-ondark.svg`, `townly-mark-{black,slate,white}.svg`,
`townly-wordmark.svg`, `townly-wordmark-white.svg`, and `townly-icon-1024.png`
(the Expo app icon, rendered from the SVG; iOS icon + Android adaptive
foreground, slate background).

---

## 2. Legacy files that must NOT receive new implementation

The repository **root** holds a separate, self-contained legacy Expo prototype.
It must be left untouched; do not port new Signal UI into it. It uses
hand-rolled `useState` navigation (no React Navigation) and a local `theme.js`.

Do not implement in:
- `/App.js` (root)
- `/theme.js` (root)
- `/app.json` (root — the production manifest is `apps/mobile/app.json`)
- `/screens/` — `OnboardingScreen.js`, `VerifyPhoneScreen.js`, `VerifyIDScreen.js`,
  `ZipCodeScreen.js`, `MapScreen.js`, `PostReportScreen.js`, `SuccessScreen.js`,
  `ProfileScreen.js`, `LeaderboardScreen.js`.

These are kept only as a **functionality reference** (see §6.2). New work happens
exclusively under `apps/mobile/`.

---

## 3. Components that can be reused

Reuse with **restyling only** (logic/structure portable; swap inline hex →
theme tokens, apply product language):

| Area | File | Reuse note |
| --- | --- | --- |
| Map pin | `src/components/map/ReportPin.tsx` | Already delegates color to `CATEGORY_META`; restyle pin shape to Signal teardrop. |
| Archive countdown | `src/components/reports/ArchiveCountdown.tsx` | Minimal; retheme 3 state colors → `safety/infra/muted`. |
| Notifications list | `src/screens/notifications/NotificationsScreen.tsx` | Simple FlatList; restyle cards + unread dot. |
| Profile | `src/screens/profile/ProfileScreen.tsx` | Map "Credibility" → "Standing"; restyle bars. |
| Settings | `src/screens/profile/SettingsScreen.tsx` | Category toggles already use `CATEGORY_META`; restyle. |
| Create report | `src/screens/reports/CreateReportScreen.tsx` | 3-step flow portable; restyle + duplicate-detection step (later). |
| Vote control | `src/components/reports/VoteButtons.tsx` | Logic + optimistic hook reusable; relabel to **Confirm / Not there**. |
| Help | `HelpButton.tsx`, `HelpThread.tsx` | Hooks reusable; relabel to **Offer help**. |
| Evidence | `EvidenceSection.tsx` | Hooks reusable; relabel to **Add evidence**. |

Reuse **as-is** (no UI change required): the entire data layer (`api/`, `hooks/`),
both Zustand stores, `lib/storage*`, and all navigation wiring.

---

## 4. Components that need replacement

Full visual rebuild to match the Signal prototype (logic/queries preserved):

- `src/screens/map/MapScreen.tsx` — rebuild as the Signal map: wordmark header,
  **Neighborhood Pulse** strip, category filter chips, themed pins, radius
  control, safety callout card. Keep `react-native-maps`, `useNearbyReports`,
  `useLocation`, `useWebSocket`, `mapStore`.
- `src/screens/map/MapScreen.web.tsx` — rebuild the web fallback list to match.
- `src/components/reports/ReportDetailSheet.tsx` — rebuild as the Signal bottom
  sheet (Confirm / Not there / Add evidence / Offer help, evidence + help thread,
  archive countdown). Consider `@gorhom/bottom-sheet` (already a dependency).
- `src/screens/reports/ReportDetailScreen.tsx` — restructure to the Signal detail
  layout; reuse child components once they are reskinned.
- `src/screens/auth/WelcomeScreen.tsx` — replace the `🏘️` emoji hero with
  `<Wordmark/>` / `<Brandmark/>`; restyle feature list with category tokens.
- `SignInScreen.tsx`, `SignUpScreen.tsx` — restyle inputs/buttons to tokens; add
  the Brandmark.

Product-language replacements required during rebuild (currently generic/social):
Upvote→**Confirm**, Downvote→**Not there**, "I Can Help"→**Offer help**, generic
"evidence"→**Add evidence**, "Mutual Aid Thread"→help thread, Trending→
**Neighborhood Pulse**, "Credibility"→**Standing**.

---

## 5. Navigation changes

The navigator topology is sound and stays. Planned, contained changes:

- **Tab bar restyle** (`AppNavigator.tsx`): replace `#22c55e`/`#94a3b8` literals
  with `colors.brand` / `colors.textMuted`; use the Signal "Pulse / Map / + /
  Alerts / You" labeling and a center FAB-style create action. Tab structure and
  route names unchanged to avoid breaking deep links / push-tap navigation
  (`usePushNotifications` navigates to `ReportDetail`).
- **Header branding**: introduce `<Wordmark/>` (wide headers) / `<Brandmark/>`
  (compact) instead of text titles.
- **Map detail presentation**: keep the `ReportDetail` stack route for the full
  screen, but drive the quick-look via the rebuilt `ReportDetailSheet` from the
  map (matches prototype).
- No new routes are required for the re-skin. Legacy-only flows (phone/ID
  verification, ZIP onboarding, leaderboard — §6.2) are **out of scope** for the
  re-skin and tracked separately.

---

## 6. State-management changes

### 6.1 Minimal changes expected
- **No store API changes** are required to re-skin. `mapStore` already models
  radius + category filters + user location; `authStore` already models the
  session.
- Possible **additive** map UI state (local component state or a small slice):
  selected report id for the sheet, "list vs map" toggle, pulse summary
  expansion. Prefer component state unless shared across screens.
- Reduced-motion / dynamic-type preferences: read from RN APIs at the component
  level; no global store needed initially.

### 6.2 Legacy functionality to preserve (not yet in `apps/mobile`)
Catalogued from the root prototype so nothing is silently dropped. These are
**future product scope**, not part of the Signal re-skin:
- Phone verification (SMS + 6-digit code)
- ID verification (iDenfy-style government ID + selfie/liveness)
- ZIP-code onboarding (primary + up to 2 followed ZIPs, weekly digest)
- Leaderboard / rankings + badge directory
- Onboarding intro carousel
- Success confirmation screen after posting

Decision needed from product before these are scheduled (some, e.g. leaderboard,
may conflict with the "Standing, not popularity" principle).

---

## 7. Backend dependencies for later steps

All Signal screens map onto existing backend endpoints (`apps/backend`,
base `/api/v1`). No backend changes are required for the re-skin itself.

| Signal feature | Endpoint(s) | Notes |
| --- | --- | --- |
| Map pins by radius/category | `GET /reports?lat&lng&radius&category[]&cursor&limit` | PostGIS `ST_DWithin`; ACTIVE + last 48h; returns `distanceMeters`, counts, `userVote`. |
| Report detail | `GET /reports/:id` | Author embed + counts. |
| Create report | `POST /reports` (multipart) | category/title(≤120)/description(≤1000)/lat/lng + photo. |
| My reports | `GET /reports/mine` | Profile. |
| Confirm / Not there | `POST` & `DELETE /reports/:id/vote` `{ value: 1 \| -1 }` | Optimistic; broadcasts `reports:voted`; recalcs standing. |
| Add evidence | `GET` & `POST /reports/:id/evidence` (multipart) | caption ≤300 + photo. |
| Offer help (thread) | `GET` & `POST /reports/:id/help` `{ message }` | message ≤300; notifies author. |
| Live updates | WebSocket `${EXPO_PUBLIC_WS_URL}/ws?token=` | client `SET_BOUNDS`; server `REPORT_CREATED / REPORT_VOTE_UPDATED / REPORT_ARCHIVED / HELP_OFFERED / EVIDENCE_ADDED`. |
| Standing | `User.credibilityScore` + `CREDIBILITY_TIERS` | score 0–100; tiers in shared. |
| Pulse strip stats | (derive client-side from nearby feed) | No dedicated endpoint yet — see risk R5. |

Shared contracts (`packages/shared`): `ReportCategory`
(`SAFETY|INFRASTRUCTURE|ANIMALS|COMMUNITY|HELP`), `CATEGORY_META`,
`RADIUS_OPTIONS` (152/402/804(default)/1609/3218 m), `CREDIBILITY_TIERS`,
`REPORT_ARCHIVE_HOURS = 48`, `Report/HelpOffer/Evidence/Notification/Ws*` types.

---

## 8. Risks and migration sequence

### 8.1 Risks
- **R1 — Inline hex everywhere.** Every screen/component hardcodes hex
  (`#22c55e`, `#0f172a`, …). Re-skin must replace these with tokens; risk of
  missed spots. Mitigation: migrate screen-by-screen; lint/grep for `#` literals
  per file before marking a screen done.
- **R2 — Product language drift.** Generic "upvote/comment/credibility" still
  present. Mitigation: enforce the locked vocabulary in each rebuilt component;
  add a wordlist check.
- **R3 — Legacy enum/tier colors.** `CREDIBILITY_TIERS` colors are still
  non-design-system (`#22c55e`, …). Reconcile when building the Standing UI.
- **R4 — iOS icon alpha.** `townly-icon-1024.png` has transparent rounded
  corners; iOS masks corners so this renders correctly, but a flattened
  full-bleed slate variant may be preferred for store builds.
- **R5 — Pulse strip has no backend.** The prototype's "Fishtown Pulse" summary
  (counts of needs-attention/confirmed/resolved) has no dedicated endpoint;
  derive from the nearby feed initially, or add an aggregate endpoint later.
- **R6 — Reduced motion / dynamic type.** Prototype uses animation + fixed type
  sizes; must respect `AccessibilityInfo.isReduceMotionEnabled` and dynamic type.
- **R7 — Pre-existing type debt.** `usePushNotifications.ts` has an Expo
  `NotificationBehavior` type error; backend has `@types/ws` / `rootDir` issues.
  Unrelated to the re-skin but should be cleaned before a strict CI gate.
- **R8 — No test suite yet.** There is no test runner configured. Domain rules
  (vote→standing, archive at 48h, category filtering) should get tests as
  screens are rebuilt.

### 8.2 Migration sequence
0. **Foundation (done):** brand assets + app icon, centralized theme modules,
   Space Grotesk loading, `react-native-svg` + Brand components, `@/` alias,
   `POSITIVE→HELP` reconciliation.
1. **Shared UI primitives:** themed `Text`, `Card`, `Pill/Chip`, `Button`,
   `CategoryBadge`, `Sheet` wrapper — all token-driven (no screens yet).
2. **Tab bar + headers:** restyle `AppNavigator`, add Brandmark/Wordmark.
3. **Map screen:** rebuild `MapScreen` (+ `.web`) with Pulse strip, chips,
   themed pins, radius control, safety callout.
4. **Report detail sheet + screen:** rebuild with Confirm / Not there / Add
   evidence / Offer help; reuse reskinned child components.
5. **Auth screens:** rebrand Welcome/SignIn/SignUp.
6. **Profile / Standing + Settings + Notifications:** restyle, relabel.
7. **Accessibility + motion pass:** dynamic type, reduced motion, a11y labels,
   hitSlop, contrast.
8. **Tests + cleanup:** add interaction/domain tests; resolve R7 type debt.

Each step is independently shippable, preserves existing data/queries, and is
verified with `tsc` + manual launch before review.
