import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  MoreHorizontal,
  CheckCircle,
  Clock,
  TrendingUp,
  Share2,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth } from '@react-native-firebase/auth';
import { RootState, AppDispatch } from '../store';
import { fetchAllPosts } from '../store/actions/posts.actions';
import { fetchAllAccounts } from '../store/actions/accounts.actions';

// New Colors from Web Redesign
const APP_COLORS = {
  primary: '#ea4353', // Red accent
  secondary: '#026381', // Blue text color
  tertiary: '#006947',
  surface: '#f6f8fb', // Main background
  onSurface: '#1f2937', // Main text
  onSurfaceVariant: '#4b5563',
  surfaceContainerLow: '#ebf1fa',
  surfaceContainerLowest: '#ffffff', // Card surfaces
  surfaceContainerHighest: '#dbe3ed',
  outlineVariant: '#a8aeb5',
  onPrimary: '#ffffff',
  primaryContainer: '#ff7576',
  onPrimaryContainer: '#4e000a',
  secondaryContainer: '#94dbfe', // Light blue card
  onSecondaryContainer: '#004e66',
  error: '#b02500',
  onBackground: '#2a3136', // Dark card background
  tertiaryContainer: '#82f6bf',
};

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { items: posts, isLoading } = useSelector(
    (state: RootState) => state.posts,
  );
  const { items: accounts } = useSelector((state: RootState) => state.accounts);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchAllPosts(1));
    dispatch(fetchAllAccounts());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAllPosts(1));
    dispatch(fetchAllAccounts());
  };

  // Real aggregates from store
  const pendingCount =
    posts.filter(p => p.status === 'pending' || p.status === 'processing').length;
  const publishedCount =
    posts.filter(p => p.status === 'published').length;
  const accountsCount = accounts.length;

  // Recent posts static matching design
  const mockRecentPosts = [
    {
      id: '1',
      title: 'Exploring the Golden Hour',
      status: 'PUBLISHED',
      time: '2 hours ago',
      platform: 'Instagram',
      platformColor: APP_COLORS.primary, // Red derived
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdEts4_O06pzxle--ITlZXiImCODXl3haBum95rb2MBH-nfYdHIsYPO32NVX15DjTfoEZh4fH_40Hi4GsnPbHfoJHYziWPvWerBA2mBdMYYtBLQ8YtfBKI2oUTNQ3WQE8l95VUpFbwUNgq4bhF-hMA4CME0dDwLG70xwbhAAOkrwRP6Mavm37s5TdgVNEQC12lrXnXbowDV-iTp-OT0L1kpflfLsYzMPRy17sWtmc89px7PufovV5zunRBFqhsjKceSlm3Qen2tGYR',
      desc: 'Discover the magic of desert sunsets and how to capture the perfect lighting...',
    },
    {
      id: '2',
      title: 'The Future of Tech Nostalgia',
      status: 'QUEUED',
      time: 'Scheduled for Tomorrow',
      platform: 'LinkedIn',
      platformColor: APP_COLORS.secondary, // Blue derived
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfNd5v8Px9C9ckknVCUXlCb9VEZzEaflDnAWj4nuVCAwptQFYo8est2bsHztxpx29s25WSHSBEJICwLH9TDULky7TJBKHPqPKucXdr5jQIU4HQ2Aou8_qZxqntWIliZ5wHjJhkHfka9gd5BniHfdpLwZcTw36XN4noChEcs8wFAHV4Xg0NhCMol_grTIduTo3uMhGx7M3lXBAKp3YkVUlaRt0PxZXUcnia4wvY291KT8Zz0nsHcK2_5Ftc_kL8M314zKDGb60ARpy0',
      desc: 'Why retro design is making a massive comeback in the digital age...',
    },
  ];

  const recentPosts = posts.slice(0, 3);
  const displayPosts = recentPosts.map(p => {
    const isPending = p.status === 'pending' || p.status === 'processing';
    // Support array or string media
    const mediaUrl = Array.isArray(p.mediaUrl) ? p.mediaUrl[0] : p.mediaUrl;
    return {
      id: p._id,
      title: p.caption || 'No Caption',
      status: isPending ? 'QUEUED' : 'PUBLISHED',
      time: p.scheduledTime ? new Date(p.scheduledTime).toLocaleDateString() : 'Just now',
      platform: p.platforms?.[0] || 'App',
      platformColor: p.platforms?.[0] === 'instagram' ? APP_COLORS.primary : APP_COLORS.secondary,
      img: mediaUrl || null,
      desc: (p.caption || '').substring(0, 60) + (p.caption && p.caption.length > 60 ? '...' : ''),
    };
  });

  const getFirstName = () => {
    if (user?.name) return user.name.split(' ')[0];
    const fbUser = getAuth().currentUser;
    if (fbUser?.displayName) return fbUser.displayName.split(' ')[0];
    if (fbUser?.email) return fbUser.email.split('@')[0];
    return 'Alex';
  };

  const fbUser = getAuth().currentUser;
  const avatarUrl =
    (user as any)?.picture || (user as any)?.profilePicture || fbUser?.photoURL ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD0hYl29YrS2coxzV1IwgSciwbB2VzPTmPDoGyvrxLX3irqyn8l_-lrtUv4OAp138pGsv_XZMZrw5ZKm0n00RCnF-cN4b_oTaiNEwKojl9HQCOK8cAX57ssFTd6ZDw690AbLoOu-VrzbNmPMr7-Yj0S2Ko-6M8-MnKoWGNanKJwWAjMfHqpmFepOZSaSiOsa1N1IzD3IJLgWZzhiW916wHlVshGU9BGtCRP2uwK5TtKAoTFM-BSEAygQ5B7dkzx-Kjk3uC1jWy8PWfA';

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Share2 color={APP_COLORS.primary} size={24} />
          </View>
          <Text style={styles.headerBrand}>PostOnce</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Image source={{ uri: avatarUrl }} style={styles.profileAvatar} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={APP_COLORS.primary} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.overline}>WELCOME BACK, {getFirstName().toUpperCase()}</Text>
          <Text style={styles.welcomeText}>Your creative{'\n'}canvas{'\n'}is ready.</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => navigation.navigate('Accounts')}
              activeOpacity={0.8}>
              <Text style={styles.btnSecondaryText}>Connect{'\n'}Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('Create Post')}
              activeOpacity={0.8}>
              <View style={styles.btnPrimaryIconRow}>
                <Plus size={16} color={APP_COLORS.surfaceContainerLowest} strokeWidth={3} />
                <Text style={styles.btnPrimaryText}>Create</Text>
              </View>
              <Text style={styles.btnPrimaryText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Total Published - Main Card */}
          <View style={styles.mainCard}>
            <View style={{ marginBottom: 16 }}>
              <CheckCircle size={32} color={APP_COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.cardSubtitle}>Total Published</Text>
            </View>
            <View style={styles.mainCardBottom}>
              <Text style={styles.hugeText}>{publishedCount}</Text>
              <View style={styles.trendRow}>
                <TrendingUp size={16} color={APP_COLORS.tertiary} strokeWidth={3} />
                <Text style={styles.trendText}>+12% <Text style={styles.trendTextLight}>this month</Text></Text>
              </View>
            </View>
          </View>

          {/* Scheduled - Secondary color */}
          <View style={styles.secondaryCard}>
            <View>
              <Text style={styles.secondaryCardTitle}>Posts Scheduled</Text>
              <Text style={styles.secondaryCardSubtitle}>Across all platforms</Text>
            </View>
            <Text style={styles.largeTextSecondary}>{pendingCount}</Text>
          </View>

          {/* Linked Accounts - Dark card */}
          <View style={styles.darkCard}>
            <View style={styles.darkCardHeaderRow}>
              <View style={styles.darkCardTextGroup}>
                <Text style={styles.darkCardTitle}>Linked Accounts</Text>
                <Text style={styles.darkCardSubtitle}>Active connections</Text>
              </View>
              <View style={styles.darkCardIconBox}>
                <CheckCircle size={20} color={APP_COLORS.surfaceContainerLowest} />
              </View>
            </View>
            <View style={styles.darkCardBottomRow}>
              <Text style={styles.largeTextDark}>{accountsCount.toString().padStart(2, '0')}</Text>
              <View style={styles.avatarStack}>
                {accounts.slice(0, 2).map((acc, i) => (
                  <View key={acc._id || i} style={[styles.stackAvatar, i > 0 && { marginLeft: -12 }]} />
                ))}
                {accountsCount > 2 && (
                  <View style={[styles.stackAvatarCount, { marginLeft: -12 }]}>
                    <Text style={styles.stackCountText}>+{accountsCount - 2}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Recent Posts List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {displayPosts.map((post, idx) => {
            const isQueued = post.status.includes('QUEUED');
            return (
              <TouchableOpacity
                key={post.id || idx.toString()}
                style={styles.listItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PostDetails', { post: recentPosts[idx] })}>
                <View style={styles.listItemHeaderAbsolute}>
                  <MoreHorizontal size={20} color={APP_COLORS.outlineVariant} />
                </View>
                <View style={styles.listItemRow}>
                  {post.img ? (
                    <Image
                      source={{ uri: post.img }}
                      style={styles.listImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.listImg, styles.listImgPlaceholder]}>
                      <Text style={styles.listImgPlaceholderText}>📷</Text>
                    </View>
                  )}
                  <View style={styles.listContent}>
                    <View style={styles.listMetaRow}>
                      <View style={[styles.platformPill, { backgroundColor: `${post.platformColor}22` }]}>
                        <Text style={[styles.platformPillText, { color: post.platformColor }]}>{post.platform.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.timeText}>{post.time}</Text>
                    <Text style={styles.listTitle} numberOfLines={1}>{post.title}</Text>
                    <Text style={styles.listDesc} numberOfLines={1}>{post.desc}</Text>
                  </View>
                </View>
                <View style={styles.listStatusArea}>
                  <View style={styles.statusRow}>
                    {isQueued ? (
                      <Clock size={14} color={APP_COLORS.secondary} strokeWidth={2.5} />
                    ) : (
                      <CheckCircle size={14} color={APP_COLORS.tertiary} strokeWidth={2.5} />
                    )}
                    <Text style={[styles.statusText, { color: isQueued ? APP_COLORS.secondary : APP_COLORS.tertiary }]}>
                      {post.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Growth Insight static mock */}
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Growth Insight</Text>
        <View style={styles.insightCard}>
          <TrendingUp size={28} color={APP_COLORS.surfaceContainerLowest} strokeWidth={3} style={styles.insightIcon} />
          <Text style={styles.insightTitle}>Best Time to Post</Text>
          <Text style={styles.insightDesc}>Your audience is most active on Tuesdays between 6:00 PM and 8:00 PM EST.</Text>

          <View style={styles.chartArea}>
            <View style={[styles.bar, { height: '30%', backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={[styles.bar, { height: '40%', backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={[styles.bar, { height: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }]} />
            <View style={[styles.barActive, { height: '90%' }]} />
            <View style={[styles.bar, { height: '45%', backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={[styles.bar, { height: '35%', backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          </View>
          <Text style={styles.chartLabel}>ENGAGEMENT FLUX</Text>
        </View>

        <View style={styles.mixCard}>
          <Text style={styles.mixTitle}>Content Mix</Text>

          <View style={styles.mixRow}>
            <View style={styles.mixLabelRow}><View style={[styles.mixDot, { backgroundColor: APP_COLORS.primary, shadowColor: APP_COLORS.primary, shadowOpacity: 0.5, shadowRadius: 4 }]} /><Text style={styles.mixLabelText}>Images</Text></View>
            <Text style={styles.mixValText}>64%</Text>
          </View>
          <View style={styles.progressBarBG}><View style={[styles.progressBarFill, { width: '64%', backgroundColor: APP_COLORS.primary }]} /></View>

          <View style={styles.mixRow}>
            <View style={styles.mixLabelRow}><View style={[styles.mixDot, { backgroundColor: APP_COLORS.secondary }]} /><Text style={styles.mixLabelText}>Videos</Text></View>
            <Text style={styles.mixValText}>28%</Text>
          </View>
          <View style={styles.progressBarBG}><View style={[styles.progressBarFill, { width: '28%', backgroundColor: APP_COLORS.secondary }]} /></View>
        </View>

        {/* Padding for Bottom Nav */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: APP_COLORS.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#b71029',
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: APP_COLORS.surfaceContainerHighest,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  overline: {
    fontSize: 10,
    letterSpacing: 2,
    color: APP_COLORS.secondary,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    letterSpacing: -1.5,
    lineHeight: 44,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  btnSecondary: {
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    paddingVertical: 16,
    borderRadius: 999,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnSecondaryText: {
    color: APP_COLORS.secondary,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  btnPrimary: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 999,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    shadowColor: APP_COLORS.primaryContainer,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  btnPrimaryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btnPrimaryText: {
    color: APP_COLORS.surfaceContainerLowest,
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 18,
  },
  bentoGrid: {
    gap: 24,
    marginBottom: 48,
  },
  mainCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    height: 220,
    justifyContent: 'space-between',
    shadowColor: 'rgba(41,47,53,0.04)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardSubtitle: {
    color: APP_COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500'
  },
  mainCardBottom: {
    marginTop: 'auto'
  },
  hugeText: {
    fontSize: 64,
    fontWeight: '900',
    color: APP_COLORS.onSurface,
    letterSpacing: -2,
    lineHeight: 64
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    color: APP_COLORS.tertiary,
    fontWeight: '700',
    fontSize: 12
  },
  trendTextLight: {
    fontWeight: '500',
    color: APP_COLORS.tertiary,
    opacity: 0.8
  },
  secondaryCard: {
    backgroundColor: APP_COLORS.secondaryContainer,
    borderRadius: 24,
    padding: 24,
    height: 160,
    justifyContent: 'space-between',
  },
  secondaryCardTitle: {
    color: APP_COLORS.onSecondaryContainer,
    fontWeight: '700',
    fontSize: 15
  },
  secondaryCardSubtitle: {
    color: 'rgba(0, 78, 102, 0.7)',
    fontSize: 12,
    marginTop: 2
  },
  largeTextSecondary: {
    fontSize: 64,
    fontWeight: '900',
    color: APP_COLORS.onSecondaryContainer,
    lineHeight: 64,
    letterSpacing: -1
  },
  darkCard: {
    backgroundColor: APP_COLORS.onBackground,
    borderRadius: 24,
    padding: 24,
    height: 160,
    justifyContent: 'space-between',
    borderTopWidth: 8,
    borderTopColor: APP_COLORS.onBackground,
  },
  darkCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  darkCardTextGroup: {
    flex: 1,
    paddingRight: 8
  },
  darkCardTitle: {
    color: APP_COLORS.surfaceContainerLowest,
    fontWeight: '700',
    fontSize: 15
  },
  darkCardSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2
  },
  darkCardIconBox: {
    backgroundColor: '#b71029',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  darkCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  largeTextDark: {
    fontSize: 64,
    fontWeight: '900',
    color: APP_COLORS.surfaceContainerLowest,
    lineHeight: 64,
    letterSpacing: -1
  },
  avatarStack: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stackAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    borderWidth: 2,
    borderColor: APP_COLORS.onBackground
  },
  stackAvatarCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_COLORS.primaryContainer,
    borderWidth: 2,
    borderColor: APP_COLORS.onBackground,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stackCountText: {
    color: '#4e000a',
    fontWeight: '800',
    fontSize: 10
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_COLORS.onSurface
  },
  viewAllText: {
    color: APP_COLORS.secondary,
    fontWeight: '700',
    fontSize: 14
  },
  listContainer: {
    gap: 16,
    marginBottom: 48
  },
  listItem: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
    position: 'relative',
  },
  listItemHeaderAbsolute: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
  },
  listItemRow: {
    flexDirection: 'row',
    gap: 16,
  },
  listImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    overflow: 'hidden',
  },
  listImgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listImgPlaceholderText: {
    fontSize: 28,
  },
  listContent: {
    flex: 1,
    paddingVertical: 4,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  platformPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  platformPillText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginBottom: 4,
    paddingRight: 24,
  },
  listDesc: {
    fontSize: 12,
    color: '#6b7280',
    width: '80%',
  },
  listStatusArea: {
    alignItems: 'flex-end',
    marginTop: -16,
    paddingRight: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightCard: {
    backgroundColor: '#04556a',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  insightIcon: {
    marginBottom: 12
  },
  insightTitle: {
    color: APP_COLORS.surfaceContainerLowest,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8
  },
  insightDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 32,
    paddingRight: 16,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 80,
    width: '90%',
    alignSelf: 'center',
    gap: 8,
    marginBottom: 16
  },
  bar: {
    flex: 1,
    borderRadius: 2
  },
  barActive: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#ff6b6c',
    shadowColor: '#ff6b6c',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  chartLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 16,
  },
  mixCard: {
    backgroundColor: '#e4ebf3',
    borderRadius: 24,
    padding: 24
  },
  mixTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: APP_COLORS.onSurface,
    marginBottom: 16
  },
  mixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  mixLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  mixDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  mixLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: APP_COLORS.onSurface
  },
  mixValText: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.onSurface
  },
  progressBarBG: {
    height: 3,
    backgroundColor: 'rgba(156,163,175,0.3)',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%'
  }
});

