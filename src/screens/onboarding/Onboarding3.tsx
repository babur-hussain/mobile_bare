import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Onboarding3 = () => {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <LinearGradient
                        colors={['#5341cd', '#6c5ce7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoIconBox}
                    >
                        <Icon name="creation" size={16} color="#ffffff" />
                    </LinearGradient>
                    <Text style={styles.headerTitle}>PostOnce</Text>
                </View>
                <Text style={styles.stepText}>STEP 03/03</Text>
            </View>

            <View style={styles.content}>
                {/* Visual Canvas */}
                <View style={styles.visualContainer}>
                    {/* Background Layers */}
                    <View style={[styles.bgLayer, styles.bgLayer1]} />
                    <View style={[styles.bgLayer, styles.bgLayer2]} />

                    {/* Main Content Card */}
                    <View style={styles.mainCard}>
                        {/* Fake Window Controls */}
                        <View style={styles.windowHeader}>
                            <View style={styles.windowDots}>
                                <View style={[styles.dot, { backgroundColor: 'rgba(186, 26, 26, 0.2)' }]} />
                                <View style={[styles.dot, { backgroundColor: 'rgba(224, 0, 96, 0.2)' }]} />
                                <View style={[styles.dot, { backgroundColor: 'rgba(0, 88, 189, 0.2)' }]} />
                            </View>
                            <Icon name="dots-horizontal" size={20} color="#c8c4d7" />
                        </View>

                        {/* Bento Items */}
                        <View style={styles.bentoItems}>
                            <View style={styles.bentoItemRegular}>
                                <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
                                    <Icon name="calendar-month" size={20} color="#5341cd" />
                                </View>
                                <View style={styles.bentoLines}>
                                    <View style={[styles.bentoLine, { width: 60, backgroundColor: '#e5e2e1' }]} />
                                    <View style={[styles.bentoLine, { width: 40, backgroundColor: 'rgba(200, 196, 215, 0.3)' }]} />
                                </View>
                            </View>

                            <LinearGradient
                                colors={['#5341cd', '#6c5ce7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.bentoItemGradient}
                            >
                                <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                                    <Icon name="clock-time-three" size={20} color="#ffffff" />
                                </View>
                                <View style={styles.bentoLines}>
                                    <View style={[styles.bentoLine, { width: 70, backgroundColor: 'rgba(255, 255, 255, 0.4)' }]} />
                                    <View style={[styles.bentoLine, { width: 50, backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
                                </View>
                                <Icon name="check-circle" size={16} color="#ffffff" />
                            </LinearGradient>

                            <View style={[styles.bentoItemRegular, { opacity: 0.6 }]}>
                                <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(224, 0, 96, 0.1)' }]}>
                                    <Icon name="history" size={20} color="#b2004b" />
                                </View>
                                <View style={styles.bentoLines}>
                                    <View style={[styles.bentoLine, { width: 50, backgroundColor: '#e5e2e1' }]} />
                                    <View style={[styles.bentoLine, { width: 30, backgroundColor: 'rgba(200, 196, 215, 0.3)' }]} />
                                </View>
                            </View>
                        </View>

                        {/* Floating User Node */}
                        <View style={styles.floatingUser}>
                            <Image
                                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9cWy4B_suVsMbF9P_hDh5xz_f8GyVV8Y77uenh813glGXAYOUS233p8sPVuNC02aH-9gm4MnjIOLqa3DsvMij49ILzHID7HIsu4up_HfU5WHHXFUq0vlkzR0dwRnqWr7AGtDoDqtNvwl9eNyOxjiphD8GVf5fXNeskHEDJI59YjbgHjChQuZnBnBC8Ef1TE7i99NCvOnncMReOTfQZnYiDht4R8I-jik-axEmJpBld8Jr2U3tXWK0eDJHkZkCKdmRWbnEX5BZ3XYv' }}
                                style={styles.userImage}
                            />
                        </View>
                    </View>

                    {/* Accent Icons */}
                    <View style={styles.accentSend}>
                        <Icon name="send" size={24} color="#0058bd" />
                    </View>
                    <View style={styles.accentBolt}>
                        <Icon name="lightning-bolt" size={28} color="#b2004b" />
                    </View>
                </View>

                {/* Text Content */}
                <View style={styles.textSection}>
                    <Text style={styles.heroTitle}>
                        Schedule posts{'\n'}
                        <Text style={styles.heroTitleItalic}>save time</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Batch your creative work and let our engine handle the publishing across all platforms.
                    </Text>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressInactive} />
                        <View style={styles.progressInactive} />
                        <View style={styles.progressActive} />
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <LinearGradient
                            colors={['#5341cd', '#6c5ce7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.startButton}
                        >
                            <Text style={styles.startButtonText}>Get Started</Text>
                            <Icon name="arrow-right" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>LOG IN TO EXISTING ACCOUNT</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        gap: 12,
    },
    logoIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1c1b1b',
        letterSpacing: -0.5,
    },
    stepText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#474554',
        letterSpacing: 1.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        paddingBottom: 48,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    visualContainer: {
        width: '100%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    bgLayer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 48,
    },
    bgLayer1: {
        backgroundColor: 'rgba(83, 65, 205, 0.05)',
        transform: [{ rotate: '3deg' }, { translateX: 16 }],
    },
    bgLayer2: {
        backgroundColor: 'rgba(0, 88, 189, 0.05)',
        borderRadius: 24,
        transform: [{ rotate: '-6deg' }, { translateX: -8 }],
    },
    mainCard: {
        width: 250,
        height: 320,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#1c1b1b',
                shadowOffset: { width: 0, height: 24 },
                shadowOpacity: 0.06,
                shadowRadius: 40,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    windowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    windowDots: {
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    bentoItems: {
        gap: 12,
    },
    bentoItemRegular: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 12,
        backgroundColor: '#f6f3f2',
        borderRadius: 12,
    },
    bentoItemGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 12,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    bentoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bentoLines: {
        flex: 1,
        gap: 6,
    },
    bentoLine: {
        height: 6,
        borderRadius: 3,
    },
    floatingUser: {
        position: 'absolute',
        bottom: -16,
        right: -16,
        width: 96,
        height: 96,
        backgroundColor: '#ffffff',
        borderRadius: 48,
        padding: 8,
        borderWidth: 4,
        borderColor: '#fcf9f8',
        ...Platform.select({
            ios: {
                shadowColor: '#1c1b1b',
                shadowOffset: { width: 0, height: 24 },
                shadowOpacity: 0.06,
                shadowRadius: 40,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    userImage: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
    },
    accentSend: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 48,
        height: 48,
        backgroundColor: 'rgba(0, 88, 189, 0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accentBolt: {
        position: 'absolute',
        bottom: 48,
        left: 0,
        width: 56,
        height: 56,
        backgroundColor: 'rgba(178, 0, 75, 0.1)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '12deg' }],
    },
    textSection: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    heroTitle: {
        fontSize: 40,
        fontWeight: '800',
        lineHeight: 44,
        letterSpacing: -1,
        color: '#1c1b1b',
        textAlign: 'center',
        marginBottom: 16,
    },
    heroTitleItalic: {
        color: '#5341cd',
        fontStyle: 'italic',
        fontWeight: '900',
    },
    heroSubtitle: {
        fontSize: 16,
        lineHeight: 24,
        color: '#474554',
        textAlign: 'center',
        maxWidth: 280,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 40,
        justifyContent: 'center',
    },
    progressActive: {
        height: 6,
        width: 32,
        borderRadius: 3,
        backgroundColor: '#5341cd',
    },
    progressInactive: {
        height: 6,
        width: 6,
        borderRadius: 3,
        backgroundColor: '#c8c4d7',
    },
    actionsContainer: {
        marginTop: 32,
        gap: 16,
    },
    startButton: {
        height: 64,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    startButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    loginButton: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#474554',
        letterSpacing: 1.5,
    },
});

export default Onboarding3;
