const fs = require('fs');
const path = require('path');

// Patch expo-modules-core for Xcode 16 / Swift 6 compatibility
// This runs after npm install (including EAS's internal install)

function patchFile(filePath, search, replace) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Skipping ${filePath} (not found)`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(search)) {
    console.log(`  ⚠️  Already patched or different version: ${path.basename(filePath)}`);
    return false;
  }
  
  const newContent = content.replace(search, replace);
  if (newContent === content) {
    console.log(`  ⚠️  No changes needed: ${path.basename(filePath)}`);
    return false;
  }
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`  ✅ Patched ${path.basename(filePath)}`);
  return true;
}

// Find expo-modules-core in all possible locations
const possiblePaths = [
  'node_modules/expo-modules-core/ios',
  'node_modules/expo/node_modules/expo-modules-core/ios',
];

let patchedAny = false;

for (const basePath of possiblePaths) {
  if (!fs.existsSync(basePath)) continue;
  
  console.log(`🔧 Patching ${basePath}...`);
  
  // Patch 1: ExpoReactDelegate.swift
  patchedAny |= patchFile(
    path.join(basePath, 'ReactDelegates/ExpoReactDelegate.swift'),
    'return windowScene?.keyWindow?.rootViewController?.children.first(where: { _ in true }) ?? UIViewController()',
    'return windowScene?.keyWindow?.rootViewController?.children.first(where: { _ in true }) ?? MainActor.assumeIsolated { UIViewController() }'
  );
  
  // Patch 2: PersistentFileLog.swift
  patchedAny |= patchFile(
    path.join(basePath, 'Core/Logging/PersistentFileLog.swift'),
    'filter: @escaping PersistentFileLogFilter',
    'filter: @escaping @Sendable PersistentFileLogFilter'
  );
  
  // Patch 3: SwiftUIHostingView.swift
  patchedAny |= patchFile(
    path.join(basePath, 'Core/Views/SwiftUI/SwiftUIHostingView.swift'),
    'public class ExpoSwiftUIHostingView:',
    '@MainActor\npublic class ExpoSwiftUIHostingView:'
  );
}

if (patchedAny) {
  console.log('\n✅ Expo modules patched successfully for Xcode 16 compatibility');
} else {
  console.log('\n⚠️  No patches applied (may already be patched or files not found)');
}
