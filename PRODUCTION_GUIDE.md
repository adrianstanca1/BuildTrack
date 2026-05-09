# BuildTrack — Production Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BuildTrack Expo App                    │
│  ro.stancainvest.buildtrack (iOS/Android)                │
│  Channel: preview | production                           │
└──────────────┬──────────────────────────────┬───────────┘
               │                              │
     ┌─────────▼──────────┐          ┌───────▼───────────┐
     │   EAS Build (CI)   │          │   OTA Updates      │
     │   expo.dev          │          │   expo.dev CDN     │
     └─────────┬──────────┘          └───────────────────┘
               │
     ┌─────────▼──────────────────────────────────────────┐
     │              Supabase Backend                        │
     │         https://buildtrack.stancainvest.ro           │
     │  Auth │ Database │ Storage │ Realtime │ Edge        │
     └─────────────────────────────────────────────────────┘
```

## Quick Reference

| Task | Command |
|------|---------|
| Preview APK (Android) | `eas build --profile preview --platform android` |
| Production Android | `eas build --profile production --platform android` |
| Production iOS | `eas build --profile production --platform ios` |
| Production both | `eas build --profile production --platform all` |
| Submit Android | `eas submit --platform android` |
| Submit iOS | `eas submit --platform ios` |
| OTA update preview | `eas update --branch preview --message "Changelog"` |
| OTA update prod | `eas update --branch production --message "Changelog"` |
| Run deploy script | `bash scripts/deploy-production.sh` |

---

## 1. Environment Configuration

### Local Development
```bash
# Uses hardcoded fallbacks in lib/supabase.ts
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
npx expo start
```

### Build-time Environment Variables
Environment variables are injected at **build time** by EAS Build (not runtime). Each build profile in `eas.json` sets the correct values:

| Variable | Development | Preview / Production |
|----------|-------------|---------------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` | `https://buildtrack.stancainvest.ro` |
| `EXPO_PUBLIC_API_URL` | `http://127.0.0.1:54321/api` | `https://buildtrack.stancainvest.ro/api` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Local dev key | Production anon key |

### Environment Switching Logic (`lib/supabase.ts`)
```typescript
// Priority chain:
// 1. EXPO_PUBLIC_* env vars (set at build time via eas.json)
// 2. Channel detection (preview/production → production URL)
// 3. __DEV__ flag (true → localhost, false → production URL)
```

---

## 2. EAS Build Profiles

### Development (`eas build --profile development`)
- **Purpose**: Local development client with Expo Dev Tools
- **Distribution**: Internal (Expo dashboard install link)
- **Environment**: Local Supabase instance

### Preview (`eas build --profile preview`)
- **Purpose**: Internal testing, QA, stakeholder reviews
- **Distribution**: Internal (Expo dashboard)
- **Android**: APK (direct install, no Play Store needed)
- **Channel**: `preview`
- **Auto-increment**: Enabled (version code/bump)
- **Environment**: Production backend

### Production (`eas build --profile production`)
- **Purpose**: App Store / Play Store submission
- **Distribution**: Store (App Store Connect / Google Play Console)
- **Android**: AAB (Android App Bundle, required by Play Store)
- **Channel**: `production`
- **Auto-increment**: Version bump on each build
- **Resource class**: `large` (Android) / `m2-medium` (iOS) for faster builds

### Platform-specific production builds
- `eas build --profile production-android --platform android` — Android only, faster
- `eas build --profile production-ios --platform ios` — iOS only, faster

---

## 3. OTA (Over-the-Air) Updates

BuildTrack uses Expo Updates for instant JS-layer deployments **without** going through app store review.

### Workflow
```
1. Make JS/TS changes
2. Run: eas update --branch preview --message "Fixed X"
3. Test on preview builds
4. Run: eas update --branch production --message "Fixed X"
5. All production builds get the update within seconds on next launch
```

### Important Constraints
- OTA updates only deliver **JavaScript/assets** changes
- **Native code changes** (new permissions, native modules, SDK upgrades) require a new EAS Build
- Updates respect `runtimeVersion` — if you change the native layer, bump the version in `app.json`

### When to OTA vs Full Build

| Change Type | Method |
|-------------|--------|
| UI fixes, styles, layout | OTA update |
| Bug fixes in JS logic | OTA update |
| Adding new screens | OTA update |
| Adding native permissions | Full EAS Build |
| Adding new native module | Full EAS Build |
| Upgrading Expo SDK | Full EAS Build |
| Changing splash/icon assets | Full EAS Build |

---

## 4. App Store Submission Checklist — iOS

### Pre-submission
- [ ] All builds pass `npx expo-doctor` with no errors
- [ ] App tested on physical iPhone (not just simulator)
- [ ] App Store screenshots prepared (6.7" and 6.5" required):
  - 6.7" (iPhone 16 Pro Max): 1320×2868 px
  - 6.5" (iPhone 16 Plus): 1284×2778 px
  - 5.5" (iPhone SE): 1242×2208 px
- [ ] Privacy policy URL published and accessible
- [ ] App description, keywords, support URL prepared
- [ ] Age rating questionnaire completed in App Store Connect
- [ ] Export compliance: `ITSAppUsesNonExemptEncryption: false` set in `app.json`
- [ ] `NSLocationWhenInUseUsageDescription` is meaningful and honest
- [ ] `NSCameraUsageDescription` is meaningful and honest

### Build & Submit
```bash
# Build
eas build --profile production --platform ios

# Once build completes:
eas submit --platform ios
```

### In App Store Connect
- [ ] Upload at least 3 screenshot sets
- [ ] Set app pricing (free or paid)
- [ ] Select territory availability
- [ ] Complete App Review Information (contact, notes, demo account if needed)
- [ ] Submit for review

### Common iOS Rejection Reasons
1. Missing privacy policy link
2. Vague permission descriptions
3. App crashes on launch (test on release build, not dev client!)
4. Placeholder UI / "under construction" screens
5. Using private APIs

---

## 5. Google Play Submission Checklist — Android

### Pre-submission
- [ ] App signed with production keystore (EAS manages this)
- [ ] App tested on physical Android device
- [ ] Google Play screenshots prepared:
  - Phone: minimum 2 screenshots, 1080×1920 (or 1920×1080 for landscape)
  - Tablet (optional): minimum 1, 7" or 10"
- [ ] Feature graphic: 1024×500 px
- [ ] App icon: 512×512 px (adaptive icon already configured)
- [ ] Privacy policy URL
- [ ] App description (short: 80 chars, full: 4000 chars)
- [ ] Content rating questionnaire completed

### Build & Submit
```bash
# Build
eas build --profile production --platform android

# Once build completes:
eas submit --platform android
```

### In Google Play Console
- [ ] Upload screenshots and feature graphic
- [ ] Set pricing and distribution
- [ ] Select target countries
- [ ] Complete content rating
- [ ] Set app category: "Business" or "Productivity"
- [ ] Submit for review

### Common Android Rejection Reasons
1. Missing privacy policy
2. Requesting permissions without justification
3. Target SDK too old (must target API 34+)
4. App crashes on common devices
5. Impersonation / trademark issues

---

## 6. CI/CD with GitHub Actions

### `.github/workflows/build-track.yml`

```yaml
name: BuildTrack CI

on:
  push:
    branches: [main, develop]
    paths:
      - '**.ts'
      - '**.tsx'
      - '**.js'
      - 'package.json'
      - 'app.json'
  workflow_dispatch:
    inputs:
      profile:
        description: 'EAS build profile'
        required: true
        default: 'preview'
        type: choice
        options:
          - preview
          - production

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npx expo-doctor
      - run: npx tsc --noEmit

  update:
    needs: lint
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas update --branch preview --message "${{ github.event.head_commit.message }}"

  build-preview:
    needs: lint
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --profile preview --platform android --non-interactive --no-wait

  build-production:
    needs: lint
    if: github.event_name == 'workflow_dispatch' && github.event.inputs.profile == 'production'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --profile production --platform all --non-interactive --no-wait
```

### Required GitHub Secrets
| Secret | Value |
|--------|-------|
| `EXPO_TOKEN` | Expo personal access token (from https://expo.dev/settings/access-tokens) |

### Workflow Behaviours
| Trigger | Action |
|---------|--------|
| Push to `develop` | Lint + type-check + OTA update to `preview` channel |
| Push to `main` | Lint + type-check + EAS preview APK build |
| Manual dispatch `production` | Lint + type-check + EAS production build (both platforms) |

---

## 7. Version Management

### Version Sources
- `app.json`: `version` (semver) and `buildNumber` (iOS) / `versionCode` (Android)
- `eas.json`: `autoIncrement: "version"` — automatically bumps patch version on each build

### Manual Version Bump
```bash
# Bump version in app.json manually, or:
npx expo-version bump  # requires expo-version package
```

### Recommended Versioning Scheme
```
1.0.0 → Initial release
1.1.0 → Feature release (OTA or build)
1.1.1 → Bug fix (OTA preferred)
2.0.0 → Breaking changes / major redesign (build required)
```

---

## 8. Emergency Rollback

### OTA Rollback
```bash
# List recent updates on production channel
eas update:list --branch production

# Rollback to a known-good update
eas update:republish --branch production --group <UPDATE_GROUP_ID>
```

### Full Build Rollback
1. Checkout the last known-good tag: `git checkout v1.0.0`
2. Build: `eas build --profile production --platform all`
3. Submit the new (old-version) build to stores

---

## 9. Troubleshooting

| Problem | Likely Fix |
|---------|-----------|
| `EXPO_PUBLIC_*` vars not working | Ensure vars are in `eas.json` build profile `env` section, not just `.env.production` |
| OTA update not appearing | Check `runtimeVersion` matches between build and update; check channel name |
| Build fails on iOS | Check resource class; try `m2-medium` if OOM; verify certs in Apple Developer account |
| Build fails on Android | Check `buildType` is `app-bundle` for production; verify keystore in EAS dashboard |
| Supabase connection refused | Verify anon key is correct; check RLS policies allow anon access; verify Supabase is running |
| App rejected for privacy | Add clear, honest permission descriptions in `app.json` `infoPlist` |
| expo-doctor errors | Run `npx expo-doctor --fix-dependencies` then `npx expo install --check` |

---

## 10. Useful Commands Cheat Sheet

```bash
# Check project health
npx expo-doctor

# List all EAS builds
eas build:list

# View a specific build's logs
eas build:view <BUILD_ID>

# Cancel a build
eas build:cancel <BUILD_ID>

# List all submissions
eas submit:list

# View credentials managed by EAS
eas credentials

# List available update channels
eas channel:list

# Create a new update channel
eas channel:create staging

# Check which runtime versions are deployed
eas update:list --branch production

# View app on expo.dev dashboard
eas project:info

# Inspect EAS project config
eas project:info
```

---

*Last updated: 2026-05-08 — BuildTrack Production Configuration*
