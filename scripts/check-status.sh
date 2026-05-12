#!/usr/bin/env bash
# BuildTrack iOS Deployment Status Check

echo "📱 BuildTrack iOS Status Check"
echo "=============================="
echo ""

# App info
echo "📦 App Info:"
echo "  Version: $(jq -r '.expo.version' app.json)"
echo "  iOS Build: $(jq -r '.expo.ios.buildNumber' app.json)"
echo "  Bundle ID: $(jq -r '.expo.ios.bundleIdentifier' app.json)"
echo ""

# Git status
echo "🔀 Git Status:"
DIRTY=$(git status --short | wc -l)
if [ "$DIRTY" -eq 0 ]; then
    echo "  ✅ Clean (0 uncommitted changes)"
else
    echo "  ⚠️  $DIRTY uncommitted files:"
    git status --short
fi
echo ""

# Last commit
echo "  Last commit: $(git log --oneline -1)"
echo ""

# Expo Doctor
echo "🔬 Expo Doctor:"
DOCTOR=$(npx expo-doctor 2>&1 | tail -3)
echo "  $DOCTOR"
echo ""

# EAS Build status
echo "🏗️  Last EAS iOS Build:"
eas build:list --platform ios --limit 1 --json 2>/dev/null | python3 -c "
import json,sys
d=sys.stdin.read().strip()
if d and d[0]=='[':
    b=json.loads(d)[0]
    print(f\"  Build {b.get('buildNumber','?')} | {b['status']} | {b.get('completedAt','?')[:19] if b.get('completedAt') else b.get('startedAt','?')[:19]}\")
else:
    print('  Could not fetch')
" 2>/dev/null || echo "  Could not fetch"
echo ""

# EAS Update status
echo "📤 Last OTA Update:"
eas update:list --branch production --limit 1 --json 2>/dev/null | python3 -c "
import json,sys
d=sys.stdin.read().strip()
try:
    j=json.loads(d)
    page=j.get('currentPage',[])
    if page:
        u=page[0]
        print(f\"  {u.get('createdAt','?')[:19]} | {u.get('message','?')[:40]}\")
    else:
        print('  None found')
except:
    print('  Could not fetch')
" 2>/dev/null || echo "  Could not fetch"
echo ""

# Credentials
echo "🔐 Credentials:"
if [ -f "/root/.config/apple-v2/AuthKey_S7PSXPJ963.p8" ]; then
    echo "  ✅ Apple API Key (S7PSXPJ963)"
else
    echo "  ❌ Apple API Key missing"
fi
if [ -f "/root/.eas-build/credentials" ]; then
    echo "  ✅ EAS credentials cached"
else
    echo "  ℹ️  EAS credentials not cached locally"
fi
echo ""

echo "✅ Status check complete"
