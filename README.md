# BuildTrack 🏗️

**Modern Construction Management Platform**

BuildTrack is a full-stack construction project management platform with native iOS, cross-platform mobile (React Native), web dashboard, and Node.js backend API.

## 🏗️ Platform Overview

| Layer | Technology | Status |
|-------|-----------|--------|
| **iOS App** | SwiftUI + SwiftData + Supabase | ✅ Redesigned (blue theme) |
| **Mobile App** | Expo + React Native + NativeWind | ✅ Enhanced UI/UX |
| **Web Dashboard** | Next.js 14 + Tailwind + TanStack Query | ✅ Scaffolded |
| **Backend API** | Node.js + Express + PostgreSQL | ✅ Complete |
| **Database** | PostgreSQL + Redis | ✅ Schema + seeding |

---

## 📱 iOS App (SwiftUI)

### Features
- **Onboarding Flow**: 5-slide walkthrough with mesh gradient backgrounds
- **Auth**: Email/password, Apple Sign-In, Google OAuth, biometric auth
- **Dashboard**: Stats cards, quick actions, recent projects
- **Projects**: List with filter chips, swipe actions, context menus
- **Tasks**: Priority filtering, checkbox completion, search
- **Safety**: Incident reporting, inspections, severity badges
- **Team**: Worker cards with roles, certifications
- **Map**: Interactive site map with project markers
- **Notifications**: Inbox with unread tracking, type filtering
- **Settings**: Profile, security, dark mode, data export

### Design System
- Primary: `#2563EB` (Modern blue)
- Cards with subtle shadows and continuous corner radius
- Glassmorphism overlays
- Spring animations throughout
- Dark mode ready

---

## 📲 Mobile App (Expo/React Native)

### Features
- **Auth Screens**: Animated login/register with social auth
- **Onboarding**: 5-slide carousel with spring animations
- **Dashboard**: Stats grid, recent projects, quick actions
- **Projects**: Create with color picker, status selector
- **Tasks**: Create with priority, project selector
- **Safety**: Report incidents with severity picker
- **Profile**: Biometric toggle, organized menu

### API Integration
- Custom API client (`services/api.ts`)
- React Query hooks for caching and mutations
- Backend sync with JWT auth

---

## 🌐 Web Dashboard (Next.js)

### Pages
- **Dashboard**: Stats cards, activity feed
- **Projects**: List with search, status filter, progress bars
- **Tasks**: List with status/priority filters
- **Workers**: Grid cards with role colors
- **Safety**: Incidents with severity/status badges
- **Inspections**: Pass/fail status cards
- **Notifications**: Unread count, mark all read
- **Settings**: Profile, password, dark mode toggle

### Tech Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- Axios with refresh token interceptors

---

## 🔧 Backend API

### Endpoints

| Module | Routes |
|--------|--------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `PUT /auth/me`, `POST /auth/change-password` |
| **Projects** | `GET /projects`, `POST /projects`, `GET /projects/:id`, `PUT /projects/:id`, `DELETE /projects/:id`, `GET /projects/:id/stats` |
| **Tasks** | `GET /tasks`, `POST /tasks`, `GET /tasks/:id`, `PUT /tasks/:id`, `DELETE /tasks/:id`, `POST /tasks/:id/complete` |
| **Workers** | `GET /workers`, `POST /workers`, `GET /workers/:id`, `PUT /workers/:id`, `DELETE /workers/:id` |
| **Safety** | `GET /safety/incidents`, `POST /safety/incidents`, `GET /safety/incidents/:id`, `PUT /safety/incidents/:id`, `DELETE /safety/incidents/:id` |
| **Inspections** | `GET /inspections`, `POST /inspections`, `GET /inspections/:id`, `PUT /inspections/:id`, `DELETE /inspections/:id` |
| **Notifications** | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`, `DELETE /notifications/:id` |
| **Dashboard** | `GET /dashboard/stats`, `GET /dashboard/activity` |
| **Admin** | `GET /admin/users`, `PUT /admin/users/:id`, `DELETE /admin/users/:id`, `GET /admin/stats` |

### Database Schema
- `users` - Authentication and profile
- `projects` - Construction projects
- `tasks` - Project tasks
- `workers` - Team members
- `safety_incidents` - Incident reports
- `inspections` - Safety inspections
- `notifications` - User notifications
- `activity_logs` - Audit trail
- `project_workers` - Many-to-many linking
- `refresh_tokens` - JWT refresh tokens

### Security
- JWT authentication with refresh tokens
- Role-based access control (user/admin/super_admin)
- Password strength validation
- Rate limiting (100 requests/15 min)
- CORS with credentials
- Helmet security headers

---

## 🚀 Quick Start

### Backend
```bash
cd buildtrack-api
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npm run dev  # http://localhost:3001
```

### Web Dashboard
```bash
cd buildtrack-web
npm install
npm run dev  # http://localhost:3000
```

### Mobile (Expo)
```bash
cd BuildTrack
npm install
npx expo start
```

### iOS
Open `BuildTrack.xcodeproj` in Xcode 15+ and build for iOS 17+

---

## 📦 Deployment

### Backend
- Docker support planned
- Environment variables for production
- PM2 process management
- nginx reverse proxy

### Web
- Vercel deployment ready
- Environment variables for API URL

### iOS
- GitHub Actions CI/CD
- EAS Cloud builds
- TestFlight submission via `fastlane produce`

---

## 🔐 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/buildtrack
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://dashboard.buildtrack.app
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=https://api.buildtrack.app
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📝 License

MIT License - Copyright (c) 2026 BuildTrack

---

Built with ❤️ by StancaInvest
