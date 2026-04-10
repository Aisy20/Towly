const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable platform-specific file extensions (.web.tsx, .web.ts, etc.)
// Metro resolves these automatically — this just makes it explicit.
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
