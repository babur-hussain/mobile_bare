import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQ_ITEMS = [
    {
        q: 'How do I connect a social media account?',
        a: 'Go to the Accounts tab, tap "Connect Account", and follow the authentication flow for the platform you want to connect (Instagram, Facebook, etc.).',
    },
    {
        q: 'Why did my post fail to publish?',
        a: 'Posts can fail due to expired platform tokens, content policy violations, or API rate limits. Check your account connection in the Accounts tab and try again. If it persists, reconnect the account.',
    },
    {
        q: 'How do I schedule posts?',
        a: 'When creating a post, toggle on "Schedule" and pick a date and time. Your scheduled posts will appear in the Dashboard under "Scheduled".',
    },
    {
        q: 'Can I post to multiple platforms at once?',
        a: 'Yes! When creating a post, select all the platforms you want to post to. The app will publish to each one simultaneously.',
    },
    {
        q: 'What image formats are supported?',
        a: 'JPEG and PNG are supported for all platforms. For videos, MP4 is recommended. Keep images under 8MB and videos under 100MB for best compatibility.',
    },
    {
        q: 'How do I cancel my subscription?',
        a: 'Cancel your subscription through the App Store (iOS) or Google Play Store (Android) subscription management page. Your plan will revert to Free at the end of the billing cycle.',
    },
    {
        q: 'Is my data secure?',
        a: 'Yes. We use industry-standard encryption and Firebase Authentication. We never store your social media passwords — only secure OAuth tokens.',
    },
];

export default function HelpCenterScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (i: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIndex(prev => (prev === i ? null : i));
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>Frequently Asked Questions</Text>

                {FAQ_ITEMS.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.faqItem, openIndex === i && styles.faqItemOpen]}
                        onPress={() => toggle(i)}
                        activeOpacity={0.8}>
                        <View style={styles.faqHeader}>
                            <Text style={[styles.question, openIndex === i && styles.questionOpen]}>
                                {item.q}
                            </Text>
                            {openIndex === i ? (
                                <ChevronUp size={18} color={Colors.primary} />
                            ) : (
                                <ChevronDown size={18} color={Colors.textMuted} />
                            )}
                        </View>
                        {openIndex === i && (
                            <Text style={styles.answer}>{item.a}</Text>
                        )}
                    </TouchableOpacity>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Can't find what you're looking for?</Text>
                    <Text style={styles.footerSub}>Use the "Contact Us" option in Settings to reach our support team.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
    content: { padding: 20, gap: 10 },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
        marginLeft: 4,
    },
    faqItem: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    faqItemOpen: {
        borderWidth: 1.5,
        borderColor: `${Colors.primary}30`,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    question: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    questionOpen: {
        fontWeight: '700',
        color: Colors.primary,
    },
    answer: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 21,
        marginTop: 12,
    },
    footer: {
        marginTop: 12,
        padding: 16,
        backgroundColor: `${Colors.info}10`,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: `${Colors.info}20`,
    },
    footerText: { fontSize: 14, fontWeight: '600', color: Colors.info },
    footerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
});
