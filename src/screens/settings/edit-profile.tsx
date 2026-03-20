import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, User, Mail, Save } from 'lucide-react-native';
import { RootState, AppDispatch } from '../../store';
import { updateProfileUser } from '../../store/actions/auth.actions';
import { Colors } from '../../constants/colors';

export default function EditProfileScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { user, isLoading } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    const [name, setName] = useState(user?.name || '');

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }
        if (name.trim() === user?.name) {
            navigation.goBack();
            return;
        }
        const result = await dispatch(updateProfileUser({ name: name.trim() }));
        if (updateProfileUser.fulfilled.match(result)) {
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } else {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                        <Save size={22} color={Colors.primary} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {name?.[0]?.toUpperCase() || '?'}
                        </Text>
                    </View>
                    <Text style={styles.avatarHint}>Your display initial</Text>
                </View>

                {/* Name Field */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputRow}>
                        <User size={18} color={Colors.textMuted} />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            placeholderTextColor={Colors.textMuted}
                            autoCapitalize="words"
                            returnKeyType="done"
                            onSubmitEditing={handleSave}
                        />
                    </View>
                </View>

                {/* Email Field - Read Only */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputRow, styles.inputRowDisabled]}>
                        <Mail size={18} color={Colors.textMuted} />
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={user?.email || ''}
                            editable={false}
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>
                    <Text style={styles.fieldHint}>Email cannot be changed</Text>
                </View>

                {/* Plan Info */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Current Plan</Text>
                    <View style={[styles.inputRow, styles.inputRowDisabled]}>
                        <Text style={styles.planValue}>
                            {user?.plan === 'pro' ? '⭐ Pro Plan' : user?.plan === 'enterprise' ? '🏢 Enterprise' : '🆓 Free Plan'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
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
    saveBtn: { padding: 4 },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    body: { flex: 1 },
    bodyContent: { padding: 20, gap: 20 },
    avatarSection: { alignItems: 'center', paddingVertical: 20 },
    avatarContainer: {
        width: 88,
        height: 88,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    avatarText: { fontSize: 34, fontWeight: '700', color: Colors.white },
    avatarHint: { fontSize: 13, color: Colors.textMuted },
    fieldGroup: { gap: 8 },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.white,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    inputRowDisabled: {
        backgroundColor: '#f3f4f6',
        borderColor: Colors.border,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.textPrimary,
        padding: 0,
    },
    inputDisabled: {
        color: Colors.textMuted,
    },
    fieldHint: {
        fontSize: 12,
        color: Colors.textMuted,
        marginLeft: 4,
    },
    planValue: {
        fontSize: 15,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: { opacity: 0.65 },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.white,
    },
});
