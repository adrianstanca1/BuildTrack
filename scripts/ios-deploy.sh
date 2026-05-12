#!/usr/bin/env bash
# BuildTrack iOS Deployment Script
# Usage: ./scripts/ios-deploy.sh [profile]
# Profiles: production (default) | preview | ci

set -euo pipefail

PROFILE="${1:-production}"
echo "🚀 BuildTrack iOS Deployment"
echo "   Profile: $PROFILE"
echo "   Date: $(date -u)"
echo ""

# Verify credentials exist
if [ ! -f "/root/.config/apple-v2/AuthKey_S7PSXPJ963.p8" ]; then
    echo "❌ Apple API key not found at /root/.config/apple-v2/AuthKey_S7PSXPJ963.p8"
    exit 1
fi

# Check git status
if [ -n "$(git status --short)" ]; then
    echo "⚠️  Uncommitted changes detected:"
    git status --short
    read -p "Commit and push? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "build(ios): pre-deploy commit $(date -u +%Y-%m-%d)"
        git push origin master
    fi
fi

# Bump build number
echo "📦 Bumping iOS buildNumber..."
node -e "
const fs = require('fs');
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const current = app.expo.ios.buildNumber;
const parts = current.split('.');
const last = parseInt(parts.pop());
const next = parts.join('.') + '.' + (last + 1);
app.expo.ios.buildNumber = next;
fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
console.log('   ' + current + ' → ' + next);
"

# Commit bump
git add app.json
git commit -m "build(ios): bump buildNumber for $PROFILE deploy" || true
git push origin master

# Prebuild
echo "🔧 Running expo prebuild..."
npx expo prebuild --platform ios --clean

# Build
echo "🏗️  Starting EAS build..."
eas build --platform ios --profile "$PROFILE" --non-interactive --no-wait

echo ""
echo "✅ Build queued. Monitor at: https://expo.dev/accounts/adrianstanca/projects/buildtrack/builds"
echo "   Profile: $PROFILE"
echo "   To submit to TestFlight after build: eas submit --platform ios --latest"
