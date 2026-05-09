# BuildTrack

A production-ready construction management mobile app built with Expo, React Native, and Supabase.

## Features

- **Authentication** — Email/password auth with Supabase Auth, session persistence via AsyncStorage
- **Dashboard** — Real-time project overview with stats, quick actions, and recent activity
- **Projects** — Full CRUD with budget, timeline, progress tracking, and geolocation
- **Tasks** — Task management with priorities, assignments, due dates, and status tracking
- **Safety** — Incident reporting and safety inspections with severity/status tracking
- **Team** — Worker management with role breakdown and certification tracking
- **Map** — Interactive map with project markers using react-native-maps
- **Notifications** — Real-time push notifications with grouped inbox and swipe-to-delete
- **Offline Support** — Automatic offline queue, background sync, and conflict resolution
- **Real-time** — Live data updates via Supabase Realtime subscriptions
- **Dark Mode** — Full dark mode support with system preference detection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 50+ with Expo Router v3 |
| UI | React Native with NativeWind (Tailwind CSS) |
| State | Zustand with AsyncStorage persistence |
| Backend | Supabase (local or cloud) |
| Auth | Supabase Auth with email/password |
| Database | PostgreSQL via Supabase |
| Storage | Supabase Storage for photos |
| Realtime | Supabase Realtime subscriptions |
| Offline | Custom sync engine with AsyncStorage queue |
| Maps | react-native-maps |
| Notifications | expo-notifications |
| Image Picker | expo-image-picker |

## Project Structure

```
BuildTrack/
├── app/                         # Expo Router file-based routes
│   ├── (tabs)/                  # Main tab navigation
│   │   ├── index.tsx            # Dashboard with stats
│   │   ├── map.tsx              # Interactive project map
│   │   ├── projects.tsx         # Projects list
│   │   ├── tasks.tsx            # Tasks management
│   │   ├── safety.tsx           # Safety records
│   │   ├── team.tsx             # Team management
│   │   └── notifications.tsx    # Notification inbox
│   ├── (modals)/                # Modal screens
│   │   ├── project-details.tsx  # Add/Edit project
│   │   ├── task-details.tsx     # Add/Edit task
│   │   └── safety-report.tsx    # Safety report modal
│   ├── auth/                    # Auth screens
│   │   ├── login.tsx            # Sign in
│   │   ├── register.tsx         # Sign up
│   │   └── _layout.tsx          # Auth layout
│   ├── _layout.tsx              # Root layout with AuthGuard
│   └── +not-found.tsx           # 404 page
├── components/
│   ├── ui/                      # Shared UI components
│   │   ├── Card.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── PriorityBadge.tsx
│   ├── map/                     # Map components
│   │   └── ProjectMarker.tsx
│   └── notifications/           # Notification components
│       └── NotificationCard.tsx
├── contexts/
│   └── AuthContext.tsx          # React Context for auth state
├── hooks/
│   ├── useSupabase.ts           # Data fetching & mutations
│   ├── useRealtime.ts           # Realtime subscriptions
│   ├── useNotifications.ts      # Push notifications
│   ├── usePhotos.ts             # Photo upload/pick
│   ├── useOfflineSync.ts        # Offline sync hook
│   └── useColorScheme.ts      # Theme detection
├── lib/
│   ├── supabase.ts              # Supabase client config
│   ├── offlineSync.ts           # Offline sync engine
│   ├── api.ts                   # API helpers
│   └── utils.ts                 # Formatting utilities
├── stores/
│   ├── projectsStore.ts         # Zustand project store (Supabase)
│   ├── tasksStore.ts            # Zustand task store (Supabase)
│   ├── safetyStore.ts           # Safety data store
│   ├── teamStore.ts             # Team/worker store
│   ├── notificationsStore.ts    # Notification state
│   └── syncStore.ts             # Sync status store
├── types/
│   └── index.ts                 # Shared TypeScript types
├── supabase/
│   └── migrations/              # Database migrations
├── constants/
│   └── colors.ts                # App color palette
└── eas.json                     # EAS Build configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI (for local backend)
- Android Studio or Xcode (for emulators)

### Local Supabase Setup

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Start local Supabase
cd BuildTrack
supabase start

# Create database tables and seed data
supabase db reset
```

### App Setup

```bash
# Install dependencies (required due to peer dep conflicts)
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npx expo start

# Press 'w' for web preview
# Press 'i' for iOS simulator (macOS only)
# Press 'a' for Android emulator
```

### Default Local Supabase Credentials

The local Supabase instance runs at:
- **API URL**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### Environment Variables

Create `.env.local`:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Get the anon key from `supabase status` or `supabase start` output.

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `projects` | Construction projects |
| `tasks` | Project tasks |
| `incidents` | Safety incidents |
| `inspections` | Safety inspections |
| `workers` | Team members |
| `photos` | Uploaded photos |
| `notifications` | User notifications |

### Security

- **RLS enabled** on all tables
- **Row-level policies** for user-scoped access
- **Realtime subscriptions** enabled on all tables
- **Storage bucket** `buildtrack-photos` with public access

## Offline Sync

The app includes a full offline sync system:

1. **Queue mutations** when offline (stored in AsyncStorage)
2. **Auto-sync** when connection returns (15-second polling)
3. **Conflict resolution** via server timestamps (last-write-wins)
4. **Retry with backoff** (up to 3 retries)
5. **Cache fallback** for reads when offline (24h TTL)

## Real-time Features

- Live project updates across all connected clients
- Real-time task changes with optimistic UI
- Instant notification delivery
- Map marker updates when project locations change

## Building for Production

```bash
# Configure EAS
npx eas login
npx eas build:configure

# Preview build (APK for Android)
npx eas build --profile preview --platform android

# Production build
npx eas build --profile production --platform all

# OTA update
npx eas update --branch production --message "Bug fixes"
```

## Architecture Decisions

- **NativeWind over StyleSheet**: Tailwind-like utility classes with dark mode support
- **Zustand over Redux**: Simpler API, less boilerplate, built-in persistence
- **Supabase over Firebase**: Open-source, self-hostable, PostgreSQL relational data
- **Expo Router over React Navigation**: File-based routing, zero config, SSR ready
- **Modal pattern over stacks**: Modals for detail views keep tab context alive

## Performance

- Optimistic UI updates (no waiting for server)
- Persistent stores with AsyncStorage
- Image lazy loading and caching
- Debounced search and filtering
- Background sync for offline queue

## License

MIT
