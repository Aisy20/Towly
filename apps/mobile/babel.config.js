module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for react-native-reanimated v3.
      // Must be listed last among plugins.
      'react-native-reanimated/plugin',
    ],
  };
};
