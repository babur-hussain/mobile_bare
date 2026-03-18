import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Instagram,
  AtSign,
  BarChart2,
  Youtube,
  Twitter,
  Check,
  Plus,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchAllAccounts } from '../../store/actions/accounts.actions';
import { socialService } from '../../services/social.service';

const { width } = Dimensions.get('window');

// ── Platforms in the same order as accounts.tsx ──────────────────────────────
type PlatformKey = 'instagram' | 'threads' | 'facebook' | 'youtube' | 'x';

interface PlatformDef {
  key: PlatformKey;
  label: string;
  meta: string;
  iconColor: string;
  Icon: React.ComponentType<any>;
}

const PLATFORMS: PlatformDef[] = [
  { key: 'instagram', label: 'Instagram', meta: 'BUSINESS ACCOUNT', iconColor: '#5341cd', Icon: Instagram },
  { key: 'threads', label: 'Threads', meta: 'TEXT CONVERSATIONS', iconColor: '#1c1b1b', Icon: AtSign },
  { key: 'facebook', label: 'Facebook', meta: 'COMMUNITY REACH', iconColor: '#0058bd', Icon: BarChart2 },
  { key: 'youtube', label: 'YouTube', meta: 'VIDEO CONTENT', iconColor: '#b2004b', Icon: Youtube },
  { key: 'x', label: 'X (Twitter)', meta: 'UPDATE & TREND', iconColor: '#1DA1F2', Icon: Twitter },
];

const AVATAR_URLS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmcA1yRzR9Z7Ur9EeJMpTQlP7OYt5cAyBsRdgeLSeUiqIdlfyjqPjU1AkJIgr1lm-HwUgTW4OQCFOe30rM2PGadQC-uicjx8EnRivUrwAyRQ14BAn7yGVGKW6C_bBugQHNpM4sC72JqP43eMNtgPgGkwDkcbjSra4EmTdXpAYmj-gxbTmv5IykIX52x-nxk6e9Sn_bH8kxC0-A9Zgwh_8y6j1o7k7-uVilRvN_G21G499drIbK6_SWPtjRGLOui1vOz3_zS45_YeFz',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD6edTDPS9BlsjYn2icih_r87WYWF33Dg9BQ8VW9dPMjCxyuv_Dfw3f0qwbkMF1HBT65gsVqOTcGuk0V80D_Emuz-aPq2fUD_dJmbC16B_xA_uaa0zqY93m27d4sj2Ri-bW6uRZ5HVrM2SINc29fAeD3BzNzVR-3vN95d-zDIlL0qCwP3vQEVj82TaW6T8u34lzFq4K-__o3J7ei6Us6jn1upFLRWqviWThzUPsvnEYj4ullDJvNyNotzTUJkh4i-JPj6WG-NwE26x2',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD2KcTNVD7fSgsZ6TCamH1iR7rp4HXmLC0fV0nbBMjz_cwIK96-B2rQaHOwo26h1KOBMVz55P_3_IsSj7IajDJwcbxwtL4LznebWdYpc3rMifVd6GfQqdeQvcsMlWfaWH8BsRyOjIencqxUoEoDVRBVKyfhgFxaIMN7beAWoxVOMHsXLkVet3jFw0rhcroVuOQhGmJcjC5yPHam6hkguJSvpYujo2mYPKcIWgRsKhrdHcD2cBGcrxcY0hhheBSKAew2vZWYT9NwmH-5',
];

const Onboarding1 = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { items: accounts } = useSelector((state: RootState) => state.accounts);

  useEffect(() => {
    dispatch(fetchAllAccounts());
  }, [dispatch]);

  // ── same deep-link handler as accounts.tsx ───────────────────────────────
  const handleDeepLink = useCallback(
    (event: { url: string }) => {
      const url = event.url;
      if (url.startsWith('postingautomation://social-auth-callback')) {
        const queryString = url.split('?')[1] || '';
        const params: Record<string, string> = {};
        queryString.split('&').forEach(pair => {
          const [key, ...rest] = pair.split('=');
          if (key) params[key] = rest.join('=');
        });
        const success = params.success === 'true';
        const platform = params.platform;
        const account = params.account;
        const message = params.message;

        if (success && platform && account) {
          Alert.alert(
            'Account Connected',
            `Successfully connected ${decodeURIComponent(account)} on ${platform}.`,
          );
        } else {
          Alert.alert(
            'Connection Failed',
            message
              ? decodeURIComponent(message)
              : 'Failed to connect account. Please try again.',
          );
        }
        dispatch(fetchAllAccounts());
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });
    return () => subscription.remove();
  }, [handleDeepLink]);

  // ── same connect logic as accounts.tsx ───────────────────────────────────
  const handleConnect = async (platform: PlatformKey) => {
    try {
      const url = await socialService.getConnectUrl(platform);
      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        Alert.alert(
          'Connection Error',
          'Could not get a valid authorization URL. Please check your Meta app configuration.',
        );
        return;
      }
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(
          url,
          'postingautomation://',
          {
            ephemeralWebSession: false,
            showTitle: true,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
          },
        );
        if (result.type === 'success' && result.url) {
          handleDeepLink({ url: result.url });
        }
      } else {
        await Linking.openURL(url);
      }
    } catch (error: any) {
      Alert.alert(
        'Connection Error',
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start connection. Please try again.',
      );
    }
  };

  // ── check which platforms are already connected ───────────────────────────
  const isConnected = (key: PlatformKey): boolean => {
    if (key === 'x') {
      return accounts.some((a: any) => a.platform === 'x' || a.platform === 'twitter');
    }
    return accounts.some((a: any) => a.platform === key);
  };

  const connectedCount = PLATFORMS.filter(p => isConnected(p.key)).length;

  return (
    <LinearGradient
      colors={['#ff4d6d', '#b71029', '#468faf']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}>

      {/* Glow blobs */}
      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomRight} />

      <View style={[styles.safeWrapper, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.brandText}>PostOnce</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>

        {/* ── Scrollable body ── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>

          {/* Hero headline */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              {'Connect your\n'}
              <Text style={styles.heroTitleFade}>social accounts</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Sync your platforms once and reach your audience everywhere.{' '}
              High energy distribution starts here.
            </Text>
          </View>

          {/* Glass card */}
          <View style={styles.glassCard}>

            {/* Platform rows */}
            {PLATFORMS.map(p => {
              const connected = isConnected(p.key);
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.platformRow, connected && styles.platformRowLinked]}
                  onPress={() => !connected && handleConnect(p.key)}
                  activeOpacity={connected ? 1 : 0.75}>

                  {/* Icon box */}
                  <View style={styles.platformIconBox}>
                    <p.Icon size={22} color={p.iconColor} />
                  </View>

                  {/* Labels */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.platformName}>{p.label}</Text>
                    <Text style={[styles.platformStatus, connected && styles.platformStatusLinked]}>
                      {connected ? 'LINKED' : 'CONNECT'}
                    </Text>
                  </View>

                  {/* Action indicator */}
                  {connected ? (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="#ffffff" strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={styles.addCircle}>
                      <Plus size={16} color="rgba(255,255,255,0.55)" strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Social proof + CTA */}
            <View style={styles.proofSection}>
              <View style={styles.avatarRow}>
                {AVATAR_URLS.map((url, i) => (
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }]}
                    resizeMode="cover"
                  />
                ))}
                <View style={[styles.avatar, styles.avatarCount, { marginLeft: -10 }]}>
                  <Text style={styles.avatarCountText}>+2k</Text>
                </View>
              </View>
              <Text style={styles.proofText}>
                Join 2,000+ creators managing their presence with PostOnce.
              </Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Onboarding2')}
              activeOpacity={0.88}>
              <Text style={styles.ctaButtonText}>Continue Journey</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Page dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </LinearGradient>
  );
};

export default Onboarding1;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  blobTopLeft: {
    position: 'absolute', top: '-10%', left: '-10%',
    width: width * 0.6, height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#ff7576', opacity: 0.4,
  },
  blobBottomRight: {
    position: 'absolute', bottom: '-10%', right: '-10%',
    width: width * 0.6, height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#026381', opacity: 0.4,
  },

  safeWrapper: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  brandText: {
    fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5,
  },
  skipText: {
    color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 3,
  },

  scrollContent: { paddingHorizontal: 20 },

  heroSection: { marginBottom: 24, paddingHorizontal: 4 },
  heroTitle: {
    fontSize: 40, fontWeight: '900', color: '#ffffff',
    letterSpacing: -1.5, lineHeight: 46, marginBottom: 14,
  },
  heroTitleFade: { color: 'rgba(255,255,255,0.45)' },
  heroSubtitle: {
    fontSize: 15, color: 'rgba(255,255,255,0.80)', fontWeight: '500', lineHeight: 22,
  },

  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 16,
    gap: 10,
    shadowColor: 'rgba(41,47,53,0.2)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 10,
  },

  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  platformRowLinked: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  platformIconBox: {
    width: 46, height: 46, borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
  },
  platformName: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  platformStatus: {
    color: 'rgba(255,255,255,0.55)', fontSize: 9,
    fontWeight: '800', letterSpacing: 1.5,
    textTransform: 'uppercase', marginTop: 2,
  },
  platformStatusLinked: { color: '#ffffff' },

  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  addCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center', justifyContent: 'center',
  },

  proofSection: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginTop: 4,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden',
  },
  avatarCount: { alignItems: 'center', justifyContent: 'center' },
  avatarCountText: { color: '#ffffff', fontSize: 9, fontWeight: '900' },
  proofText: {
    flex: 1, color: 'rgba(255,255,255,0.7)',
    fontSize: 12, lineHeight: 17, fontWeight: '500',
  },

  ctaButton: {
    backgroundColor: '#ffffff', borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 6,
  },
  ctaButtonText: {
    color: '#b71029', fontWeight: '900', fontSize: 17, letterSpacing: -0.3,
  },

  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6,
    paddingBottom: 20, paddingTop: 8,
  },
  dot: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: { backgroundColor: '#ffffff' },
});
