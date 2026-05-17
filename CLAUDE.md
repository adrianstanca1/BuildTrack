# CLAUDE.md — BuildTrack

BuildTrack is a React Native / Expo mobile app for construction site management, shipping to the App Store and Play Store via EAS. It talks to the local Supabase stack for auth, data, realtime, and storage, and to `buildtrack-api` (Node/Express, `:3001`) for domain-level REST queries and analytics. The iOS bundle identifier is `ro.stancainvest.buildtrack`; the EAS project ID is `cd4364ab-e24c-4973-96fe-6191e9b20b5d`. Do not change either — both are tied to the App Store Connect record.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Expo SDK 55, React Native 0.83.6, React 19.2 |
| Navigation | expo-router 55 (file-based, portrait-locked) |
| Styling | NativeWind 4, Tailwind CSS 3.4 (`className` prop) |
| State | Zustand 5 — 20+ domain stores, all `persist`-wrapped to AsyncStorage |
| Server data | TanStack Query 5 (`useQuery`/`useMutation` in `hooks/`) |
| Auth | Supabase JS v2 — email/password, OAuth (Google, Microsoft, SSO), biometric |
| Database | Supabase accessed via `@supabase/supabase-js` (direct from stores) |
| Storage | Supabase Storage — three buckets: `buildtrack-photos`, `-drawings`, `-documents` |
| Realtime | Supabase `postgres_changes` subscriptions (`hooks/useRealtime.ts`) |
| REST API | `services/api.ts` → `buildtrack-api` on `:3001` |
| Payments | `@stripe/stripe-react-native` (installed, no active checkout screen) |
| Push | `expo-notifications` + Supabase push token table |
| Maps | `react-native-maps` |
| Background | `expo-location` + `expo-task-manager` (geofence check-ins in `lib/backgroundLocation.ts`) |
| Language | TypeScript 5.9.2, Node >= 22 |

## Quick start

```bash
# from /root/BuildTrack
npm install --legacy-peer-deps   # always needs the flag — WatermelonDB peer conflicts cause hard failure without it
npm start                        # Expo Metro (scan QR, or press i for iOS simulator / a for Android)
npm run ios                      # expo run:ios (requires Xcode 26.3)
npm run android                  # expo run:android
npm run web                      # expo start --web
npm run lint                     # expo lint (eslint-config-expo)
```

There is no `test` script and no test runner — see Known Issues.

`postinstall` runs automatically: applies `patch-package`, runs `scripts/patch-expo-router.js`, removes duplicate React from WatermelonDB's nested `node_modules`.

## Architecture

### Folder layout

```
app/
├── _layout.tsx         root: SafeAreaProvider > GestureHandlerRootView >
│                       AuthProvider > CompanyProvider > AuthGuard > Stack
├── (tabs)/             8-tab bar: Dashboard, Map, Projects, Tasks, Safety, Team, Documents, More
├── (modals)/           project-details, task-details, safety-report, worker-details
├── (admin)/            role-gated admin dashboard + teams/users (role from billingStore/useAdminStore)
├── (onboarding)/       first-run slides
├── auth/               login, register, forgot-password
└── <domain>/           budget, change-orders, daily-reports, defects, delay-notes, drawings,
                        equipment, invoices, materials, meetings, permits, project, punch-items,
                        purchase-orders, rfis, site-photos, submittals, task, tasks, team,
                        timesheets, quick-actions, export, settings
contexts/
├── AuthContext.tsx     Supabase auth state, OAuth, biometric login, password reset
└── CompanyContext.tsx  loads company + role; sets X-Company-ID via fetch interceptor
stores/                 20+ Zustand stores (one per domain, all persist to AsyncStorage)
hooks/                  TanStack Query hooks calling services/api.ts
lib/
├── supabase.ts         Supabase client singleton + X-Company-ID fetch monkey-patch + env fallbacks
├── db.ts               generic Supabase CRUD helpers (fetchTable, insertRow, updateRow, …)
├── api.ts              STUB — empty arrays + 500 ms delay; do not use or import from this file
├── offlineSync.ts      Supabase mutation queue (AsyncStorage, 15 s poll, 3 retries, LWW)
├── offlineApiSync.ts   REST mutation queue (same pattern, X-Idempotency-Key header)
├── storage.ts          Supabase Storage upload/download + per-bucket MIME + size validation
├── auth.ts             OAuth + SSO deep-link helpers; PKCE and implicit flows
├── pushNotifications.ts Expo push token registration/unregistration
└── backgroundLocation.ts BACKGROUND_LOCATION_TASK; geofence check-in/out with offline queue
services/
└── api.ts              real REST client (ApiClient class → buildtrack-api :3001)
supabase/
├── migrations/         schema + RLS policies; apply with `supabase db push`
├── functions/          Edge Functions: project-summary, push-notification
└── types/database.types.ts generated Supabase types
```

### State management

Every domain has a Zustand store in `stores/`. All stores are `persist`-wrapped to AsyncStorage and call Supabase directly for CRUD. On Supabase write failure, the store calls `useSyncStore.getState().queueMutation(table, type, payload)` to add to the offline queue. `stores/syncStore.ts` coordinates both offline queues and exposes status via `useOfflineSync` and `useSyncStatusBadge`.

### API dual-track

Two parallel patterns coexist — pick one per feature and do not mix:

- **Zustand stores** call Supabase directly (`lib/db.ts` helpers or inline `supabase.from()`). Use when offline support or realtime is needed.
- **TanStack Query hooks** (`hooks/useProjects.ts`, `hooks/useNotifications.ts`, etc.) call `services/api.ts` → `buildtrack-api` on `:3001`. Use for server-computed data: analytics, reports, push token registration, payments.

`lib/api.ts` is a stub with empty return values — it is not the real client. The real client is `services/api.ts`.

### Auth flow

1. `AuthContext` calls `supabase.auth.getSession()` on mount and subscribes to `onAuthStateChange`.
2. `signIn` (email/password) → `supabase.auth.signInWithPassword`.
3. `signInWithProvider` (Google/Microsoft) → `supabase.auth.signInWithOAuth` → browser → deep-link `buildtrack://auth/callback` → `lib/auth.handleAuthCallback` (PKCE or implicit).
4. `signInWithBiometric` reads email + plaintext password from AsyncStorage and calls `signIn`. See Known Issues.
5. `CompanyContext` loads `company_users` membership on auth change; calls `setActiveCompanyId()` which wires the `X-Company-ID` header on all Supabase requests via the global fetch patch in `lib/supabase.ts`.

Admin role is checked via `billingStore.checkAdminRole()` (alias of `useAdminStore`); non-admins see an Access Denied view in `(admin)/`.

### Navigation

expo-router `<Stack>` at root; `(tabs)` uses `<Tabs>` with 8 screens. Modals use `presentation: 'modal'`. The `AuthGuard` component in `app/_layout.tsx` routes unauthenticated users to `/onboarding` (first run, keyed by `ONBOARDING_KEY` in AsyncStorage) or `/auth/login`.

### Offline sync

Two AsyncStorage queues:

- `@buildtrack/offline-queue` — Supabase mutations (15 s poll, 3 retries, last-write-wins).
- `@buildtrack/api-offline-queue` — REST mutations (same logic, adds `X-Idempotency-Key`).

Both are coordinated by `stores/syncStore.ts`. Background location check-ins use a third separate queue at `@buildtrack/checkin_queue` inside `lib/backgroundLocation.ts`.

## Environment variables

```bash
EXPO_PUBLIC_SUPABASE_URL=       # Supabase Kong URL (local: http://127.0.0.1:54321)
EXPO_PUBLIC_SUPABASE_ANON_KEY=  # Supabase publishable anon key
EXPO_PUBLIC_API_URL=            # buildtrack-api base URL (local: http://127.0.0.1:3001)
EXPO_PUBLIC_CHANNEL=            # set by EAS to 'production' / 'preview' / 'development' / 'ci'
```

All are `EXPO_PUBLIC_` and inlined at build time. `lib/supabase.ts` has a fallback chain: env var → channel detection → `__DEV__` flag → hosted URL. See Known Issues for the hardcoded anon key risk.

## Deploy / release

### EAS build profiles

| Profile | Distribution | Notes |
|---|---|---|
| `development` | internal dev client | Local Supabase `:54321`; requires dev client |
| `preview` | internal | Hosted Supabase; iOS device, Android APK |
| `ci` | internal simulator | Hosted Supabase; used by `expo-preview.yml` |
| `production` | store | `autoIncrement: true`; ASC App ID `6767887054` |
| `production-ios` | store | Extends production; iOS only |
| `production-android` | store | Extends production; Android only |

### Build + submit

```bash
# Local build (from /root/BuildTrack)
eas build --platform ios --profile production --local \
  --output build-output/buildtrack.ipa --non-interactive

# Submit (VPS only — ASC key hardcoded to /root/.config/apple-v2/AuthKey_S7PSXPJ963.p8)
eas submit --platform ios --path build-output/buildtrack.ipa
```

On CI, `secrets.APPLE_API_KEY` (base64) is decoded into `~/.appstoreconnect/private_keys/`.

### OTA updates

`expo-updates` enabled; `runtimeVersion.policy = "appVersion"`. One OTA channel per build profile. Updates check `ON_LOAD`; `fallbackToCacheTimeout: 0`.

### CI workflows

| Workflow | Trigger | Steps |
|---|---|---|
| `expo-ci.yml` | push/PR to master or main | install + `npx expo-doctor` |
| `expo-preview.yml` | PR to main or manual dispatch | EAS preview build (`continue-on-error: true`) |
| `ios-local-build.yml` | manual dispatch only | EAS `--local` on macOS-15/Xcode 26.3; optional TestFlight |

`expo-ci.yml` is the only automated gate. It does not run lint, typecheck, or tests.

## Local dev with Supabase

The local Supabase stack runs as the `supabase_*_BuildTrack` Docker containers:

| Service | Port |
|---|---|
| Kong API gateway | `:54321` |
| PostgreSQL | `:54322` |
| Supabase Studio | `:54323` |

Point the app at local Supabase via `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<from `supabase status`>
EXPO_PUBLIC_API_URL=http://127.0.0.1:3001
```

Or build with the `development` EAS profile which bakes in the local URL. Plain `npm start` without `.env` also works because `lib/supabase.ts` defaults `__DEV__` to `:54321`.

Apply migrations:

```bash
cd /root/BuildTrack && supabase db push
```

Deploy Edge Functions:

```bash
supabase functions deploy project-summary
supabase functions deploy push-notification
```

## Known issues / debt

- **SECURITY — biometric stores plaintext password in AsyncStorage** (`contexts/AuthContext.tsx:196–199`). `enableBiometric` writes the raw password to `BIOMETRIC_PASSWORD_KEY`. AsyncStorage is unencrypted on Android. Replace with `expo-secure-store`. **Fixable** — three `AsyncStorage.setItem` calls to migrate.

- **SECURITY — hardcoded Supabase anon key fallback** (`lib/supabase.ts:25`). When `EXPO_PUBLIC_SUPABASE_ANON_KEY` is unset, the compiled bundle contains the literal publishable key `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`. Remove the fallback and throw instead. **Fixable**.

- **BROKEN — `xcrun altool` removed in Xcode 16+** (`.github/workflows/ios-local-build.yml:89`). The TestFlight submission step uses `altool` which was removed from Xcode 16/26. The workflow selects Xcode 26.3 so this step always fails. Replace with `eas submit`. **Fixable**.

- **No test suite**. No test runner, no `test` script, no `__tests__/` directory, no vitest/jest config. Only CI gate is `expo-doctor`. **Deferred** (listed as "Planned" in CHANGELOG).

- **`lib/api.ts` is a dead stub**. Every method returns an empty array with a 500 ms delay. The real client is `services/api.ts`. Confusing naming is a trap. **Fixable** — delete or rename the stub.

- **`@nozbe/watermelondb` installed but unused**. Zero WatermelonDB imports anywhere in source. Adds build overhead and the `postinstall` dedup workaround. **Fixable** — remove from `package.json`.

- **`lib/utils.ts` uses en-US / USD**. `formatCurrency` and `formatDate` default to American locale. The app targets UK construction. **Fixable** — change to `en-GB` / `GBP`.

- **Dual API pattern undocumented**. Multiple domains (e.g. projects) have both a Zustand store (Supabase) and a TanStack Query hook (`services/api.ts`). No convention exists for which to use. **Deferred** — document before adding the next domain.

## Don't do

- **Never run `npm install` without `--legacy-peer-deps`** — WatermelonDB peer conflicts cause a hard failure.
- **Never rename the iOS bundle identifier** (`ro.stancainvest.buildtrack`) or EAS `projectId` — both are locked to ASC and OTA channels.
- **Never import from `lib/api.ts`** — it is a stub. Use `services/api.ts`.
- **Never add a third API surface** alongside the Zustand-Supabase and TanStack-REST tracks.
- **Never hardcode a real Supabase anon key as a compile-time fallback** in `lib/supabase.ts`.
- **Never use `xcrun altool`** in new CI steps — it is gone from Xcode 16+. Use `eas submit`.
- **Never run Expo commands from `/root`** — always `cd /root/BuildTrack` first.

## Cross-references

- REST API: `/root/buildtrack-api/CLAUDE.md` + Swagger at `https://buildtrack-api.cortexbuildpro.com/api/docs`
- PWA sibling: `/root/buildtrack-web/CLAUDE.md`
- Native iOS sibling: `/root/BuildTrack-iOS/` (SwiftUI; check `reference_ios_bundle_inventory.md` — may share ASC record)
- Workspace overview: `/root/CLAUDE.md`
