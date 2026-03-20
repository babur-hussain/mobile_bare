import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Linking,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, MessageSquare, Send } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

const SUPPORT_EMAIL = 'support@postingautomation.app';

export default function ContactUsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Missing Fields', 'Please fill in both subject and message.');
            return;
        }
        setLoading(true);
        try {
            // Send via backend or directly open email client
            await Linking.openURL(
                `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(message.trim())}`,
            );
            setSubject('');
            setMessage('');
            Alert.alert('Email Opened', 'Your email client has been opened with your message. Please send it to complete your support request.');
        } catch (err) {
            Alert.alert('Error', 'Could not open email client. Please email us directly at ' + SUPPORT_EMAIL);
        } finally {
            setLoading(false);
        }
    };

    const openEmail = () => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {
            Alert.alert('Could not open email', `Email us at: ${SUPPORT_EMAIL}`);
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Us</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* Quick Contact Cards */}
                <View style={styles.quickRow}>
                    <TouchableOpacity style={styles.quickCard} onPress={openEmail}>
                        <View style={[styles.quickIcon, { backgroundColor: `${Colors.info}15` }]}>
                            <Mail size={22} color={Colors.info} />
                        </View>
                        <Text style={styles.quickLabel}>Email Us</Text>
                        <Text style={styles.quickValue} numberOfLines={1}>{SUPPORT_EMAIL}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickCard}
                        onPress={() => Linking.openURL('https://postingautomation.app/chat').catch(() => { })}>
                        <View style={[styles.quickIcon, { backgroundColor: `${Colors.success}15` }]}>
                            <MessageSquare size={22} color={Colors.success} />
                        </View>
                        <Text style={styles.quickLabel}>Live Chat</Text>
                        <Text style={styles.quickValue}>Online now</Text>
                    </TouchableOpacity>
                </View>

                {/* Message Form */}
                <Text style={styles.sectionTitle}>Send a Message</Text>
                <View style={styles.card}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            style={styles.inputSingle}
                            value={subject}
                            onChangeText={setSubject}
                            placeholder="What's your issue about?"
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>
                    <View style={[styles.fieldGroup, { marginTop: 14 }]}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={styles.inputMulti}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Describe your issue or question in detail..."
                            placeholderTextColor={Colors.textMuted}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Send size={18} color={Colors.white} />
                                <Text style={styles.sendBtnText}>Open in Email App</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Response Time */}
                <View style={styles.responseCard}>
                    <Text style={styles.responseTitle}>⏱ Response Time</Text>
                    <Text style={styles.responseText}>
                        We typically respond within 24 hours on business days (Mon–Fri).
                        For urgent issues, use the Live Chat option above.
                    </Text>
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
    content: { padding: 20, gap: 16 },
    quickRow: { flexDirection: 'row', gap: 12 },
    quickCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    quickIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
    quickValue: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    fieldGroup: {},
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
    },
    inputSingle: {
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.textPrimary,
    },
    inputMulti: {
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 15,
        color: Colors.textPrimary,
        minHeight: 120,
    },
    sendBtn: {
        marginTop: 14,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    sendBtnDisabled: { opacity: 0.65 },
    sendBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
    responseCard: {
        backgroundColor: `${Colors.warning}10`,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: `${Colors.warning}25`,
    },
    responseTitle: { fontSize: 14, fontWeight: '700', color: Colors.warning },
    responseText: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginTop: 6,
    },
});
