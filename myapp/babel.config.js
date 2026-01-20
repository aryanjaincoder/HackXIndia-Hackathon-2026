module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ... potentially other plugins ...
    'react-native-reanimated/plugin', // MUST BE LAST
  ],
};
