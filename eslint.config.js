// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const tsEslintPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Allow underscore-prefixed identifiers to be intentionally unused
    // (e.g. `_router` for a hook return reserved for future use, `_input`
    // in a typed handler signature). The plugin must be re-attached
    // here because the flat-config resolver doesn't carry it through.
    plugins: { "@typescript-eslint": tsEslintPlugin },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);
