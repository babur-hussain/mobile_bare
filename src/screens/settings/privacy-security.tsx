import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@react-native-firebase/auth';
import { ChevronLeft, Lock, Eye, EyeOff, Trash2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { logoutUser } from '../../store/actions/auth.actions';
import api from '../../services/api';

export default function PrivacySecurityScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch<AppDispatch>();
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPw || !newPw || !confirmPw) {
            Alert.alert('Error', 'Please fill in all password fields.');
            return;
        }
        if (newPw !== confirmPw) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        if (newPw.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const user = getAuth().currentUser;
            if (!user || !user.email) throw new Error('Not authenticated');
            const credential = EmailAuthProvider.credential(user.email, currentPw);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPw);
            setCurrentPw('');
            setNewPw('');
            setConfirmPw('');
            Alert.alert('Success', 'Password changed successfully!');
        } catch (error: any) {
            let msg = 'Failed to change password. Please try again.';
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                msg = 'Current password is incorrect.';
            } else if (error.code === 'auth/too-many-requests') {
                msg = 'Too many attempts. Please wait before trying again.';
            }
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all your data. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Confirm Deletion',
                            'Are you absolutely sure? All your posts and data will be lost forever.',
                            [
                                { text: 'Keep My Account', style: 'cancel' },
                                {
                                    text: 'Yes, Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            // #50: Call backend to delete all user data first
                                            await api.delete('/api/v1/auth/account');

                                            const user = getAuth().currentUser;
                                            if (user) await user.delete();
                                            await dispatch(logoutUser());
                                        } catch (e: any) {
                                            Alert.alert('Error', 'Could not delete account. Please re-login and try again.');
                                        }
                                    },
                                },
                            ],
                        );
                    },
                },
            ],
        );
    };

    const PasswordField = ({
        label, value, onChangeText, show, onToggle,
    }: any) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputRow}>
                <Lock size={18} color={Colors.textMuted} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!show}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
                    {show ? <EyeOff size={18} color={Colors.textMuted} /> : <Eye size={18} color={Colors.textMuted} />}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Change Password</Text>
                <View style={styles.card}>
                    <PasswordField
                        label="Current Password"
                        value={currentPw}
                        onChangeText={setCurrentPw}
                        show={showCurrent}
                        onToggle={() => setShowCurrent(v => !v)}
                    />
                    <View style={styles.spacer} />
                    <PasswordField
                        label="New Password"
                        value={newPw}
                        onChangeText={setNewPw}
                        show={showNew}
                        onToggle={() => setShowNew(v => !v)}
                    />
                    <View style={styles.spacer} />
                    <PasswordField
                        label="Confirm New Password"
                        value={confirmPw}
                        onChangeText={setConfirmPw}
                        show={showConfirm}
                        onToggle={() => setShowConfirm(v => !v)}
                    />
                    <TouchableOpacity
                        style={[styles.changeBtn, loading && styles.changeBtnDisabled]}
                        onPress={handleChangePassword}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.changeBtnText}>Update Password</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { color: Colors.error }]}>Danger Zone</Text>
                <TouchableOpacity style={styles.deleteCard} onPress={handleDeleteAccount}>
                    <View style={styles.deleteIcon}>
                        <Trash2 size={20} color={Colors.error} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.deleteTitle}>Delete Account</Text>
                        <Text style={styles.deleteDesc}>Permanently delete your account and all data</Text>
                    </View>
                </TouchableOpacity>
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
        padding: 16,
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    fieldGroup: { gap: 6 },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    input: { flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0 },
    eyeBtn: { padding: 2 },
    spacer: { height: 8 },
    changeBtn: {
        marginTop: 12,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    changeBtnDisabled: { opacity: 0.65 },
    changeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
    deleteCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: `${Colors.error}30`,
    },
    deleteIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: `${Colors.error}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteTitle: { fontSize: 15, fontWeight: '600', color: Colors.error },
    deleteDesc: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
});
