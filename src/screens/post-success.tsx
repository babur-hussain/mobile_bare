import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Bell,
  Check,
  Heart,
  Sparkles,
  Camera,
  AtSign,
  Users,
  Youtube,
  Twitter,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

const APP_COLORS = {
  primary: '#5341cd',
  secondary: '#0058bd',
  tertiary: '#b2004b',
  surface: '#fcf9f8',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#474554',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHighest: '#e5e2e1',
  outlineVariant: '#c8c4d7',
  outline: '#787586',
  onPrimary: '#ffffff',
  instagram: '#E1306C',
  facebook: '#1877F2',
  youtube: '#FF0000',
  twitter: '#1DA1F2',
  threads: '#000000',
};

// Map platform strings to UI props
const platformIcons: Record<string, any> = {
  instagram: {icon: Camera, color: APP_COLORS.instagram, label: 'Ig'},
  facebook: {icon: Users, color: APP_COLORS.facebook, label: 'Fb'},
  youtube: {icon: Youtube, color: APP_COLORS.youtube, label: 'Yt'},
  x: {icon: Twitter, color: APP_COLORS.twitter, label: 'X'},
  threads: {icon: AtSign, color: APP_COLORS.threads, label: 'Th'},
};

export default function PostSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  // Extract post details. Fallback empty array if missing.
  const {post} = (route.params as any) || {};
  const platforms: string[] = post?.platforms || [];

  // Animation Values
  const scaleValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(0);

  useEffect(() => {
    // Pop-in animation
    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Use a generalized reach estimate for UI polish as requested in the HTML reference.
  const estimatedReach =
    platforms.length > 0 ? `${platforms.length * 3.1}k+` : '0';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxZQKqX-J5qmmKK5iE521icZDb15TItgDzqld78zPzjd7wOauYhnitVkTwQ5Dj0qK2FOEufbqMBEW4hrsoSuxUf136oxQ1F-KSW3YUYdoxpcQJD2JAPFH8tfqb5jpiIgxrrEqGk3uEUNPEaecWZWiXnz_8UBAFgrUWgd-GeNyXRX0NEssuU2oA6nhTumecpxQ5fgkJkDkZK4v3QRwjskZOwjTp0H8zmZ8ESoopc4xIWRksNzlAMKMHegegYlU2TDErRBhiyMSEmFEa',
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.headerBrand}>PostOnce</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color={APP_COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Success Visual */}
        <View style={styles.visualContainer}>
          {/* Decorative Glow */}
          <View style={styles.glowEffect} />

          <Animated.View
            style={[
              styles.iconCircle,
              {opacity: opacityValue, transform: [{scale: scaleValue}]},
            ]}>
            <LinearGradient
              colors={[APP_COLORS.primary, '#6c5ce7']}
              style={styles.innerIconCircle}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <Check size={48} color={APP_COLORS.onPrimary} strokeWidth={3} />
            </LinearGradient>

            {/* Floating Assets */}
            <View style={styles.floatingHeart}>
              <Heart
                size={24}
                color={APP_COLORS.tertiary}
                fill={APP_COLORS.tertiary}
              />
            </View>
            <View style={styles.floatingStar}>
              <Sparkles
                size={32}
                color={APP_COLORS.secondary}
                fill={APP_COLORS.secondary}
              />
            </View>
          </Animated.View>
        </View>

        {/* Messaging */}
        <Text style={styles.title}>Post Published Successfully!</Text>
        <Text style={styles.description}>
          Your content is now live across all your selected platforms. Time to
          watch the engagement roll in!
        </Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CHANNELS</Text>
            <View style={styles.platformBadgeRow}>
              {platforms.length > 0 ? (
                platforms.map((plat, idx) => {
                  const pData = platformIcons[plat.toLowerCase()];
                  if (!pData) {
                    return null;
                  }
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.platformBadge,
                        {backgroundColor: pData.color},
                      ]}>
                      <Text style={styles.platformBadgeText}>
                        {pData.label}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: APP_COLORS.onSurface,
                    marginTop: 4,
                  }}>
                  None
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>REACH EST.</Text>
            <Text style={styles.statValue}>{estimatedReach}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Home')}>
            <LinearGradient
              colors={[APP_COLORS.primary, '#6c5ce7']}
              style={styles.primaryGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <Text style={styles.primaryButtonText}>Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={() => {
              if (post?._id) {
                // Try navigating directly to the details if we have it
                navigation.navigate('PostDetails', {post});
              } else {
                navigation.navigate('Home');
              }
            }}>
            <Text style={styles.secondaryButtonText}>View Published Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Background Texture Bottom */}
      <LinearGradient
        colors={[APP_COLORS.surfaceContainerLow, 'transparent']}
        start={{x: 0, y: 1}}
        end={{x: 0, y: 0}}
        style={styles.bottomTexture}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 10,
    backgroundColor: 'rgba(252, 249, 248, 0.7)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  iconButton: {
    padding: 8,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
    marginTop: -80, // Offset header visually to truly center
  },
  visualContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  glowEffect: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: APP_COLORS.primary,
    opacity: 0.15,
    borderRadius: 125,
    transform: [{scale: 1.5}],
    top: -50,
    left: -60,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.1)',
  },
  innerIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeart: {
    position: 'absolute',
    top: -16,
    right: -8,
  },
  floatingStar: {
    position: 'absolute',
    top: '50%',
    left: -32,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -1,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: APP_COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 48,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceContainerLow,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.1)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: APP_COLORS.outline,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  platformBadgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  platformBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8, // overlapping
    borderWidth: 2,
    borderColor: APP_COLORS.surfaceContainerLow,
  },
  platformBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: APP_COLORS.secondary,
    marginTop: 4,
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    shadowColor: APP_COLORS.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryGradient: {
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: APP_COLORS.onPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: APP_COLORS.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTexture: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.33,
    zIndex: 0,
    opacity: 0.5,
  },
});
