const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable platform-specific file extensions (.web.tsx, .web.ts, etc.)
// Metro resolves these automatically — this just makes it explicit.
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Prefer CommonJS package entry points over the "import"/"module" (ESM)
// conditions. Some deps (e.g. zustand v4) ship ESM builds that use
// `import.meta.env`, which the browser rejects ("Cannot use 'import.meta'
// outside a module") because Metro serves the web bundle as a classic
// script. Dropping "import"/"module" makes Metro resolve their CJS builds.
config.resolver.unstable_conditionNames = ['require', 'react-native', 'browser'];

module.exports = config;
