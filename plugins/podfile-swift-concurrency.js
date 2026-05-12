const { withPodfile } = require('@expo/config-plugins');

/**
 * Config plugin to add a post_install hook to the Podfile.
 * Sets SWIFT_STRICT_CONCURRENCY=minimal for ALL targets (including Pods),
 * which prevents Xcode 16 / Swift 6 strict concurrency errors.
 */
function withPodfileSwiftConcurrencyFix(config) {
  return withPodfile(config, (config) => {
    // modResults is { path, contents, didMerge, language }
    const podfile = config.modResults.contents;
    
    if (typeof podfile !== 'string') {
      console.log('[podfile-swift-concurrency] Warning: podfile.contents is not a string');
      return config;
    }
    
    // The hook to inject
    const hook = `
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
      config.build_settings['SWIFT_VERSION'] = '5.0'
      config.build_settings['GCC_TREAT_WARNINGS_AS_ERRORS'] = 'NO'
      config.build_settings['SWIFT_TREAT_WARNINGS_AS_ERRORS'] = 'NO'
    end
  end
end
`;
    
    // Only add if not already present
    if (!podfile.includes("SWIFT_STRICT_CONCURRENCY")) {
      config.modResults = {
        ...config.modResults,
        contents: podfile + "\n" + hook,
      };
      console.log('[podfile-swift-concurrency] Added post_install hook to disable Swift 6 strict concurrency');
    } else {
      console.log('[podfile-swift-concurrency] Hook already present');
    }
    
    return config;
  });
}

module.exports = withPodfileSwiftConcurrencyFix;
