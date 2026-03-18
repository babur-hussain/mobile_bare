module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null, // We handle font linking via Info.plist UIAppFonts
      },
    },
  },
  assets: ['./node_modules/react-native-vector-icons/Fonts'],
};
