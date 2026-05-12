const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to disable Swift strict concurrency checks globally.
 * This prevents Xcode 16 / Swift 6 compilation errors in expo-modules-core.
 */
function withDisableStrictConcurrency(config) {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    // Apply to ALL build configurations
    for (const key in configurations) {
      const configEntry = configurations[key];
      if (typeof configEntry === 'object' && configEntry.buildSettings) {
        configEntry.buildSettings.SWIFT_STRICT_CONCURRENCY = 'minimal';
        configEntry.buildSettings.SWIFT_VERSION = '5.0';
        configEntry.buildSettings.GCC_TREAT_WARNINGS_AS_ERRORS = 'NO';
        configEntry.buildSettings.SWIFT_TREAT_WARNINGS_AS_ERRORS = 'NO';
      }
    }
    
    console.log('[disable-strict-concurrency] Set SWIFT_STRICT_CONCURRENCY=minimal for all targets');
    return config;
  });
}

module.exports = withDisableStrictConcurrency;
