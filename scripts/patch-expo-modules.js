const fs = require('fs');
const path = require('path');

/**
 * Patch expo-modules-core for Xcode 16 / Swift 6 strict concurrency compatibility.
 * 
 * EAS --local re-runs npm install in a temp directory. Since patch-package only
 * patches the top-level copy, this script also patches the nested copy under
 * expo/node_modules/expo-modules-core.
 */

function patchFile(filePath, search, replace) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Skipping ${path.basename(filePath)} (not found)`);
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

// Run patch-package first
const { execSync } = require('child_process');
try {
  execSync('npx patch-package', { stdio: 'inherit' });
} catch (e) {
  console.log('⚠️  patch-package failed or no patches to apply');
}

// Patch all expo-modules-core installations
const possiblePaths = [
  'node_modules/expo-modules-core/ios',
  'node_modules/expo/node_modules/expo-modules-core/ios',
];

let patchedAny = false;

for (const basePath of possiblePaths) {
  if (!fs.existsSync(basePath)) continue;

  console.log(`\n🔧 Patching ${basePath}...`);

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

  // Patch 3: SwiftUIHostingView.swift — class declaration
  patchedAny |= patchFile(
    path.join(basePath, 'Core/Views/SwiftUI/SwiftUIHostingView.swift'),
    'public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, @MainActor AnyExpoSwiftUIHostingView {',
    'public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, AnyExpoSwiftUIHostingView {'
  );

  // Patch 4: SwiftUIHostingView.swift — updateProps
  patchedAny |= patchFile(
    path.join(basePath, 'Core/Views/SwiftUI/SwiftUIHostingView.swift'),
    'public override func updateProps(_ rawProps: [String: Any]) {',
    '@MainActor public override func updateProps(_ rawProps: [String: Any]) {  // @MainActor inherited from class'
  );

  // Patch 5: SwiftUIVirtualView.swift — childViewId
  patchedAny |= patchFile(
    path.join(basePath, 'Core/Views/SwiftUI/SwiftUIVirtualView.swift'),
    'if let child = childComponentView as AnyObject as? (any AnyChild) {',
    'if let child = MainActor.assumeIsolated({ childComponentView as AnyObject as? (any AnyChild) }) {'
  );

  // Patch 6: SwiftUIVirtualView.swift — objectWillChange.send
  patchedAny |= patchFile(
    path.join(basePath, 'Core/Views/SwiftUI/SwiftUIVirtualView.swift'),
    "props.objectWillChange.send()",
    "MainActor.assumeIsolated { props.objectWillChange.send() }"
  );

  // Patch 7: ViewDefinition.swift
  patchedAny |= patchFile(
    path.join(basePath, 'Core/Views/ViewDefinition.swift'),
    'extension UIView: @MainActor AnyArgument {',
    '@MainActor\nextension UIView: AnyArgument {'
  );

  // Patch 8: SwiftUIVirtualView.swift — ViewWrapper extension
  patchedAny |= patchFile(
    path.join(basePath, 'Core/Views/SwiftUI/SwiftUIVirtualView.swift'),
    'extension ExpoSwiftUI.SwiftUIVirtualView: @MainActor ExpoSwiftUI.ViewWrapper {',
    '@MainActor\nextension ExpoSwiftUI.SwiftUIVirtualView: ExpoSwiftUI.ViewWrapper {'
  );
}

if (patchedAny) {
  console.log('\n✅ Expo modules patched successfully for Xcode 16 compatibility');
} else {
  console.log('\n⚠️  No patches applied (may already be patched or files not found)');
}

process.exit(0);
