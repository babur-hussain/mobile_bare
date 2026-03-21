import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Platform,
  Animated,
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

import { APP_COLORS } from '../constants/colors';

// #46: Skeleton loading card component
function SkeletonCards() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <>
      {[1, 2, 3].map((i) => (
        <Animated.View key={i} style={[skeletonStyles.card, { opacity }]}>
          <View style={skeletonStyles.header}>
            <View style={skeletonStyles.avatar} />
            <View style={skeletonStyles.headerText}>
              <View style={skeletonStyles.titleBar} />
              <View style={skeletonStyles.subtitleBar} />
            </View>
          </View>
          <View style={skeletonStyles.body} />
          <View style={skeletonStyles.footer}>
            <View style={skeletonStyles.footerChip} />
            <View style={skeletonStyles.footerChip} />
          </View>
        </Animated.View>
      ))}
    </>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb' },
  headerText: { marginLeft: 12, flex: 1 },
  titleBar: { width: '60%', height: 12, borderRadius: 6, backgroundColor: '#e5e7eb', marginBottom: 8 },
  subtitleBar: { width: '40%', height: 10, borderRadius: 5, backgroundColor: '#e5e7eb' },
  body: { width: '100%', height: 60, borderRadius: 10, backgroundColor: '#e5e7eb', marginBottom: 14 },
  footer: { flexDirection: 'row', gap: 8 },
  footerChip: { width: 80, height: 24, borderRadius: 12, backgroundColor: '#e5e7eb' },
});

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

  // Real aggregates from store — memoized to avoid recalculation every render
  const pendingCount = useMemo(() =>
    posts.filter(p => p.status === 'pending' || p.status === 'processing').length,
    [posts],
  );
  const publishedCount = useMemo(() =>
    posts.filter(p => p.status === 'published').length,
    [posts],
  );
  const accountsCount = accounts.length;

  const displayPosts = useMemo(() => {
    const recentSlice = posts.slice(0, 3);
    return recentSlice.map(p => {
      const isPending = p.status === 'pending' || p.status === 'processing';
      const mediaUrl = Array.isArray(p.mediaUrl) ? p.mediaUrl[0] : p.mediaUrl;
      // Use server-stored thumbnailUrl for videos (cross-device), fallback to mediaUrl for images
      const img = (p as any).thumbnailUrl || mediaUrl || null;
      return {
        id: p._id,
        title: p.caption || 'No Caption',
        status: isPending ? 'QUEUED' : 'PUBLISHED',
        time: p.scheduledTime ? new Date(p.scheduledTime).toLocaleDateString() : 'Just now',
        platform: p.platforms?.[0] || 'App',
        platformColor: p.platforms?.[0] === 'instagram' ? APP_COLORS.primary : APP_COLORS.secondary,
        img,
        desc: (p.caption || '').substring(0, 60) + (p.caption && p.caption.length > 60 ? '...' : ''),
      };
    });
  }, [posts]);


  const firstName = useMemo(() => {
    if (user?.name) return user.name.split(' ')[0];
    const fbUser = getAuth().currentUser;
    if (fbUser?.displayName) return fbUser.displayName.split(' ')[0];
    if (fbUser?.email) return fbUser.email.split('@')[0];
    return 'there';
  }, [user]);

  const fbUser = getAuth().currentUser;
  const avatarUrl = useMemo(() => (
    (user as any)?.picture || (user as any)?.profilePicture || fbUser?.photoURL || null
  ), [user, fbUser?.photoURL]);

  // #47: Generate initials for fallback avatar
  const initials = useMemo(() => {
    const name = user?.name || fbUser?.displayName || fbUser?.email || '';
    const parts = name.split(/[\s@]+/);
    return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
  }, [user, fbUser]);

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
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SocialHub')}>
            <Text style={{ fontSize: 18, color: APP_COLORS.primary, fontWeight: '800' }}>@</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.profileAvatar} />
            ) : (
              <View style={[styles.profileAvatar, styles.initialsAvatar]}>
                <Text style={styles.initialsText}>{initials || '?'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={APP_COLORS.primary} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.overline}>WELCOME BACK, {firstName.toUpperCase()}</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate('Posts')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {isLoading && posts.length === 0 ? (
            <SkeletonCards />
          ) : displayPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📝</Text>
              <Text style={styles.emptyStateTitle}>No posts yet</Text>
              <Text style={styles.emptyStateDesc}>Create your first post to get started!</Text>
              <TouchableOpacity
                style={styles.emptyStateCTA}
                onPress={() => navigation.navigate('Create Post')}
                activeOpacity={0.8}>
                <Plus size={16} color={APP_COLORS.onPrimary} strokeWidth={3} />
                <Text style={styles.emptyStateCTAText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            displayPosts.map((post, idx) => {
              const isQueued = post.status.includes('QUEUED');
              return (
                <TouchableOpacity
                  key={post.id || idx.toString()}
                  style={styles.listItem}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('PostDetails', { post: posts[idx] })}>
                  <TouchableOpacity
                    style={styles.listItemHeaderAbsolute}
                    onPress={() => navigation.navigate('PostDetails', { post: posts[idx] })}>
                    <MoreHorizontal size={20} color={APP_COLORS.outlineVariant} />
                  </TouchableOpacity>
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
            })
          )}
        </View>

        {/* Growth Insight — Coming Soon (#34) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Growth Insight</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        </View>
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
  },
  // #47: Initials avatar fallback
  initialsAvatar: {
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
  },
  // #45: Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: APP_COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyStateCTAText: {
    color: APP_COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  // #34: Coming Soon badge
  comingSoonBadge: {
    backgroundColor: `${APP_COLORS.secondary}22`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: APP_COLORS.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
});

