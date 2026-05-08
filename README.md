# BuildTrack

Construction management mobile app built with Expo and React Native.

## Features

- **Dashboard** — Project overview with stats, quick actions, and recent activity
- **Projects** — Manage construction projects with budget, timeline, and progress tracking
- **Tasks** — Task management with priorities, assignments, and due dates
- **Safety** — Incident reporting and safety inspections with severity tracking
- **Team** — Worker management with role breakdown and certification tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 50+ with Expo Router v3 |
| UI | React Native with NativeWind (Tailwind) |
| State | Zustand with AsyncStorage persistence |
| Icons | @expo/vector-icons (Ionicons) |
| Styling | Dark mode support with className utilities |

## Project Structure

```
BuildTrack/
├── app/                      # Expo Router file-based routes
│   ├── (tabs)/               # Main tab navigation
│   │   ├── index.tsx         # Dashboard
│   │   ├── projects.tsx      # Projects list
│   │   ├── tasks.tsx         # Tasks management
│   │   ├── safety.tsx        # Safety records
│   │   └── team.tsx          # Team management
│   ├── (modals)/             # Modal screens
│   │   ├── project-details.tsx
│   │   ├── task-details.tsx
│   │   └── safety-report.tsx
│   ├── _layout.tsx           # Root layout
│   └── +not-found.tsx        # 404 page
├── components/ui/            # Shared UI components
├── stores/                   # Zustand state stores
├── constants/                # App constants
├── assets/                   # Images and icons
└── eas.json                  # EAS Build configuration
```

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npx expo start

# Press 'w' for web preview
# Press 'i' for iOS simulator (macOS only)
# Press 'a' for Android emulator
```

## Demo Data

The app comes pre-loaded with demo data:

- **3 Projects** — Riverside Apartments, Metro Office Tower, Community Center Renovation
- **5 Tasks** — Foundation pour, steel framework, HVAC, electrical, waterproofing
- **1 Incident + 2 Inspections** — Safety records with severity/status
- **8 Workers** — Various roles with certifications

## Building for Production

```bash
# Preview build (APK for Android)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform all

# OTA update
eas update --branch production --message "Bug fixes"
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## License

MIT
