#!/usr/bin/env bash
#
# BuildTrack — Production Deployment Script
# ==========================================
# Validates configuration, runs preflight checks, triggers EAS production
# builds for both iOS and Android, and reports build URLs.
#
# Usage:
#   bash scripts/deploy-production.sh [--android-only|--ios-only|--no-wait]
#
# Prerequisites:
#   - EAS CLI installed and authenticated (npx eas login)
#   - EXPO_TOKEN env var set (or ~/.eas/config authenticated)
#   - Apple Developer account configured (for iOS)
#   - Google Play Console configured (for Android)
#   - .env.production exists in project root

set -euo pipefail

# ─── Colours ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

# ─── Config ───────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env.production"
PLATFORM="all"
NO_WAIT=false

# ─── Banner ───────────────────────────────────────────────────────────
echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║       BuildTrack — Production Deployment         ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Parse Flags ──────────────────────────────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --android-only) PLATFORM="android" ;;
    --ios-only)     PLATFORM="ios" ;;
    --no-wait)      NO_WAIT=true ;;
    --help|-h)
      echo "Usage: bash scripts/deploy-production.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --android-only    Build only Android"
      echo "  --ios-only        Build only iOS"
      echo "  --no-wait         Don't wait for builds to complete"
      echo "  --help, -h        Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $arg${NC}"
      exit 1
      ;;
  esac
done

# ─── Step 1: Validate .env.production ─────────────────────────────────
echo -e "${BOLD}[1/7]${NC} Validating .env.production..."

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}ERROR: .env.production not found at $ENV_FILE${NC}"
  echo "Create it with the production backend configuration."
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

REQUIRED_VARS=(
  "EXPO_PUBLIC_SUPABASE_URL"
  "EXPO_PUBLIC_SUPABASE_ANON_KEY"
  "EXPO_PUBLIC_API_URL"
)

MISSING=false
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo -e "  ${RED}✗ $var is missing or empty${NC}"
    MISSING=true
  else
    echo -e "  ${GREEN}✓${NC} $var=${!var}"
  fi
done

if [ "$MISSING" = true ]; then
  echo -e "${RED}ERROR: Required environment variables are missing.${NC}"
  exit 1
fi

# ─── Step 2: Check EXPO_TOKEN ─────────────────────────────────────────
echo -e "${BOLD}[2/7]${NC} Checking EAS authentication..."

if [ -n "${EXPO_TOKEN:-}" ]; then
  echo -e "  ${GREEN}✓${NC} EXPO_TOKEN is set"
elif eas whoami &>/dev/null; then
  echo -e "  ${GREEN}✓${NC} EAS CLI is authenticated"
else
  echo -e "${RED}ERROR: Not authenticated with EAS.${NC}"
  echo "Run: npx eas login"
  echo "Or set: export EXPO_TOKEN=your-personal-access-token"
  exit 1
fi

# ─── Step 3: Verify project directory ─────────────────────────────────
echo -e "${BOLD}[3/7]${NC} Verifying project..."

cd "$PROJECT_DIR"

if [ ! -f "app.json" ]; then
  echo -e "${RED}ERROR: app.json not found. Are you in the right directory?${NC}"
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo -e "${RED}ERROR: package.json not found.${NC}"
  exit 1
fi

echo -e "  ${GREEN}✓${NC} Project root: $PROJECT_DIR"

# ─── Step 4: Install dependencies (if needed) ─────────────────────────
echo -e "${BOLD}[4/7]${NC} Checking dependencies..."

if [ ! -d "node_modules" ]; then
  echo -e "  ${YELLOW}node_modules not found, running npm install...${NC}"
  npm install --silent
fi

echo -e "  ${GREEN}✓${NC} Dependencies present"

# ─── Step 5: Run expo doctor ──────────────────────────────────────────
echo -e "${BOLD}[5/7]${NC} Running expo-doctor..."

if npx expo-doctor 2>&1; then
  echo -e "  ${GREEN}✓${NC} expo-doctor passed"
else
  echo -e "${YELLOW}⚠ expo-doctor found issues. Review before proceeding.${NC}"
  echo -e "  Consider: npx expo-doctor --fix-dependencies"
  echo ""
  read -rp "Continue anyway? [y/N] " CONTINUE
  if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
    echo "Aborted."
    exit 0
  fi
fi

# ─── Step 6: Check TypeScript compilation ─────────────────────────────
echo -e "${BOLD}[6/7]${NC} Checking TypeScript..."

if npx tsc --noEmit 2>&1; then
  echo -e "  ${GREEN}✓${NC} TypeScript compilation passed"
else
  echo -e "${RED}ERROR: TypeScript compilation failed. Fix type errors before deploying.${NC}"
  exit 1
fi

# ─── Step 7: Trigger EAS Production Build ─────────────────────────────
echo -e "${BOLD}[7/7]${NC} Triggering EAS production build..."

NO_WAIT_FLAG=""
if [ "$NO_WAIT" = true ]; then
  NO_WAIT_FLAG="--no-wait"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Platform:     ${BOLD}$PLATFORM${NC}"
echo -e "  Profile:      ${BOLD}production${NC}"
echo -e "  Distribution: ${BOLD}store${NC}"
echo -e "  Backend:      ${BOLD}$EXPO_PUBLIC_SUPABASE_URL${NC}"
echo -e "  Wait:         ${BOLD}$([ "$NO_WAIT" = true ] && echo "no" || echo "yes")${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Final confirmation for production
if [ "$NO_WAIT" != true ]; then
  echo -e "${YELLOW}This will create PRODUCTION builds for app store submission.${NC}"
  read -rp "Proceed? [y/N] " CONFIRM
  if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Aborted."
    exit 0
  fi
fi

echo ""
echo -e "${GREEN}Starting production build...${NC}"
echo ""

# Run the build — EAS handles platform routing and credentials
# shellcheck disable=SC2086
BUILD_OUTPUT=$(eas build \
  --profile production \
  --platform "$PLATFORM" \
  --non-interactive \
  $NO_WAIT_FLAG 2>&1) || BUILD_EXIT=$?

BUILD_LOG=$(echo "$BUILD_OUTPUT" | tail -20)

# ─── Extract Build URLs ───────────────────────────────────────────────
IOS_BUILD_URL=$(echo "$BUILD_LOG" | grep -oP 'https://expo\.dev/accounts/[^/]+/projects/[^/]+/builds/[a-f0-9-]+' | head -1 || true)
ANDROID_BUILD_URL=$(echo "$BUILD_LOG" | grep -oP 'https://expo\.dev/accounts/[^/]+/projects/[^/]+/builds/[a-f0-9-]+' | tail -1 || true)

# ─── Report ───────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}              Build Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$NO_WAIT" = true ]; then
  echo -e "  Status: ${YELLOW}Builds queued (--no-wait)${NC}"
  echo "  Track progress:"
  echo "    eas build:list"
  echo "    eas build:view <BUILD_ID>"
  echo ""
  if [ -n "$BUILD_OUTPUT" ]; then
    echo "  Build URLs (from output):"
    echo "$BUILD_OUTPUT" | grep -oP 'https://expo\.dev/accounts/[^\s]+' || echo "    (check eas build:list for URLs)"
  fi
else
  if [ -n "$IOS_BUILD_URL" ]; then
    echo -e "  ${GREEN}✓${NC} iOS build:     $IOS_BUILD_URL"
    echo ""
    echo "  Next steps for iOS:"
    echo "    eas submit --platform ios"
  fi
  if [ -n "$ANDROID_BUILD_URL" ]; then
    echo -e "  ${GREEN}✓${NC} Android build: $ANDROID_BUILD_URL"
    echo ""
    echo "  Next steps for Android:"
    echo "    eas submit --platform android"
  fi
  if [ -z "$IOS_BUILD_URL" ] && [ -z "$ANDROID_BUILD_URL" ]; then
    echo -e "  ${YELLOW}Could not extract build URLs from output.${NC}"
    echo "  Run: eas build:list"
  fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}Deployment script completed.${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
