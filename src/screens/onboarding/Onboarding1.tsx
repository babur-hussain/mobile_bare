import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Onboarding1 = () => {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container}>
            {/* Decorative Gradient Blurs */}
            <View style={styles.decorativeBottomRight} />
            <View style={styles.decorativeTopLeft} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>P</Text>
                    </View>
                    <Text style={styles.headerTitle}>PostOnce</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Icon name="bell-outline" size={22} color="#474554" />
                    </TouchableOpacity>
                    <View style={styles.profileContainer}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxY1JSK5wHDLLm4CXzaxUBoN8znNVI2ep74MkhrN2LCDy4gk7GWtLwq_GhrdRidtj7hpYRK1mNAxjiM2rN26cjsXPbFGt90RGb0LjQwoJaJgJHDlXh03WpO6pY3MzV7k_06UOy3JHf9mIxc4JmM8956H6L4GNAbzwgBMKS2qNFrOw3QNw6bicYZgiQALdMGV0LYk23bPEaTblJW0TTAV13hrVCbgKCzzegSvfELLsD14lmmbvrILbsHK3ze_U2xhRzTm-saDdIEwUC' }}
                            style={styles.profileImage}
                        />
                    </View>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    <LinearGradient
                        colors={['#5341cd', '#6c5ce7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.progressActive}
                    />
                    <View style={styles.progressInactive} />
                    <View style={styles.progressInactive} />
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>
                        Connect your social accounts
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        PostOnce syncs with your favorite platforms to streamline your editorial workflow in one fluid experience.
                    </Text>
                </View>

                {/* Grid Cards */}
                <View style={styles.gridContainer}>
                    {/* Row 1: Instagram + LinkedIn */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(225, 48, 108, 0.1)' }]}>
                                <Icon name="instagram" size={24} color="#E1306C" />
                            </View>
                            <Text style={styles.cardTitle}>Instagram</Text>
                            <Text style={styles.cardSubtitle}>READY TO LINK</Text>
                            <View style={styles.cardArrow}>
                                <Icon name="plus-circle-outline" size={22} color="#787586" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.cardBordered]} activeOpacity={0.7}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 88, 189, 0.1)' }]}>
                                <Icon name="linkedin" size={24} color="#0058bd" />
                            </View>
                            <Text style={styles.cardTitle}>LinkedIn</Text>
                            <Text style={styles.cardSubtitle}>PROFESSIONAL NETWORK</Text>
                            <View style={styles.cardArrow}>
                                <Icon name="plus-circle-outline" size={22} color="#787586" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Wide Card: X / Twitter */}
                    <TouchableOpacity style={[styles.card, styles.cardWide]} activeOpacity={0.7}>
                        <View style={styles.cardRowContent}>
                            <View style={[styles.iconContainerInline, { backgroundColor: '#313030' }]}>
                                <Icon name="close" size={22} color="#fcf9f8" />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>X Platform</Text>
                                <Text style={styles.cardSubtitleNormal}>Formerly Twitter</Text>
                            </View>
                        </View>
                        <Icon name="plus-circle-outline" size={22} color="#787586" />
                    </TouchableOpacity>

                    {/* Row 2: Pinterest + TikTok */}
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.card, styles.cardBordered]} activeOpacity={0.7}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(178, 0, 75, 0.1)' }]}>
                                <Icon name="pinterest" size={24} color="#b2004b" />
                            </View>
                            <Text style={styles.cardTitle}>Pinterest</Text>
                            <Text style={styles.cardSubtitle}>VISUAL INSPIRATION</Text>
                            <View style={styles.cardArrow}>
                                <Icon name="plus-circle-outline" size={22} color="#787586" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(28, 27, 27, 0.1)' }]}>
                                <Icon name="music-note" size={24} color="#1c1b1b" />
                            </View>
                            <Text style={styles.cardTitle}>TikTok</Text>
                            <Text style={styles.cardSubtitle}>SHORT-FORM VIDEO</Text>
                            <View style={styles.cardArrow}>
                                <Icon name="plus-circle-outline" size={22} color="#787586" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer spacing inside scroll */}
                <View style={{ height: 32 }} />
            </ScrollView>

            {/* Fixed Footer Actions (outside ScrollView) */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Onboarding2')}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={['#5341cd', '#6c5ce7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                        <Icon name="arrow-right" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf9f8',
    },
    decorativeBottomRight: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 350,
        height: 350,
        borderRadius: 175,
        backgroundColor: 'rgba(178, 0, 75, 0.05)',
        zIndex: -1,
    },
    decorativeTopLeft: {
        position: 'absolute',
        top: 50,
        left: -100,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(83, 65, 205, 0.05)',
        zIndex: -1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        height: 56,
        backgroundColor: 'rgba(252, 249, 248, 0.85)',
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#6c5ce7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#faf6ff',
        fontSize: 18,
        fontWeight: '800',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1c1b1b',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e5e2e1',
        borderWidth: 2,
        borderColor: '#f6f3f2',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    progressActive: {
        height: 6,
        width: 48,
        borderRadius: 3,
    },
    progressInactive: {
        height: 6,
        width: 48,
        borderRadius: 3,
        backgroundColor: '#e5e2e1',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        color: '#5341cd',
        letterSpacing: -1,
        marginBottom: 12,
        lineHeight: 38,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#474554',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: '90%',
    },
    gridContainer: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    card: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(28, 27, 27, 0.06)',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 1,
                shadowRadius: 16,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cardBordered: {
        backgroundColor: '#f6f3f2',
        borderWidth: 1,
        borderColor: 'rgba(200, 196, 215, 0.15)',
        ...Platform.select({
            ios: {
                shadowOpacity: 0,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    cardWide: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    cardRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconContainerInline: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1b1b',
        marginBottom: 3,
    },
    cardSubtitle: {
        fontSize: 9,
        fontWeight: '600',
        color: '#474554',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardSubtitleNormal: {
        fontSize: 13,
        color: '#474554',
    },
    cardArrow: {
        alignItems: 'flex-end',
        marginTop: 'auto',
        paddingTop: 8,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 8 : 16,
        gap: 12,
        backgroundColor: '#fcf9f8',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#5341cd',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    nextButtonText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: '800',
    },
    skipButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#474554',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default Onboarding1;
