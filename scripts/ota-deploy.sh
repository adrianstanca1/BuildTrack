#!/usr/bin/env bash
# BuildTrack OTA Update Deployment Script
# Usage: ./scripts/ota-deploy.sh [message]

set -euo pipefail

MESSAGE="${1:-BuildTrack update $(date -u +%Y-%m-%d)}"
BRANCH="production"

echo "🚀 BuildTrack OTA Update Deployment"
echo "   Branch: $BRANCH"
echo "   Message: $MESSAGE"
echo "   Date: $(date -u)"
echo ""

# Verify repo is clean
if [ -n "$(git status --short)" ]; then
    echo "⚠️  Uncommitted changes detected:"
    git status --short
    exit 1
fi

# Export bundle
echo "📦 Exporting update bundle..."
npx expo export --platform ios --platform android --output-dir dist-update

# Publish update
echo "📤 Publishing to EAS Update..."
eas update --branch "$BRANCH" --environment production --message "$MESSAGE" --input-dir dist-update --non-interactive

echo ""
echo "✅ OTA Update published!"
echo "   Dashboard: https://expo.dev/accounts/adrianstanca/projects/buildtrack/updates"
echo "   Users will receive update on next app launch"
