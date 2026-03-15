import React, {useEffect, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Bell,
  Share2,
  Plus,
  Calendar,
  Send,
  Check,
  Link,
  UserPlus,
  Clock,
  MessageCircle,
  BarChart2,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getAuth} from '@react-native-firebase/auth';
import {RootState, AppDispatch} from '../store';
import {fetchAllPosts} from '../store/actions/posts.actions';
import {fetchAllAccounts} from '../store/actions/accounts.actions';

// Extracted from HTML config
const APP_COLORS = {
  primary: '#5341cd',
  secondary: '#0058bd',
  tertiary: '#b2004b',
  surface: '#fcf9f8',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#474554',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHighest: '#e5e2e1',
  outlineVariant: '#c8c4d7',
  onPrimary: '#ffffff',
  secondaryFixed: '#d8e2ff',
  onSecondaryFixedVariant: '#004494',
  error: '#ef4444',
};

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const {items: posts, isLoading} = useSelector(
    (state: RootState) => state.posts,
  );
  const {items: accounts} = useSelector((state: RootState) => state.accounts);
  const {user} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchAllPosts(1));
    dispatch(fetchAllAccounts()); // if there is such action, to populate accounts count
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAllPosts(1));
    dispatch(fetchAllAccounts());
  };

  // Mock aggregates if not available from backend directly
  const pendingCount =
    posts.filter(p => p.status === 'pending' || p.status === 'processing')
      .length || 24;
  const publishedCount =
    posts.filter(p => p.status === 'published').length || 142;
  const accountsCount = accounts.length || 6;

  // Take top 3 for recent
  const recentPosts = posts.slice(0, 3);
  // Default mock recent posts if empty
  const mockRecentPosts = [
    {
      id: '1',
      title: 'Strategy for Q4 Growth: A thread on automation...',
      status: 'SCHEDULED',
      time: 'Tomorrow, 10:00 AM',
      platform: 'LinkedIn, X',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6ftn79RgmSVZbqW54o9xRM3ZVBk7UF_YEsvA8s2Y1kjWFDjS9a-HYFxZHuqviIdBOE0Eq1iOPZq4W3ckqw5mMJuBc_UVhxrR6tnp8Ky-2Nw-_xRddePeOqdJY9iUBZPQgRWCLbfMAF8pvFnBm-7A-isUCribBpdiR7_ILv6vSurQRgwhq3Q_5Iwqed6spXBxIEfsbZ7-XSC221dORpg8lg6rndYATflX_yg1wcKNGGt9-HYQ0d6DJrspdi7NzNg1aLX3hC4710otZ',
    },
    {
      id: '2',
      title: 'How we built the PostOnce API for developers',
      status: 'PUBLISHED',
      time: '2h ago',
      platform: '1.2k reach',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnRj0E8S-yMwiSH12ek1gxbfJIuyF6KQFQPHBZPnQPrdpKx4c2lsrTJSlNpYaqymtepXUn8juj_NaFAyHkRKO8HIHQ0QdTnIyz5IQnApYiRYTiRTrGaSPJ9_S_g9u6BOdJRrhIxZphoh--m6S5UeJLLnxsEI9wr0-uzvdr_Cah3CqYRb0L1NLmv62x8oD11Mz80BOeJ8SJYH__lwAnwRXOqt22t_zY7VqG90EE2QZ42YzB46LX7Mm53JjUKrXUhFevDWbUkLWVc5Z',
    },
  ];

  const displayPosts =
    recentPosts.length > 0
      ? recentPosts.map(p => ({
          id: p._id,
          title: p.caption || 'No Caption',
          status:
            p.status === 'pending' || p.status === 'processing'
              ? 'SCHEDULED'
              : p.status.toUpperCase(),
          time: p.scheduledTime
            ? new Date(p.scheduledTime).toLocaleDateString()
            : 'Just now',
          platform: p.platforms.join(', '),
          img: p.mediaUrl || mockRecentPosts[0].img, // Fallback image if non provided
          errorReason:
            (p as any).publishResults?.find((r: any) => r.error)?.error || '',
        }))
      : mockRecentPosts;

  const getFirstName = () => {
    // 1. Try Redux user name (from backend profile)
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    // 2. Fallback: Firebase Auth currentUser displayName (always set for Google sign-in)
    const firebaseUser = getAuth().currentUser;
    if (firebaseUser?.displayName) {
      return firebaseUser.displayName.split(' ')[0];
    }
    // 3. Fallback: email prefix
    if (firebaseUser?.email) {
      return firebaseUser.email.split('@')[0];
    }
    return 'there';
  };

  // Avatar: Redux → Firebase photoURL → default placeholder
  const firebaseUser = getAuth().currentUser;
  const avatarUrl =
    (user as any)?.picture ||
    (user as any)?.profilePicture ||
    firebaseUser?.photoURL ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBymt4ij5BoT4YD1QlZ496VWxlAtnapwg9E5giw_Py_L2ZUL28KQx_k3UeAy_UWn4g2917FA8feb8c3a0sKsUbcf4D3ZBn2pp0l31Ip6HXEAeVx8R4MxzBls-WXT6X1u_jO9t2F0noNzahcdhyJLW2_rQ6tJCC5XEzVDoD8YMG_gF7IVLnASr70TbMZfzJd7j00KCAuEWtF20C6JTVoVuaaz1Y0jfVd4oeuDOr0GBjwmMlZiMHEI6TPRyhuHXCe6p96oyv1mIlj0P-g';

  return (
    <View style={styles.container}>
      {/* Top App Bar - Glass feel achieved via semi-transparent BG in RN */}
      <View
        style={[
          styles.header,
          {paddingTop: insets.top, height: 64 + insets.top},
        ]}>
        <View style={styles.headerLeft}>
          <Image source={{uri: avatarUrl}} style={styles.profileAvatar} />
          <Text style={styles.headerBrand}>PostOnce</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color={APP_COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={APP_COLORS.primary}
          />
        }>
        {/* Welcome Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.overline}>DASHBOARD</Text>
          <Text style={styles.welcomeText}>Welcome, {getFirstName()}</Text>
          <Text style={styles.subtitle}>
            Your content engine is running smoothly today.
          </Text>
        </View>

        {/* Stats Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Scheduled Full Width */}
          <View style={[styles.bentoItem, styles.bentoFull]}>
            <View>
              <Text style={styles.bentoLabel}>POSTS SCHEDULED</Text>
              <Text style={styles.bentoValuePrimary}>{pendingCount}</Text>
            </View>
            <View style={styles.bentoCirclesRow}>
              <View
                style={[
                  styles.platformCircle,
                  {
                    backgroundColor: 'rgba(83, 65, 205, 0.1)',
                    borderColor: APP_COLORS.surfaceContainerLowest,
                    zIndex: 3,
                  },
                ]}>
                <Text style={styles.circleText}>IG</Text>
              </View>
              <View
                style={[
                  styles.platformCircle,
                  {
                    backgroundColor: 'rgba(0, 88, 189, 0.1)',
                    borderColor: APP_COLORS.surfaceContainerLowest,
                    zIndex: 2,
                    marginLeft: -12,
                  },
                ]}>
                <Text style={styles.circleText}>X</Text>
              </View>
              <View
                style={[
                  styles.platformCircle,
                  {
                    backgroundColor: 'rgba(178, 0, 75, 0.1)',
                    borderColor: APP_COLORS.surfaceContainerLowest,
                    zIndex: 1,
                    marginLeft: -12,
                  },
                ]}>
                <Text style={styles.circleText}>LI</Text>
              </View>
            </View>
          </View>

          <View style={styles.bentoRow}>
            {/* Published Box */}
            <View
              style={[
                styles.bentoItem,
                styles.bentoHalf,
                {backgroundColor: APP_COLORS.surfaceContainerLow},
              ]}>
              <Text style={styles.bentoLabel}>PUBLISHED</Text>
              <View style={styles.bentoValRow}>
                <Text style={styles.bentoValue}>{publishedCount}</Text>
                <Text style={styles.bentoBadge}>+12%</Text>
              </View>
            </View>
            {/* Accounts Box */}
            <View
              style={[
                styles.bentoItem,
                styles.bentoHalf,
                {backgroundColor: APP_COLORS.surfaceContainerLow},
              ]}>
              <Text style={styles.bentoLabel}>ACCOUNTS</Text>
              <View style={styles.bentoValRow}>
                <Text style={styles.bentoValue}>
                  {accountsCount.toString().padStart(2, '0')}
                </Text>
                <Link size={16} color="rgba(71, 69, 84, 0.4)" />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => navigation.navigate('Create Post')}
            activeOpacity={0.8}>
            <Plus size={24} color={APP_COLORS.onPrimary} />
            <Text style={styles.primaryActionText}>Create Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => navigation.navigate('Accounts')}
            activeOpacity={0.8}>
            <UserPlus size={24} color={APP_COLORS.onSurface} />
            <Text style={styles.secondaryActionText}>Connect Account</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Posts Queue */}
        <View style={styles.queueSection}>
          <View style={styles.queueHeader}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineContainer}>
            {/* Timeline Line */}
            <View style={styles.timelineLine}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineDot} />
              <View style={styles.timelineDot} />
            </View>

            {displayPosts.map((post, idx) => {
              const isScheduled = post.status.includes('SCHEDULED');
              const isFailed = post.status.includes('FAILED');
              return (
                <TouchableOpacity
                  key={post.id || idx.toString()}
                  style={styles.postItem}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('PostDetails', {post})}>
                  <Image source={{uri: post.img}} style={styles.postImg} />
                  <View style={styles.postContent}>
                    <View style={styles.postTitleRow}>
                      <Text style={styles.postTitle} numberOfLines={1}>
                        {post.title}
                      </Text>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: isFailed
                              ? 'rgba(178, 0, 75, 0.1)'
                              : isScheduled
                              ? APP_COLORS.secondaryFixed
                              : APP_COLORS.surfaceContainerHighest,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusPillText,
                            {
                              color: isFailed
                                ? APP_COLORS.error
                                : isScheduled
                                ? APP_COLORS.onSecondaryFixedVariant
                                : APP_COLORS.onSurfaceVariant,
                            },
                          ]}>
                          {post.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.postMetaRow}>
                      <View style={styles.metaItem}>
                        {isScheduled ? (
                          <Calendar
                            size={12}
                            color={APP_COLORS.onSurfaceVariant}
                          />
                        ) : isFailed ? (
                          <Clock size={12} color={APP_COLORS.error} />
                        ) : (
                          <Clock size={12} color={APP_COLORS.tertiary} />
                        )}
                        <Text style={styles.metaText}>{post.time}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        {isScheduled ? (
                          <MessageCircle
                            size={12}
                            color={APP_COLORS.onSurfaceVariant}
                          />
                        ) : (
                          <BarChart2
                            size={12}
                            color={APP_COLORS.onSurfaceVariant}
                          />
                        )}
                        <Text style={styles.metaText}>{post.platform}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Padding for Bottom Nav/FAB */}
        <View style={{height: 100}} />
      </ScrollView>

      {/* Floating Action Button */}
      {/* Handled by React Navigation normally, but manually overriding here per design */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Create Post')}
        activeOpacity={0.8}>
        <Plus size={32} color={APP_COLORS.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
  },
  header: {
    // Height and paddingTop handled dynamically inline via useSafeAreaInsets
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(252, 249, 248, 0.9)', // Simulated glass
    zIndex: 50,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(83, 65, 205, 0.1)',
    backgroundColor: APP_COLORS.surfaceContainerHighest,
  },
  headerBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroSection: {
    marginBottom: 32,
    gap: 4,
  },
  overline: {
    fontSize: 11,
    letterSpacing: 0.5,
    color: APP_COLORS.onSurfaceVariant,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    letterSpacing: -1,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(71, 69, 84, 0.7)',
  },
  bentoGrid: {
    gap: 16,
    marginBottom: 32,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bentoItem: {
    borderRadius: 20,
    padding: 20,
  },
  bentoFull: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.1)',
    shadowColor: 'black',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },
  bentoHalf: {
    flex: 1,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: APP_COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  bentoValuePrimary: {
    fontSize: 48,
    fontWeight: '800',
    color: APP_COLORS.primary,
    lineHeight: 52,
  },
  bentoValue: {
    fontSize: 30,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    lineHeight: 34,
  },
  bentoCirclesRow: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  platformCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontSize: 10,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  bentoValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bentoBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.secondary,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 40,
  },
  primaryActionButton: {
    backgroundColor: APP_COLORS.primary, // Using primary since solid gradients on RN buttons require linear-gradient package
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    gap: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.onPrimary,
  },
  secondaryActionButton: {
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  queueSection: {
    marginBottom: 20,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.primary,
    letterSpacing: 0.5,
  },
  timelineContainer: {
    position: 'relative',
    gap: 32,
  },
  timelineLine: {
    position: 'absolute',
    left: 24,
    top: 40,
    bottom: 0,
    width: 2,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 16,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: APP_COLORS.onSurfaceVariant,
    opacity: 0.2,
  },
  postItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    zIndex: 10,
  },
  postImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
  },
  postContent: {
    flex: 1,
  },
  postTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    color: APP_COLORS.onSurfaceVariant,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: APP_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: APP_COLORS.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 40,
  },
});
