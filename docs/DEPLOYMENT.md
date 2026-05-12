# BuildTrack iOS Deployment Guide

## Current Status (May 12, 2026)

| Item | Status |
|------|--------|
| Expo SDK | 55.0.0 |
| App Version | 1.1.0 |
| iOS Build Number | 1.1.0.7 |
| Bundle ID | `ro.stancainvest.buildtrack` |
| App Store App ID | 6767887054 |
| Last EAS Build | May 10, 2026 (build 29) |

## 🚧 Current Blocker: EAS Free Tier Exhausted

```
EAS Build Credits: 100% consumed (reset: Mon Jun 01 2026 — 19 days remaining)
```

### Features Already Deployed (OTA Update)

All JavaScript features from the v2.1 update have been published via **EAS Update** to the production branch. Existing TestFlight users will receive these automatically on next app launch.

| Feature | Status | Method |
|---------|--------|--------|
| Offline sync engine | ✅ Deployed | OTA Update |
| Analytics summary card | ✅ Deployed | OTA Update |
| All navigation/screens | ✅ Deployed | OTA Update |
| Push notifications | ✅ Native + OTA | Build 29 + OTA |
| Task management | ✅ Deployed | OTA Update |
| Quick actions | ✅ Deployed | OTA Update |

### Features Requiring New Native Build

These require a new EAS build because they add native iOS modules:

| Feature | Native Module | Status |
|---------|--------------|--------|
| Stripe payments | `@stripe/stripe-react-native` | ❌ Needs build |
| Camera/photo capture | `expo-image-picker`, `expo-camera` | ❌ Needs build |
| Device info | `expo-device` | ❌ Needs build |
| Biometric auth | `expo-local-authentication` | ❌ Needs build |

## 🚀 Deployment Options

### Option 1: Wait for EAS Credit Reset (Free) — RECOMMENDED

**When:** June 1, 2026 (19 days)

**Command:**
```bash
./scripts/ios-deploy.sh production
```

**What it does:**
1. Bumps iOS buildNumber
2. Prebuilds iOS native project
3. Queues EAS production build (store distribution)
4. Submits to TestFlight automatically

### Option 2: OTA Update (Immediate, Free)

For JS-only changes (no new native modules):

```bash
./scripts/ota-deploy.sh "Bug fixes and improvements"
```

**Note:** All v2.1 JS features are already published via OTA.

### Option 3: Upgrade EAS Plan ($29/month)

Get unlimited builds immediately:
```bash
# Sign up at https://expo.dev/pricing
eas build --platform ios --profile production
```

### Option 4: macOS/Xcode Local Build

Requires a Mac with Xcode:
```bash
npx expo run:ios --configuration Release
# Or open ios/BuildTrack.xcodeproj in Xcode
```

## 📋 Credentials

| Credential | Location |
|------------|----------|
| Apple API Key (.p8) | `/root/.config/apple-v2/AuthKey_S7PSXPJ963.p8` |
| Provisioning Profile Backup | `/root/credentials-backup/cortexbuildpro/` |
| EAS Account | `adrianstanca` (adrian.stanca1@icloud.com) |
| App Store Connect | Team: `4G3G5MX9BH` (Adrian Stanca) |

## 🔗 Useful Links

- [EAS Dashboard](https://expo.dev/accounts/adrianstanca/projects/buildtrack/builds)
- [TestFlight Builds](https://appstoreconnect.apple.com/apps/6767887054/testflight)
- [OTA Updates](https://expo.dev/accounts/adrianstanca/projects/buildtrack/updates)
- [App Store Connect](https://appstoreconnect.apple.com/apps/6767887054)

## 🔔 Automated Reminders

A cron job is set to fire on **June 1, 2026 at 00:00 UTC** reminding you to trigger the EAS build.

```
Job: easiOS-build-June-1-trigger
When: 2026-06-01T00:00:00Z
Action: Trigger EAS iOS production build
```

## 🛠️ Scripts

| Script | Purpose |
|--------|---------|
| `./scripts/ios-deploy.sh [profile]` | Full iOS build + TestFlight submit |
| `./scripts/ota-deploy.sh [message]` | OTA update for JS changes |
| `./scripts/check-status.sh` | Check build status and credentials |

## 📊 Build History

| Build | Date | Status | Features |
|-------|------|--------|----------|
| 29 | May 10 | In TestFlight | v2.0 + push notifications |
| — | May 12 | OTA Update | v2.1 JS features (offline sync, analytics) |
| TBD | Jun 1 | Pending | v2.1 native features (Stripe, camera, device) |
