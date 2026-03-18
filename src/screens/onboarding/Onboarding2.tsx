import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Onboarding2 = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0d4a4e', '#0a6b6b', '#0d3d3d']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.root}>

      {/* Blob accents */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <View style={[styles.safeWrapper, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIconBox}>
              <Text style={styles.logoIconText}>🚀</Text>
            </View>
            <Text style={styles.brandText}>PostOnce</Text>
          </View>

          {/* Skip */}
          <TouchableOpacity
            style={styles.skipPill}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>

        {/* ── Scrollable body ── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>

          {/* Smart Automation badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>✦</Text>
            <Text style={styles.badgeText}>SMART AUTOMATION</Text>
          </View>

          {/* Hero headline */}
          <Text style={styles.heroTitle}>
            {'Post to\n'}
            <Text style={styles.heroHighlight}>{'Instagram & \nFacebook '}</Text>
            <Text style={styles.heroTitleWhite}>{'automatically'}</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.heroSubtitle}>
            Stop manual double-posting. Draft once, and our AI-sync engine handles the
            formatting and distribution across your socials instantly.
          </Text>

          {/* Continue button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Onboarding3')}
            activeOpacity={0.88}>
            <Text style={styles.ctaText}>Continue</Text>
            <Text style={styles.ctaArrow}> →</Text>
          </TouchableOpacity>

          {/* ── Preview card (bottom) ── */}
          <View style={styles.previewCard}>
            {/* Card top bar dots + status */}
            <View style={styles.previewTopBar}>
              <View style={styles.previewDots}>
                <View style={[styles.previewDot, { opacity: 0.35 }]} />
                <View style={[styles.previewDot, { opacity: 0.35 }]} />
                <View style={[styles.previewDot, { opacity: 0.35 }]} />
              </View>
              <View style={styles.activeSyncBadge}>
                <Text style={styles.activeSyncText}>ACTIVE SYNC</Text>
              </View>
            </View>

            {/* Mock post row */}
            <View style={styles.previewRow}>
              {/* Camera icon post */}
              <View style={styles.previewIconWrap}>
                <LinearGradient
                  colors={['#e1306c', '#833ab4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.previewIconGrad}>
                  <Text style={{ fontSize: 18 }}>📷</Text>
                </LinearGradient>
              </View>

              {/* Content lines */}
              <View style={styles.previewLines}>
                <View style={[styles.previewLine, { width: '75%', opacity: 0.55 }]} />
                <View style={[styles.previewLine, { width: '50%', marginTop: 6, opacity: 0.30 }]} />
              </View>

              {/* Sync icon */}
              <View style={styles.previewSyncIcon}>
                <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>🔁</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 12 }} />
        </ScrollView>

        {/* ── Page dots ── */}
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </View>
    </LinearGradient>
  );
};

export default Onboarding2;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Accent blobs
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    backgroundColor: 'rgba(0, 130, 130, 0.35)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(0, 80, 90, 0.5)',
  },

  safeWrapper: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    fontSize: 16,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  skipPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Scroll body
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  // SMART AUTOMATION badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeIcon: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Hero
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1.5,
    lineHeight: 50,
    marginBottom: 20,
  },
  heroHighlight: {
    color: 'rgba(255,255,255,0.40)',
  },
  heroTitleWhite: {
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 23,
    fontWeight: '400',
    marginBottom: 32,
  },

  // CTA button
  ctaButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaText: {
    color: '#0a5e5e',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  ctaArrow: {
    color: '#0a5e5e',
    fontSize: 18,
    fontWeight: '800',
  },

  // Preview card
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 20,
    paddingBottom: 24,
  },
  previewTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewDots: {
    flexDirection: 'row',
    gap: 6,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  activeSyncBadge: {
    backgroundColor: 'rgba(0,180,180,0.25)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,200,200,0.3)',
  },
  activeSyncText: {
    color: '#7ff0f0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Mock post row inside preview card
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  previewIconWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewIconGrad: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLines: {
    flex: 1,
  },
  previewLine: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
  },
  previewSyncIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Page dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 20,
    paddingTop: 8,
  },
  dot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
  },
});
