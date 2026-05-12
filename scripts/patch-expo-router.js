const fs = require('fs');
const path = require('path');

/**
 * Patch expo-router for older Xcode toolchains that EAS Build uses.
 *
 * iOS 26.0 introduced new UIBarButtonItem / UINavigationItem APIs:
 *   - UIBarButtonItem.Style.prominent
 *   - UIBarButtonItem.hidesSharedBackground / .sharesBackground
 *   - UIBarButtonItem.Badge / .badge
 *   - UINavigationItem.searchBarPlacementBarButtonItem
 *
 * Swift's `if #available(iOS 26.0, *)` is a RUNTIME check — the compiler
 * still requires the symbols to exist in the SDK headers. EAS Build's
 * Xcode 16 SDK doesn't have them, so the whole compile fails. We strip
 * the offending blocks here (postinstall). The patches are idempotent;
 * if expo-router updates and the strings drift, the script no-ops with
 * a warning rather than failing the build.
 */

function patchFile(filePath, search, replace, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Skipping ${label} — file missing`);
    return false;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(search)) {
    console.log(`  ⚠️  ${label}: already patched or string drift`);
    return false;
  }
  const newContent = content.replace(search, replace);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`  ✅ ${label}`);
  return true;
}

const possiblePaths = [
  'node_modules/expo-router/ios',
  'node_modules/expo/node_modules/expo-router/ios',
];

let patchedAny = false;
for (const basePath of possiblePaths) {
  if (!fs.existsSync(basePath)) continue;
  console.log(`🔧 Patching expo-router at ${basePath}...`);

  // ── RouterToolbarModule.swift: .prominent style case ────────────────
  patchedAny |= patchFile(
    path.join(basePath, 'Toolbar/RouterToolbarModule.swift'),
    `    case .prominent:
      if #available(iOS 26.0, *) {
        return .prominent
      } else {
        return .done
      }`,
    `    case .prominent:
      return .done`,
    'RouterToolbarModule.swift: .prominent → .done'
  );

  // ── RouterToolbarHostView.swift: hidesSharedBackground/sharesBackground on menu ──
  patchedAny |= patchFile(
    path.join(basePath, 'Toolbar/RouterToolbarHostView.swift'),
    `            if #available(iOS 26.0, *) {
              if let hidesSharedBackground = menu.hidesSharedBackground {
                item.hidesSharedBackground = hidesSharedBackground
              }
              if let sharesBackground = menu.sharesBackground {
                item.sharesBackground = sharesBackground
              }
            }
`,
    `            // [patched for iOS<26 SDK] hidesSharedBackground / sharesBackground stripped
`,
    'RouterToolbarHostView.swift: hidesSharedBackground/sharesBackground (menu)'
  );

  // ── RouterToolbarItemView.swift: searchBar branch (uses searchBarPlacementBarButtonItem) ──
  patchedAny |= patchFile(
    path.join(basePath, 'Toolbar/RouterToolbarItemView.swift'),
    `    } else if type == .searchBar {
      guard #available(iOS 26.0, *), let controller = self.host?.findViewController() else {
        // Check for iOS 26, should already be guarded by the JS side, so this warning will only fire if controller is nil
        logger?.warn(
          "[expo-router] navigationItem.searchBarPlacementBarButtonItem not available. This is most likely a bug in expo-router."
        )
        currentBarButtonItem = nil
        return
      }
      guard let navController = controller.navigationController else {
        currentBarButtonItem = nil
        return
      }
      guard navController.isNavigationBarHidden == false else {
        logger?.warn(
          "[expo-router] Toolbar.SearchBarPreferredSlot should only be used when stack header is shown."
        )
        currentBarButtonItem = nil
        return
      }

      item = controller.navigationItem.searchBarPlacementBarButtonItem
    } else {`,
    `    } else if type == .searchBar {
      // [patched for iOS<26 SDK] searchBarPlacementBarButtonItem unavailable; toolbar search slot is a no-op
      logger?.warn(
        "[expo-router] navigationItem.searchBarPlacementBarButtonItem requires iOS 26 SDK; disabled in this build."
      )
      currentBarButtonItem = nil
      return
    } else {`,
    'RouterToolbarItemView.swift: searchBar branch (searchBarPlacementBarButtonItem)'
  );

  // ── RouterToolbarItemView.swift: applyCommonProperties hidesSharedBackground/sharesBackground ──
  patchedAny |= patchFile(
    path.join(basePath, 'Toolbar/RouterToolbarItemView.swift'),
    `    if #available(iOS 26.0, *) {
      item.hidesSharedBackground = hidesSharedBackground
      item.sharesBackground = sharesBackground
    }
`,
    `    // [patched for iOS<26 SDK] hidesSharedBackground / sharesBackground stripped
`,
    'RouterToolbarItemView.swift: applyCommonProperties hidesSharedBackground/sharesBackground'
  );

  // ── RouterToolbarItemView.swift: Badge configuration block ──
  patchedAny |= patchFile(
    path.join(basePath, 'Toolbar/RouterToolbarItemView.swift'),
    `    if #available(iOS 26.0, *) {
      if let badgeConfig = badgeConfiguration {
        var badge = UIBarButtonItem.Badge.indicator()
        if let value = badgeConfig.value {
          badge = .string(value)
        }
        if let backgroundColor = badgeConfig.backgroundColor {
          badge.backgroundColor = backgroundColor
        }
        if let foregroundColor = badgeConfig.color {
          badge.foregroundColor = foregroundColor
        }
        if badgeConfig.fontFamily != nil || badgeConfig.fontSize != nil
          || badgeConfig.fontWeight != nil {
          let font = RouterFontUtils.convertTitleStyleToFont(
            TitleStyle(
              fontFamily: badgeConfig.fontFamily,
              fontSize: badgeConfig.fontSize,
              fontWeight: badgeConfig.fontWeight
            ))
          badge.font = font
        }
        item.badge = badge
      } else {
        item.badge = nil
      }
    }
`,
    `    // [patched for iOS<26 SDK] UIBarButtonItem.Badge / .badge unavailable; badge config stripped
`,
    'RouterToolbarItemView.swift: Badge configuration block'
  );
}

if (patchedAny) {
  console.log('\n✅ expo-router patched successfully for iOS<26 SDK');
  process.exit(0);
} else {
  console.log('\n⚠️  No patches applied (already patched or string drift)');
  process.exit(0);
}
