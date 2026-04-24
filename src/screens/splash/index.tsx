import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
// If vector-icons is available in this app, we can use it. But looking at package.json, react-native-vector-icons is indeed installed.
import {
  Home,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogOut,
  FileText,
  Image as ImageIcon,
  Users,
  Camera,
  BarChart2,
  Bell,
  Share2,
  Plus,
  Edit2,
  Smile,
  AtSign,
  MapPin,
  Tag,
  Sliders,
  Calendar,
  Send,
  Check,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

// Colors — Exact Light Orange Theme from image
const CUSTOM_COLORS = {
  primary: '#ff6700',        // Vibrant orange
  secondary: '#ff9248',      // Medium orange
  tertiary: '#ffb38a',       // Light orange
  onBackground: '#431407',   // Deep brown for contrast
  onSurfaceVariant: '#7C3D12',
  onPrimary: '#ffffff',
  surface: '#ffd7b5',        // Lightest orange (background)
  surfaceDeep: '#ffb38a',    // Deeper orange for contrast
};

const SplashScreen = () => {
  // Animation Values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim1 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim2 = useRef(new Animated.Value(0.3)).current;
  const pulseAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Float Animation
    const float = Animated.sequence([
      Animated.timing(floatAnim, {
        toValue: -10,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);
    Animated.loop(float).start();

    // Pulse Animations
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1, // Full opacity / scale up
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3, // Low opacity / scale down
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    createPulse(pulseAnim1, 0).start();
    createPulse(pulseAnim2, 200).start();
    createPulse(pulseAnim3, 400).start();
  }, [floatAnim, pulseAnim1, pulseAnim2, pulseAnim3]);

  return (
    <View style={styles.backgroundImage}>
      {/* Subtle Glass Overlays (Simulated via translucent layer) */}
      <View style={styles.glassOverlay} />

      {/* Decorative Blur Elements (Simulated w/ opacity in React Native, since true backdrop filter blur is complex) */}
      <View style={[styles.decorativeCircle, styles.circleTopLeft]} />
      <View style={[styles.decorativeCircle, styles.circleBottomRight]} />

      <View style={styles.contentContainer}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ translateY: floatAnim }] },
          ]}>
          <Image
            source={require('../../Logos/PostOnce_AppIcon.jpg')}
            style={styles.logoImageStyle}
          />
        </Animated.View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>PostOnce</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>POST ONCE. SHARE EVERYWHERE.</Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              { backgroundColor: CUSTOM_COLORS.primary, opacity: pulseAnim1 },
              {
                transform: [
                  {
                    scale: pulseAnim1.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              { backgroundColor: CUSTOM_COLORS.secondary, opacity: pulseAnim2 },
              {
                transform: [
                  {
                    scale: pulseAnim2.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              { backgroundColor: CUSTOM_COLORS.tertiary, opacity: pulseAnim3 },
              {
                transform: [
                  {
                    scale: pulseAnim3.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffd7b5',   // exact palette: lightest orange
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', // no tint — use pure palette colors
  },
  decorativeCircle: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
  },
  circleTopLeft: {
    top: -90,
    left: -90,
    backgroundColor: '#ffb38a',   // exact palette: light orange
  },
  circleBottomRight: {
    bottom: -90,
    right: -90,
    backgroundColor: '#ff9248',   // exact palette: medium orange
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
    shadowColor: CUSTOM_COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImageStyle: {
    width: 96,
    height: 96,
    borderRadius: 32,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)', // Ensure transparent inner mostly
  },
  brandTitle: {
    fontFamily: 'Nano Banana Pro',
    fontSize: Platform.OS === 'ios' ? 48 : 40,
    fontWeight: '800',
    color: CUSTOM_COLORS.onBackground,
    marginBottom: 16,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: 'Nano Banana Pro',
    fontSize: 14,
    fontWeight: '600',
    color: CUSTOM_COLORS.onSurfaceVariant,
    letterSpacing: 2,
    opacity: 0.8,
    marginBottom: 64,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6, // polyfill for gap
  },
  footerContainer: {
    position: 'absolute',
    bottom: 48,
    zIndex: 10,
  },
  footerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(71, 69, 84, 0.4)', // on-surface-variant/40
    letterSpacing: 3,
  },
});

export default SplashScreen;
