import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Sparkles,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  MessageCircle,
  LogOut,
  UserCog,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logoutUser, checkAuthStatus } from '../store/actions/auth.actions';
import { Colors } from '../constants/colors';

export default function SettingsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Refresh profile every time the settings tab gains focus
  useFocusEffect(
    useCallback(() => {
      dispatch(checkAuthStatus());
    }, [dispatch]),
  );

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logoutUser());
        },
      },
    ]);
  };

  const PLAN_LABELS: Record<string, string> = {
    free: 'Free Plan',
    pro: 'Pro Plan',
    enterprise: 'Enterprise',
  };

  const initials =
    user?.name
      ?.split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View style={styles.planBadge}>
          <Sparkles size={14} color={Colors.primary} />
          <Text style={styles.planText}>
            {PLAN_LABELS[user?.plan || 'free'] || 'Free Plan'}
          </Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}>
          <View style={[styles.menuIcon, { backgroundColor: `${Colors.primary}15` }]}>
            <UserCog size={20} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}>
          <View style={[styles.menuIcon, { backgroundColor: `${Colors.accent}15` }]}>
            <Bell size={20} color={Colors.accent} />
          </View>
          <Text style={styles.menuText}>Notifications</Text>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('PrivacySecurity')}>
          <View style={[styles.menuIcon, { backgroundColor: `${Colors.warning}15` }]}>
            <Shield size={20} color={Colors.warning} />
          </View>
          <Text style={styles.menuText}>Privacy &amp; Security</Text>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Support</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('HelpCenter')}>
          <View style={[styles.menuIcon, { backgroundColor: `${Colors.info}15` }]}>
            <HelpCircle size={20} color={Colors.info} />
          </View>
          <Text style={styles.menuText}>Help Center</Text>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ContactUs')}>
          <View style={[styles.menuIcon, { backgroundColor: `${Colors.success}15` }]}>
            <MessageCircle size={20} color={Colors.success} />
          </View>
          <Text style={styles.menuText}>Contact Us</Text>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>PostingAutomation v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  planText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  menuSection: {
    gap: 4,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    paddingBottom: 8,
  },
});
