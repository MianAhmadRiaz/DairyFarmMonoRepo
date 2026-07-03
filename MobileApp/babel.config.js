module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          assets: ['./src/assets'],
          routes: ['./src/routes'],
          screens: ['./src/screens'],
          shared: ['./src/shared'],
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
