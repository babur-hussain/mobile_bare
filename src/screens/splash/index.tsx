import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
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
import {Colors} from '../../constants/colors';

const {width, height} = Dimensions.get('window');

// Colors extracted from HTML
const CUSTOM_COLORS = {
  primary: '#5341cd',
  secondary: '#0058bd',
  tertiary: '#b2004b',
  onBackground: '#1c1b1b',
  onSurfaceVariant: '#474554',
  onPrimary: '#ffffff',
  surface: '#fcf9f8',
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
    <ImageBackground
      source={{
        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj8ZrasD9DHXVWRRQPI3PAXlIXwIaUAk2S6zlmJUcvJxklb_se2p7ttiNMnuAzvMigOEFLOPqMPOMBW-lJHYMvYZ0LecXd8tMXnuufQnBj0TW6aRERAJwPE16THRp8fPJmGKFwJqYouy1KwvrGNddSe_CUrMJ4AvPKu2YTCfLPlOTetA2FdqBM-4wA4npUR0_KLlWbPzlqyn9hpFcJESXgxekdpllGAY-avPbBeNeB6bpN26wacAiaDzlgTHynM4aHGozDZKc3IO8x',
      }}
      style={styles.backgroundImage}
      resizeMode="cover">
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
            {transform: [{translateY: floatAnim}]},
          ]}>
          <ImageBackground
            source={{
              // Simple gradient fallback using base64 or a small image is ideal,
              // but we are using styling over image to simulate gradient container for now,
              // or using an image from the prompt to substitute the mesh gradient logomark.
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvikKCF7RmH3aoMS2B0cE7gGJ4LKEp2FJ7rxJ7009h-M2U5N8LIdggrJmqnFUFPo-OcOBjiO-zdE2AeJ8caOzyT5VMLs48DjQiBQyi5nUhDfEhqNOS1sLe_RdYwkHuUTUlLW32RZCtWdTbC-Usmr0YObJJZf3MLudA-0iaeyvVL_FVHAvY2jGaaHM3YoMYZ9V1gHY8UEkUX6FzZCPpdvCUZzmN40vWahsyeBlUD68ExBZVT1Q19l6PTuEZnLM5Kmre90jFAuAz9BK9',
            }}
            style={styles.logoBackground}
            imageStyle={styles.logoImageStyle}>
            {/* If we strictly need the Material symbol inside the gradient block */}
            <View style={styles.logoInner}>
              <Send size={40} color={CUSTOM_COLORS.onPrimary} />
            </View>
          </ImageBackground>
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
              {backgroundColor: CUSTOM_COLORS.primary, opacity: pulseAnim1},
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
              {backgroundColor: CUSTOM_COLORS.secondary, opacity: pulseAnim2},
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
              {backgroundColor: CUSTOM_COLORS.tertiary, opacity: pulseAnim3},
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

      {/* Bottom Footer Credit */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>EDITORIAL STUDIO V1.0</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CUSTOM_COLORS.surface,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(252, 249, 248, 0.4)', // surface/40
  },
  decorativeCircle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  circleTopLeft: {
    top: -80,
    left: -80,
    backgroundColor: 'rgba(83, 65, 205, 0.2)', // primary/20
  },
  circleBottomRight: {
    bottom: -80,
    right: -80,
    backgroundColor: 'rgba(178, 0, 75, 0.2)', // tertiary/20
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
  logoBackground: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImageStyle: {
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
    fontSize: Platform.OS === 'ios' ? 48 : 40,
    fontWeight: '800',
    color: CUSTOM_COLORS.onBackground,
    marginBottom: 16,
    letterSpacing: -1,
  },
  tagline: {
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
