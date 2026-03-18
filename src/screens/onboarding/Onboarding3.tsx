import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BRAND_ACCENT = '#00b4d8';

const Onboarding3 = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#00b4d8', '#0096b4', '#0077b6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.root}>

      {/* Ambient white glow blob in center */}
      <View style={styles.glowBlob} />

      <View style={[styles.safeWrapper, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>🚀</Text>
            <Text style={styles.brandText}>PostOnce</Text>
          </View>
          {/* Page dots - right side, 3rd active */}
          <View style={styles.dotsRow}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>

        {/* ── Visual illustration area ── */}
        <View style={styles.illustrationArea}>

          {/* Floating "Scheduled" success chip — top-right */}
          <View style={styles.scheduledChip}>
            <View style={styles.scheduledChipIcon}>
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '900' }}>✓✓</Text>
            </View>
            <View>
              <Text style={styles.scheduledChipLabel}>SCHEDULED</Text>
              <Text style={styles.scheduledChipTime}>12:00 PM</Text>
            </View>
          </View>

          {/* Main glass schedule card */}
          <View style={styles.mainCard}>
            {/* Card top: calendar icon + lines + circle */}
            <View style={styles.cardTopRow}>
              <View style={styles.cardIconWrap}>
                <Text style={{ fontSize: 18 }}>📅</Text>
              </View>
              <View style={styles.cardTopLines}>
                <View style={[styles.shimmerLine, { width: 64, opacity: 0.4 }]} />
                <View style={[styles.shimmerLine, { width: 40, opacity: 0.2, marginTop: 5 }]} />
              </View>
              <View style={styles.cardCircleBtn} />
            </View>

            {/* Schedule row 1 — highlighted */}
            <View style={styles.scheduleRowActive}>
              <View style={styles.scheduleRowIconWrap}>
                <Text style={{ fontSize: 15 }}>🕐</Text>
              </View>
              <View style={[styles.shimmerLine, { flex: 1, height: 10, opacity: 0.6 }]} />
            </View>

            {/* Schedule row 2 — dimmed */}
            <View style={[styles.scheduleRowDim]}>
              <View style={styles.scheduleRowIconWrapDim}>
                <Text style={{ fontSize: 15 }}>📆</Text>
              </View>
              <View style={[styles.shimmerLine, { flex: 1, height: 8, opacity: 0.3 }]} />
            </View>
          </View>

          {/* Back decorative card — bottom-left, rotated */}
          <View style={styles.backCard}>
            <View style={styles.backCardTop}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>📊</Text>
              <View style={[styles.shimmerLine, { width: 48, opacity: 0.2 }]} />
            </View>
            <View style={styles.backCardBar} />
          </View>
        </View>

        {/* ── Text copy ── */}
        <View style={styles.copySection}>
          <Text style={styles.heroTitle}>Schedule posts and{'\n'}save time</Text>
          <Text style={styles.heroSubtitle}>
            Set your content calendar once and focus on what really matters.
          </Text>
        </View>

        {/* ── Footer CTA ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.88}>
            <Text style={styles.ctaText}>Get Started</Text>
            <Text style={styles.ctaArrow}> →</Text>
          </TouchableOpacity>
          <Text style={styles.footerLabel}>FINAL STEP OF YOUR JOURNEY</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Onboarding3;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glowBlob: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    // No blur in RN bare, approximate with large soft circle
  },

  safeWrapper: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoEmoji: {
    fontSize: 22,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  dotActive: {
    width: 32,
    backgroundColor: '#ffffff',
  },

  // Illustration
  illustrationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 32,
  },

  // Floating scheduled chip
  scheduledChip: {
    position: 'absolute',
    top: 12,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 20,
  },
  scheduledChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduledChipLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#292f35',
    letterSpacing: 1,
  },
  scheduledChipTime: {
    fontSize: 12,
    fontWeight: '900',
    color: BRAND_ACCENT,
    marginTop: 1,
  },

  // Main glass card
  mainCard: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 20,
    gap: 14,
    zIndex: 10,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopLines: {
    flex: 1,
  },
  cardCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  shimmerLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  // Active schedule row
  scheduleRowActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
  },
  scheduleRowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dim schedule row
  scheduleRowDim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
    opacity: 0.6,
  },
  scheduleRowIconWrapDim: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Back decorative card
  backCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: '45%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    transform: [{ rotate: '-4deg' }],
    opacity: 0.8,
    zIndex: 5,
  },
  backCardTop: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  backCardBar: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Copy section
  copySection: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1.2,
    lineHeight: 46,
    textAlign: 'center',
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: 280,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 14,
  },
  ctaButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.18)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  ctaText: {
    color: '#292f35',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  ctaArrow: {
    color: '#292f35',
    fontSize: 18,
    fontWeight: '700',
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
