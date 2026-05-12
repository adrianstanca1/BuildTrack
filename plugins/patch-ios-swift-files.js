const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin that patches generated iOS Swift files AFTER prebuild.
 * This runs after Expo generates the iOS project but before xcodebuild.
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

module.exports = function withPatchIOSSwiftFiles(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      console.log('🔧 [patch-ios-swift-files] Patching generated iOS project...');

      // Find ExpoModulesCore in Pods directory
      const iosDir = path.join(config.modRequest.projectRoot, 'ios');
      const podsDirs = [
        path.join(iosDir, 'Pods/ExpoModulesCore/ios'),
        path.join(iosDir, 'Pods/expo-modules-core/ios'),
      ];

      // Also try to find dynamically
      let foundPath = null;
      for (const p of podsDirs) {
        if (fs.existsSync(p)) {
          foundPath = p;
          break;
        }
      }

      // Dynamic search as fallback
      if (!foundPath) {
        const searchDirs = [
          path.join(iosDir, 'Pods'),
        ];
        for (const dir of searchDirs) {
          if (!fs.existsSync(dir)) continue;
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory() && entry.name.toLowerCase().includes('expo')) {
              const candidate = path.join(dir, entry.name, 'ios');
              if (fs.existsSync(candidate)) {
                foundPath = candidate;
                console.log(`  Found ExpoModulesCore at: ${candidate}`);
                break;
              }
            }
          }
          if (foundPath) break;
        }
      }

      if (!foundPath) {
        console.log('⚠️  [patch-ios-swift-files] ExpoModulesCore not found in Pods');
        // List what's in Pods directory for debugging
        const podsPath = path.join(iosDir, 'Pods');
        if (fs.existsSync(podsPath)) {
          console.log('  Pods directory exists. Contents:');
          const entries = fs.readdirSync(podsPath).filter(e => e.toLowerCase().includes('expo'));
          console.log('  Expo-related directories:', entries);
        }
        return config;
      }

      const basePath = foundPath;
      console.log(`🔧 Patching ${basePath}...`);

      // Apply all 8 patches
      const patches = [
        {
          file: 'ReactDelegates/ExpoReactDelegate.swift',
          search: 'return windowScene?.keyWindow?.rootViewController?.children.first(where: { _ in true }) ?? UIViewController()',
          replace: 'return windowScene?.keyWindow?.rootViewController?.children.first(where: { _ in true }) ?? MainActor.assumeIsolated { UIViewController() }'
        },
        {
          file: 'Core/Logging/PersistentFileLog.swift',
          search: 'filter: @escaping PersistentFileLogFilter',
          replace: 'filter: @escaping @Sendable PersistentFileLogFilter'
        },
        {
          file: 'Core/Views/SwiftUI/SwiftUIHostingView.swift',
          search: 'public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, @MainActor AnyExpoSwiftUIHostingView {',
          replace: 'public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, AnyExpoSwiftUIHostingView {'
        },
        {
          file: 'Core/Views/SwiftUI/SwiftUIHostingView.swift',
          search: 'public override func updateProps(_ rawProps: [String: Any]) {',
          replace: '@MainActor public override func updateProps(_ rawProps: [String: Any]) {  // @MainActor inherited from class'
        },
        {
          file: 'Core/Views/SwiftUI/SwiftUIVirtualView.swift',
          search: 'if let child = childComponentView as AnyObject as? (any AnyChild) {',
          replace: 'if let child = MainActor.assumeIsolated({ childComponentView as AnyObject as? (any AnyChild) }) {'
        },
        {
          file: 'Core/Views/SwiftUI/SwiftUIVirtualView.swift',
          search: "props.objectWillChange.send()",
          replace: "MainActor.assumeIsolated { props.objectWillChange.send() }"
        },
        {
          file: 'Core/Views/ViewDefinition.swift',
          search: 'extension UIView: @MainActor AnyArgument {',
          replace: '@MainActor\nextension UIView: AnyArgument {'
        },
        {
          file: 'Core/Views/SwiftUI/SwiftUIVirtualView.swift',
          search: 'extension ExpoSwiftUI.SwiftUIVirtualView: @MainActor ExpoSwiftUI.ViewWrapper {',
          replace: '@MainActor\nextension ExpoSwiftUI.SwiftUIVirtualView: ExpoSwiftUI.ViewWrapper {'
        }
      ];

      let seenFiles = new Set();
      for (const patch of patches) {
        const filePath = path.join(basePath, patch.file);
        if (!seenFiles.has(filePath)) {
          seenFiles.add(filePath);
        }
        patchFile(filePath, patch.search, patch.replace);
      }

      console.log('✅ [patch-ios-swift-files] Complete');
      return config;
    },
  ]);
};
