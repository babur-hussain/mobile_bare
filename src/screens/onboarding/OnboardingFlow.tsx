/**
 * OnboardingFlow.tsx
 *
 * Wraps all three onboarding slides into a single swipeable container.
 * Uses React Native's built-in Animated + PanResponder — no extra libs needed.
 *
 * Swipe left  → next slide
 * Swipe right → previous slide
 * Tapping the CTA button in each slide also advances / exits.
 *
 * NOTE: Platform connect buttons navigate to Login because the
 * /social-accounts/... API requires authentication. Users connect
 * their accounts from the Accounts page after signing in.
 */

import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Instagram,
    AtSign,
    BarChart2,
    Youtube,
    Twitter,
    Plus,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TOTAL_SLIDES = 3;
const SWIPE_THRESHOLD = width * 0.25; // 25% of screen width to commit a swipe

// ─── Platform definitions (same order/icons as accounts.tsx) ─────────────────
const PLATFORMS = [
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

// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingFlow() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [currentSlide, setCurrentSlide] = useState(0);
    // Ref mirrors state so PanResponder callbacks always see the latest value
    // (PanResponder is created once in useRef — closures over state would be stale)
    const currentSlideRef = useRef(0);

    // Animated value for the horizontal translate of the slides container
    const translateX = useRef(new Animated.Value(0)).current;
    // Drag delta during an active gesture
    const dragX = useRef(new Animated.Value(0)).current;

    // ── Navigate slides ───────────────────────────────────────────────────────
    const goToSlide = (index: number, fromDrag = 0) => {
        const clampedIndex = Math.max(0, Math.min(TOTAL_SLIDES - 1, index));
        const targetX = -clampedIndex * width;
        Animated.spring(translateX, {
            toValue: targetX,
            useNativeDriver: true,
            tension: 60,
            friction: 10,
        }).start();
        currentSlideRef.current = clampedIndex;  // keep ref in sync
        setCurrentSlide(clampedIndex);
    };

    const goNext = () => {
        if (currentSlide < TOTAL_SLIDES - 1) {
            goToSlide(currentSlide + 1);
        }
    };

    const goPrev = () => {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    };

    // ── PanResponder ─────────────────────────────────────────────────────────
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only capture if horizontal movement is dominant
                return (
                    Math.abs(gestureState.dx) > 10 &&
                    Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2
                );
            },
            onPanResponderMove: (_, gestureState) => {
                // Use ref (not state) to avoid stale closure
                const baseX = -currentSlideRef.current * width;
                const rawX = baseX + gestureState.dx;
                const minX = -(TOTAL_SLIDES - 1) * width;
                const clampedX = Math.max(minX, Math.min(0, rawX));
                translateX.setValue(clampedX);
            },
            onPanResponderRelease: (_, gestureState) => {
                const slide = currentSlideRef.current;  // always fresh
                if (gestureState.dx < -SWIPE_THRESHOLD) {
                    goToSlide(Math.min(slide + 1, TOTAL_SLIDES - 1));
                } else if (gestureState.dx > SWIPE_THRESHOLD) {
                    goToSlide(Math.max(slide - 1, 0));
                } else {
                    goToSlide(slide);
                }
            },
            onPanResponderTerminate: () => {
                goToSlide(currentSlideRef.current);
            },
        }),
    ).current;

    // Connect buttons navigate to Login — the OAuth API requires an authenticated
    // user token that isn't available during onboarding. Users connect accounts
    // from the Accounts page after signing in.
    const skipToLogin = () => navigation.navigate('Login');

    // ─── Slide 1: Connect your social accounts ───────────────────────────────
    const renderSlide1 = () => (
        <LinearGradient colors={['#ff4d6d', '#b71029', '#468faf']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.slide}>
            <View style={styles.blobTopLeft} />
            <View style={styles.blobBottomRight} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Text style={styles.brandText}>PostOnce</Text>
                <TouchableOpacity onPress={skipToLogin}>
                    <Text style={styles.skipText}>SKIP</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.slideScrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                horizontal={false}
                scrollEnabled={true}
                bounces={false}>
                {/* Hero */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>{'Connect your\n'}<Text style={styles.heroTitleFade}>social accounts</Text></Text>
                    <Text style={styles.heroSubtitle}>Sync your platforms once and reach your audience everywhere. High energy distribution starts here.</Text>
                </View>

                {/* Glass card */}
                <View style={styles.glassCard}>
                    {PLATFORMS.map(p => (
                        <TouchableOpacity
                            key={p.key}
                            style={styles.platformRow}
                            onPress={skipToLogin}
                            activeOpacity={0.75}>
                            <View style={styles.platformIconBox}>
                                <p.Icon size={20} color={p.iconColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.platformName}>{p.label}</Text>
                                <Text style={styles.platformStatus}>CONNECT</Text>
                            </View>
                            <View style={styles.addCircle}>
                                <Plus size={14} color="rgba(255,255,255,0.55)" strokeWidth={2.5} />
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Social proof */}
                    <View style={styles.proofSection}>
                        <View style={styles.avatarRow}>
                            {AVATAR_URLS.map((url, i) => (
                                <Image key={i} source={{ uri: url }} style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }]} resizeMode="cover" />
                            ))}
                            <View style={[styles.avatar, styles.avatarCount, { marginLeft: -10 }]}>
                                <Text style={styles.avatarCountText}>+2k</Text>
                            </View>
                        </View>
                        <Text style={styles.proofText}>Join 2,000+ creators managing their presence with PostOnce.</Text>
                    </View>

                    <TouchableOpacity style={styles.ctaButton} onPress={goNext} activeOpacity={0.88}>
                        <Text style={styles.ctaButtonTextRed}>Continue Journey</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 16 }} />
            </ScrollView>
        </LinearGradient>
    );

    // ─── Slide 2: Post automatically ─────────────────────────────────────────
    const renderSlide2 = () => (
        <LinearGradient colors={['#0d4a4e', '#0a6b6b', '#0d3d3d']} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={styles.slide}>
            <View style={styles.blobTealTopRight} />
            <View style={styles.blobTealBottomLeft} />

            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <View style={styles.logoRow}>
                    <View style={styles.logoIconBox}><Text style={styles.logoIconText}>🚀</Text></View>
                    <Text style={styles.brandText}>PostOnce</Text>
                </View>
                <TouchableOpacity style={styles.skipPill} onPress={skipToLogin} activeOpacity={0.7}>
                    <Text style={styles.skipText}>SKIP</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.slideScrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                horizontal={false}
                scrollEnabled={true}
                bounces={false}>
                <View style={styles.badge}>
                    <Text style={styles.badgeIcon}>✦</Text>
                    <Text style={styles.badgeText}>SMART AUTOMATION</Text>
                </View>

                <Text style={styles.heroTitle}>
                    {'Post to\n'}<Text style={styles.heroHighlight}>{'Instagram & \nFacebook '}</Text><Text style={styles.brandText}>{'automatically'}</Text>
                </Text>

                <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.65)', marginBottom: 28 }]}>
                    Stop manual double-posting. Draft once, and our AI-sync engine handles the formatting and distribution across your socials instantly.
                </Text>

                <TouchableOpacity style={styles.ctaButtonTeal} onPress={goNext} activeOpacity={0.88}>
                    <Text style={styles.ctaTextTeal}>Continue</Text>
                    <Text style={styles.ctaTextTeal}> →</Text>
                </TouchableOpacity>

                {/* Preview card */}
                <View style={[styles.glassCard, { marginTop: 24 }]}>
                    <View style={styles.previewTopBar}>
                        <View style={styles.previewDots}>
                            {[0, 1, 2].map(i => <View key={i} style={[styles.previewDot, { opacity: 0.35 }]} />)}
                        </View>
                        <View style={styles.activeSyncBadge}><Text style={styles.activeSyncText}>ACTIVE SYNC</Text></View>
                    </View>
                    <View style={styles.previewRow}>
                        <View style={styles.previewIconWrap}>
                            <LinearGradient colors={['#e1306c', '#833ab4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.previewIconGrad}>
                                <Text style={{ fontSize: 16 }}>📷</Text>
                            </LinearGradient>
                        </View>
                        <View style={styles.previewLines}>
                            <View style={[styles.previewLine, { width: '75%', opacity: 0.55 }]} />
                            <View style={[styles.previewLine, { width: '50%', marginTop: 6, opacity: 0.30 }]} />
                        </View>
                        <View style={styles.previewSyncIcon}><Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>🔁</Text></View>
                    </View>
                </View>
                <View style={{ height: 16 }} />
            </ScrollView>
        </LinearGradient>
    );

    // ─── Slide 3: Schedule & save time ───────────────────────────────────────
    const renderSlide3 = () => (
        <LinearGradient colors={['#00b4d8', '#0096b4', '#0077b6']} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.slide}>
            <View style={styles.glowBlob} />

            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <View style={styles.logoRow}>
                    <Text style={styles.logoIconText}>🚀</Text>
                    <Text style={styles.brandText}>PostOnce</Text>
                </View>
                {/* Dots on right for slide 3 */}
                <View style={styles.inlineDotsRow}>
                    <View style={styles.inlineDot} />
                    <View style={styles.inlineDot} />
                    <View style={[styles.inlineDot, styles.inlineDotActive]} />
                </View>
            </View>

            {/* Visual area */}
            <View style={styles.illustrationArea}>
                <View style={styles.scheduledChip}>
                    <View style={styles.scheduledChipIcon}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>✓✓</Text></View>
                    <View>
                        <Text style={styles.scheduledChipLabel}>SCHEDULED</Text>
                        <Text style={styles.scheduledChipTime}>12:00 PM</Text>
                    </View>
                </View>

                <View style={[styles.glassCard, { width: '80%' }]}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.cardIconWrap}><Text style={{ fontSize: 16 }}>📅</Text></View>
                        <View style={styles.cardTopLines}>
                            <View style={[styles.shimmerLine, { width: 64, opacity: 0.4 }]} />
                            <View style={[styles.shimmerLine, { width: 40, opacity: 0.2, marginTop: 5 }]} />
                        </View>
                        <View style={styles.cardCircleBtn} />
                    </View>
                    <View style={styles.scheduleRowActive}>
                        <View style={styles.scheduleRowIconWrap}><Text style={{ fontSize: 13 }}>🕐</Text></View>
                        <View style={[styles.shimmerLine, { flex: 1, height: 10, opacity: 0.6 }]} />
                    </View>
                    <View style={[styles.scheduleRowDim]}>
                        <View style={styles.scheduleRowIconWrapDim}><Text style={{ fontSize: 13 }}>📆</Text></View>
                        <View style={[styles.shimmerLine, { flex: 1, height: 8, opacity: 0.3 }]} />
                    </View>
                </View>

                <View style={styles.backCard}>
                    <View style={styles.backCardTop}>
                        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>📊</Text>
                        <View style={[styles.shimmerLine, { width: 40, opacity: 0.2 }]} />
                    </View>
                    <View style={styles.backCardBar} />
                </View>
            </View>

            {/* Copy */}
            <View style={styles.copySection}>
                <Text style={[styles.heroTitle, { textAlign: 'center', fontSize: 34, lineHeight: 42 }]}>Schedule posts and{'\n'}save time</Text>
                <Text style={[styles.heroSubtitle, { textAlign: 'center', color: 'rgba(255,255,255,0.80)' }]}>Set your content calendar once and focus on what really matters.</Text>
            </View>

            {/* CTA */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
                <TouchableOpacity style={styles.ctaButtonWhite} onPress={skipToLogin} activeOpacity={0.88}>
                    <Text style={styles.ctaButtonTextDark}>Get Started</Text>
                    <Text style={styles.ctaButtonTextDark}> →</Text>
                </TouchableOpacity>
                <Text style={styles.footerLabel}>FINAL STEP OF YOUR JOURNEY</Text>
            </View>
        </LinearGradient>
    );

    // ─── Main render ─────────────────────────────────────────────────────────
    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            {/* Slides container — 3 × width wide, shifted by translateX */}
            <Animated.View style={[styles.slidesContainer, { transform: [{ translateX }] }]}>
                <View style={{ width }}>{renderSlide1()}</View>
                <View style={{ width }}>{renderSlide2()}</View>
                <View style={{ width }}>{renderSlide3()}</View>
            </Animated.View>

            {/* Global page-dot indicator at the very bottom */}
            <View style={[styles.dotsRow, { bottom: insets.bottom + 8 }]}>
                {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
                        <View style={[styles.dot, i === currentSlide && styles.dotActive]} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, overflow: 'hidden' },
    slidesContainer: {
        flex: 1,
        flexDirection: 'row',
        width: width * TOTAL_SLIDES,
    },
    slide: { flex: 1, width, overflow: 'hidden' },

    // ── Blobs ──
    blobTopLeft: {
        position: 'absolute', top: '-10%', left: '-10%',
        width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3,
        backgroundColor: '#ff7576', opacity: 0.4,
    },
    blobBottomRight: {
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3,
        backgroundColor: '#026381', opacity: 0.4,
    },
    blobTealTopRight: {
        position: 'absolute', top: -60, right: -80,
        width: width * 0.55, height: width * 0.55, borderRadius: width * 0.275,
        backgroundColor: 'rgba(0,130,130,0.35)',
    },
    blobTealBottomLeft: {
        position: 'absolute', bottom: -80, left: -80,
        width: width * 0.5, height: width * 0.5, borderRadius: width * 0.25,
        backgroundColor: 'rgba(0,80,90,0.5)',
    },
    glowBlob: {
        position: 'absolute', top: '20%', left: '20%',
        width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3,
        backgroundColor: 'rgba(255,255,255,0.18)',
    },

    // ── Shared header ──
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8,
    },
    brandText: { fontSize: 20, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
    skipText: { color: 'rgba(255,255,255,0.80)', fontSize: 11, fontWeight: '700', letterSpacing: 2.5 },
    skipPill: {
        backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14,
        paddingVertical: 7, borderRadius: 999,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoIconBox: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    logoIconText: { fontSize: 16 },

    slideScrollContent: { paddingHorizontal: 20 },

    // ── Shared hero ──
    heroSection: { marginBottom: 20, paddingHorizontal: 4 },
    heroTitle: { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: -1.5, lineHeight: 44, marginBottom: 12 },
    heroTitleFade: { color: 'rgba(255,255,255,0.42)' },
    heroHighlight: { color: 'rgba(255,255,255,0.40)' },
    heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.80)', fontWeight: '400', lineHeight: 21 },

    // ── Glass card ──
    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
        padding: 14, gap: 10,
        shadowColor: 'rgba(0,0,0,0.15)', shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 1, shadowRadius: 40, elevation: 10,
    },

    // ── Slide 1: Platform rows ──
    platformRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 10, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    platformRowLinked: { backgroundColor: 'rgba(255,255,255,0.20)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.30)' },
    platformIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
    platformName: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
    platformStatus: { color: 'rgba(255,255,255,0.55)', fontSize: 8, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },
    platformStatusLinked: { color: '#ffffff' },
    checkCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
    addCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.30)', alignItems: 'center', justifyContent: 'center' },

    // ── Social proof ──
    proofSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
    avatarRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
    avatarCount: { alignItems: 'center', justifyContent: 'center' },
    avatarCountText: { color: '#ffffff', fontSize: 8, fontWeight: '900' },
    proofText: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 16, fontWeight: '500' },

    // ── CTA buttons ──
    ctaButton: {
        backgroundColor: '#ffffff', borderRadius: 14, paddingVertical: 16,
        alignItems: 'center', justifyContent: 'center', marginTop: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
    },
    ctaButtonTextRed: { color: '#b71029', fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
    ctaButtonTeal: {
        backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 18,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5,
    },
    ctaTextTeal: { color: '#0a5e5e', fontWeight: '800', fontSize: 17 },
    ctaButtonWhite: {
        backgroundColor: '#ffffff', borderRadius: 18, paddingVertical: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        shadowColor: 'rgba(0,0,0,0.18)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8,
    },
    ctaButtonTextDark: { color: '#292f35', fontWeight: '800', fontSize: 17 },

    // ── Slide 2: badge + preview ──
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999,
        paddingHorizontal: 12, paddingVertical: 6, marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    badgeIcon: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
    badgeText: { color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
    previewTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    previewDots: { flexDirection: 'row', gap: 5 },
    previewDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#ffffff' },
    activeSyncBadge: { backgroundColor: 'rgba(0,180,180,0.25)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0,200,200,0.3)' },
    activeSyncText: { color: '#7ff0f0', fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
    previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    previewIconWrap: { borderRadius: 12, overflow: 'hidden' },
    previewIconGrad: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    previewLines: { flex: 1 },
    previewLine: { height: 9, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4 },
    previewSyncIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

    // ── Slide 3: illustration ──
    illustrationArea: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', paddingHorizontal: 28, paddingVertical: 8 },
    scheduledChip: {
        position: 'absolute', top: 4, right: 12,
        backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
        flexDirection: 'row', alignItems: 'center', gap: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6, zIndex: 20,
    },
    scheduledChipIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#00b4d8', alignItems: 'center', justifyContent: 'center' },
    scheduledChipLabel: { fontSize: 8, fontWeight: '800', color: '#292f35', letterSpacing: 1 },
    scheduledChipTime: { fontSize: 11, fontWeight: '900', color: '#00b4d8', marginTop: 1 },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    cardIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.30)', alignItems: 'center', justifyContent: 'center' },
    cardTopLines: { flex: 1 },
    cardCircleBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)' },
    shimmerLine: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.9)' },
    scheduleRowActive: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10 },
    scheduleRowIconWrap: { width: 28, height: 28, borderRadius: 7, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
    scheduleRowDim: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, opacity: 0.6 },
    scheduleRowIconWrapDim: { width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center' },
    backCard: {
        position: 'absolute', bottom: 8, left: 0, width: '42%',
        backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 12,
        transform: [{ rotate: '-4deg' }], opacity: 0.8, zIndex: 5,
    },
    backCardTop: { flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 8 },
    backCardBar: { width: '100%', height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
    copySection: { paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center' },
    footer: { paddingHorizontal: 20, gap: 12 },
    footerLabel: { color: 'rgba(255,255,255,0.50)', fontSize: 9, fontWeight: '700', letterSpacing: 1.8, textAlign: 'center', textTransform: 'uppercase' },

    // ── Global page dots ──
    dotsRow: {
        position: 'absolute', left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: 6,
    },
    dot: { width: 32, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.30)' },
    dotActive: { width: 44, backgroundColor: '#ffffff' },

    // ── Slide 3 inline dots in header ──
    inlineDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    inlineDot: { width: 14, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.30)' },
    inlineDotActive: { width: 28, backgroundColor: '#ffffff' },
});
