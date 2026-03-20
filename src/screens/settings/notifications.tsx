import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, BellOff } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import api from '../../services/api';

const STORAGE_KEY = '@notifications_settings';

interface NotifSettings {
    pushEnabled: boolean;
    postReminders: boolean;
    weeklyDigest: boolean;
    postSuccess: boolean;
    postFailure: boolean;
}

const defaultSettings: NotifSettings = {
    pushEnabled: true,
    postReminders: true,
    weeklyDigest: false,
    postSuccess: true,
    postFailure: true,
};

export default function NotificationsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [settings, setSettings] = useState<NotifSettings>(defaultSettings);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(stored => {
            if (stored) {
                try {
                    setSettings({ ...defaultSettings, ...JSON.parse(stored) });
                } catch { }
            }
        });
    }, []);

    const toggle = async (key: keyof NotifSettings) => {
        const next = { ...settings, [key]: !settings[key] };
        setSettings(next);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        // #49: Fire-and-forget sync to backend
        api.patch('/api/v1/auth/notification-preferences', next).catch(() => {});
    };

    const renderToggle = (
        key: keyof NotifSettings,
        label: string,
        description: string,
        disabled?: boolean,
    ) => (
        <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, disabled && styles.dimText]}>{label}</Text>
                <Text style={[styles.toggleDesc, disabled && styles.dimText]}>{description}</Text>
            </View>
            <Switch
                value={disabled ? false : settings[key]}
                onValueChange={() => !disabled && toggle(key)}
                trackColor={{ false: Colors.border, true: `${Colors.primary}66` }}
                thumbColor={
                    !disabled && settings[key] ? Colors.primary : Colors.textMuted
                }
                disabled={disabled}
            />
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Master toggle */}
                <View style={styles.card}>
                    <View style={styles.masterRow}>
                        <View
                            style={[
                                styles.masterIcon,
                                { backgroundColor: settings.pushEnabled ? `${Colors.primary}15` : `${Colors.textMuted}15` },
                            ]}>
                            {settings.pushEnabled ? (
                                <Bell size={22} color={Colors.primary} />
                            ) : (
                                <BellOff size={22} color={Colors.textMuted} />
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.masterLabel}>Push Notifications</Text>
                            <Text style={styles.masterDesc}>
                                {settings.pushEnabled ? 'Notifications enabled' : 'All notifications paused'}
                            </Text>
                        </View>
                        <Switch
                            value={settings.pushEnabled}
                            onValueChange={() => toggle('pushEnabled')}
                            trackColor={{ false: Colors.border, true: `${Colors.primary}66` }}
                            thumbColor={settings.pushEnabled ? Colors.primary : Colors.textMuted}
                        />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Activity</Text>
                <View style={styles.card}>
                    {renderToggle(
                        'postSuccess',
                        'Post Published',
                        'When a post goes live successfully',
                        !settings.pushEnabled,
                    )}
                    <View style={styles.divider} />
                    {renderToggle(
                        'postFailure',
                        'Post Failed',
                        'When a post fails to publish',
                        !settings.pushEnabled,
                    )}
                    <View style={styles.divider} />
                    {renderToggle(
                        'postReminders',
                        'Scheduled Reminders',
                        'Before a scheduled post goes live',
                        !settings.pushEnabled,
                    )}
                </View>

                <Text style={styles.sectionTitle}>Digest</Text>
                <View style={styles.card}>
                    {renderToggle(
                        'weeklyDigest',
                        'Weekly Summary',
                        'A weekly digest of your post performance',
                        !settings.pushEnabled,
                    )}
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
    content: { padding: 20, gap: 12 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 4,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    masterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    masterIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    masterLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
    masterDesc: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    toggleText: { flex: 1 },
    toggleLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
    toggleDesc: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
    dimText: { opacity: 0.4 },
    divider: { height: 1, backgroundColor: Colors.border, marginLeft: 2 },
});
