# Changelog

## [2.0.0] - 2026-05-08

### Added
- **Full Supabase Backend Integration**
  - Local Supabase with PostgreSQL database
  - Authentication with email/password via Supabase Auth
  - Row-level security (RLS) policies on all tables
  - Real-time subscriptions for live data updates
  - Supabase Storage bucket for photos (`buildtrack-photos`)

- **Interactive Map**
  - react-native-maps integration
  - Project markers with callouts
  - Region-based navigation to project locations
  - Dark mode map styling

- **Push Notifications**
  - Expo Notifications integration
  - Local and scheduled notifications
  - Notification inbox with grouped display (Today, Yesterday, Earlier)
  - Swipe-to-delete with gesture handler
  - Real-time badge counts

- **Offline Sync Engine**
  - AsyncStorage-based mutation queue
  - Automatic sync when connection returns (15s polling)
  - Conflict resolution via server timestamps (last-write-wins)
  - Retry with backoff (max 3 attempts)
  - Cache fallback for reads (24h TTL)
  - Background sync status indicators

- **Auth Screens**
  - Login screen with form validation
  - Registration screen with password confirmation
  - Auth guard with automatic routing
  - Session persistence via AsyncStorage

- **New Tab Screens**
  - Map tab for project locations
  - Notifications tab for push notification inbox

### Changed
- Projects store now uses Supabase for CRUD operations
- Tasks store now uses Supabase for CRUD operations
- Dashboard fetches real-time data from Supabase
- All data now persisted via Supabase with Zustand cache

### Infrastructure
- 7 database tables with full schema
- Database migrations with seed data
- Type-safe API layer with custom hooks
- Realtime subscription hooks
- Photo upload/pick hooks

## [1.0.0] - 2026-05-08

### Added
- Initial release of BuildTrack construction management app
- Dashboard with project stats, quick actions, and recent projects
- Projects management with budget, timeline, and progress tracking
- Tasks with priorities, assignments, due dates, and status toggles
- Safety module with incident reporting and inspections
- Team management with role breakdown and certifications
- Dark mode support throughout the app
- Demo data pre-loaded for testing

### Tech Stack
- Expo SDK 50+ with Expo Router v3
- React Native with NativeWind (Tailwind CSS)
- Zustand state management with persistence
- TypeScript throughout

## [Unreleased]

### Planned
- EAS Build CI/CD pipeline
- Analytics and crash reporting
- Multi-tenancy support
- Advanced reporting dashboards
