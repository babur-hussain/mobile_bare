import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Onboarding2 = () => {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>PostOnce</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.skipText}>SKIP</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Visual Composition */}
                <View style={styles.visualContainer}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJTdqgBGAUtZoFVA5iQmptQC01grDcw46W8m9zB-A7Y3NrZ9yxoyPgf-Gr6x3G1oFvLc85ZdgvCE89LEaanTX6VQQ_dO20X9xhs4-iIH0grJjtp_8TJHYxWOUjUhbRvTZIrbgwFgWBcTXl8ohFTKoWbIi7NwkhaJe--t-wwFHUlSPiVhwPqsuln3KypacaV0bGRGVQsgxsFTURaIKuBnC_I36i_fc-RprjpA_6ZqPe1gezs6HL8roKLcG2LC1c03yhw8oF9Iptu19X' }}
                            style={styles.mainImage}
                            resizeMode="cover"
                        />
                        {/* Overlay to replicate mix-blend-multiply opacity effect roughly */}
                        <View style={styles.imageOverlay} />
                    </View>

                    {/* Floating Elements */}
                    <View style={styles.floatingTopRight}>
                        <View style={[styles.iconBox, { backgroundColor: '#0058bd' }]}>
                            <Icon name="poll" size={20} color="#ffffff" />
                        </View>
                        <View>
                            <Text style={styles.floatingTag}>AUTO-SYNC</Text>
                            <Text style={styles.floatingTitleSecondary}>Facebook Live</Text>
                        </View>
                    </View>

                    <View style={styles.floatingBottomLeft}>
                        <LinearGradient
                            colors={['#5341cd', '#6c5ce7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconBoxPrimary}
                        >
                            <Icon name="camera" size={20} color="#ffffff" />
                        </LinearGradient>
                        <View>
                            <Text style={styles.floatingTag}>OPTIMIZED</Text>
                            <Text style={styles.floatingTitlePrimary}>Instagram Reel</Text>
                        </View>
                    </View>

                    {/* Abstract Thread */}
                    <View style={styles.abstractThread} />
                </View>

                {/* Text Content */}
                <View style={styles.textSection}>
                    <View style={styles.textContent}>
                        <Text style={styles.heroTitle}>
                            Post to <Text style={styles.heroTitleGradient}>Instagram</Text> & Facebook automatically.
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            Schedule once, reach everyone. Our smart engine optimizes your crops and captions for each platform instantly.
                        </Text>
                    </View>

                    {/* Controls Footer */}
                    <View style={styles.controlsFooter}>
                        {/* Progress Indicator */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressInactive} />
                            <LinearGradient
                                colors={['#5341cd', '#6c5ce7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.progressActive}
                            />
                            <View style={styles.progressInactive} />
                            <View style={styles.progressInactive} />
                        </View>

                        {/* Route Info & CTA */}
                        <View style={styles.ctaContainer}>
                            <View>
                                <Text style={styles.stepText}>STEP 02 OF 04</Text>
                                <Text style={styles.stepTitle}>Cross-Platform Sync</Text>
                            </View>

                            <TouchableOpacity onPress={() => navigation.navigate('Onboarding3')}>
                                <LinearGradient
                                    colors={['#5341cd', '#6c5ce7']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.fabButton}
                                >
                                    <Icon name="arrow-right" size={32} color="#ffffff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* Decorative Gradients */}
            <View style={styles.decorativeBottomRight} />
            <View style={styles.decorativeTopLeft} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf9f8',
    },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        zIndex: 50,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#5341cd', // Primary color
        letterSpacing: -0.5,
    },
    skipText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#474554',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 48,
    },
    visualContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    imageWrapper: {
        width: width * 0.75,
        aspectRatio: 1,
        maxWidth: 300,
        borderRadius: 16,
        backgroundColor: '#f6f3f2',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    mainImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(246, 243, 242, 0.2)', // Simulated mix-blend-multiply
    },
    floatingTopRight: {
        position: 'absolute',
        top: '15%',
        right: -10,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(200, 196, 215, 0.1)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    floatingBottomLeft: {
        position: 'absolute',
        bottom: '25%',
        left: -16,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(200, 196, 215, 0.1)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBoxPrimary: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingTag: {
        fontSize: 10,
        fontWeight: '700',
        color: '#474554',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    floatingTitleSecondary: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0058bd',
    },
    floatingTitlePrimary: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5341cd',
    },
    abstractThread: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 192,
        height: 192,
        marginLeft: -96,
        marginTop: -96,
        borderWidth: 2,
        borderColor: 'rgba(83, 65, 205, 0.2)',
        borderStyle: 'dashed',
        borderRadius: 96,
        zIndex: -1,
    },
    textSection: {
        marginTop: 'auto',
    },
    textContent: {
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 40,
        fontWeight: '800',
        lineHeight: 44,
        letterSpacing: -1,
        color: '#1c1b1b',
        marginBottom: 12,
    },
    heroTitleGradient: {
        color: '#5341cd', // React Native Text doesn't support linear gradient text cleanly without MaskedView, fallback to solid primary.
    },
    heroSubtitle: {
        fontSize: 16,
        lineHeight: 24,
        color: '#474554',
        maxWidth: '90%',
    },
    controlsFooter: {
        paddingTop: 16,
        gap: 32,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    progressActive: {
        height: 6,
        width: 40,
        borderRadius: 3,
    },
    progressInactive: {
        height: 6,
        width: 16,
        borderRadius: 3,
        backgroundColor: '#e5e2e1',
    },
    ctaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#474554',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1b1b',
        marginTop: 2,
    },
    fabButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    decorativeBottomRight: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 256,
        height: 256,
        backgroundColor: 'rgba(83, 65, 205, 0.1)',
        borderRadius: 128,
        zIndex: -1,
    },
    decorativeTopLeft: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 256,
        height: 256,
        backgroundColor: 'rgba(178, 0, 75, 0.1)',
        borderRadius: 128,
        zIndex: -1,
    },
});

export default Onboarding2;
