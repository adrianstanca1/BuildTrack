const fs = require('fs');
const path = require('path');

/**
 * Patch expo-router for Xcode 16 / iOS SDK compatibility.
 * Removes .prominent reference which is only available in iOS 26+.
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

// Find expo-router in all possible locations
const possiblePaths = [
  'node_modules/expo-router/ios',
  'node_modules/expo/node_modules/expo-router/ios',
];

let patchedAny = false;

for (const basePath of possiblePaths) {
  if (!fs.existsSync(basePath)) continue;

  console.log(`🔧 Patching expo-router at ${basePath}...`);

  // Patch RouterToolbarModule.swift — remove .prominent case
  patchedAny |= patchFile(
    path.join(basePath, 'Toolbar/RouterToolbarModule.swift'),
    `    case .prominent:
      if #available(iOS 26.0, *) {
        return .prominent
      } else {
        return .done
      }`,
    `    case .prominent:
      return .done`
  );
}

if (patchedAny) {
  console.log('\n✅ expo-router patched successfully');
  process.exit(0);
} else {
  console.log('\n⚠️  No patches applied');
  process.exit(0);
}
