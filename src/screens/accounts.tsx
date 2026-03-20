import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import {
  Users,
  Camera,
  BarChart2,
  Bell,
  Share2,
  Plus,
  AtSign,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState, AppDispatch } from '../store';
import {
  fetchAllAccounts,
  disconnectSocialAccount,
} from '../store/actions/accounts.actions';
import { socialService } from '../services/social.service';

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
  surfaceContainer: '#f0edec',
  outlineVariant: '#c8c4d7',
  secondaryContainer: '#1470e8',
  primaryContainer: '#6c5ce7',
  onPrimaryContainer: '#faf6ff',
  onPrimary: '#ffffff',
  success: '#10B981', // Emerald green for connected states
  error: '#ba1a1a',
  twitter: '#1DA1F2',
};

export default function AccountsScreen() {
  const { items: accounts, isLoading } = useSelector(
    (state: RootState) => state.accounts,
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    dispatch(fetchAllAccounts());
  }, []);

  const onRefresh = () => {
    dispatch(fetchAllAccounts());
  };

  const getInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length > 1) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return 'UP';
  };

  // Handle deep link callback from Meta OAuth
  const handleDeepLink = useCallback(
    (event: { url: string }) => {
      const url = event.url;
      if (url.startsWith('postingautomation://social-auth-callback')) {
        // Parse query params manually (Hermes doesn't support URLSearchParams.get)
        const queryString = url.split('?')[1] || '';
        const params: Record<string, string> = {};
        queryString.split('&').forEach(pair => {
          const [key, ...rest] = pair.split('=');
          if (key) {
            params[key] = rest.join('=');
          }
        });
        const success = params.success === 'true';
        const platform = params.platform;
        const account = params.account;
        const message = params.message;

        if (success && platform && account) {
          Alert.alert(
            'Account Connected',
            `Successfully connected ${decodeURIComponent(
              account,
            )} on ${platform}.`,
          );
        } else {
          Alert.alert(
            'Connection Failed',
            message
              ? decodeURIComponent(message)
              : 'Failed to connect account. Please try again.',
          );
        }

        // Refresh the accounts list after callback
        dispatch(fetchAllAccounts());
      }
    },
    [dispatch],
  );

  useEffect(() => {
    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);
  const handleConnect = async (
    platform: 'instagram' | 'facebook' | 'youtube' | 'x' | 'threads',
  ) => {
    try {
      // Fetch the OAuth URL from the backend (authenticated request)
      const url = await socialService.getConnectUrl(platform);

      console.log(`[SocialConnect] Got OAuth URL for ${platform}:`, url);

      // Validate URL before passing to InAppBrowser (nil URL causes native crash)
      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        Alert.alert(
          'Connection Error',
          'Could not get a valid authorization URL. Please check your Meta app configuration.',
        );
        return;
      }

      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(
          url,
          'postingautomation://',
          {
            ephemeralWebSession: false,
            showTitle: true,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
          },
        );

        if (result.type === 'success' && result.url) {
          handleDeepLink({ url: result.url });
        } else if (result.type === 'cancel') {
          console.log('[SocialConnect] User cancelled OAuth flow');
        }
      } else {
        await Linking.openURL(url);
      }
    } catch (error: any) {
      console.error(
        '[SocialConnect] Error:',
        error?.response?.data || error?.message || error,
      );
      Alert.alert(
        'Connection Error',
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start connection. Please try again.',
      );
    }
  };

  const handleDisconnect = (accountId: string, accountName: string) => {
    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect "${accountName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => dispatch(disconnectSocialAccount(accountId)),
        },
      ],
    );
  };

  const instagramAccount = useMemo(() => accounts.find(
    (a: any) => a.platform === 'instagram',
  ), [accounts]);
  const facebookAccounts = useMemo(() => accounts.filter(
    (a: any) => a.platform === 'facebook',
  ), [accounts]);
  const youtubeAccounts = useMemo(() => accounts.filter((a: any) => a.platform === 'youtube'), [accounts]);
  const xAccount = useMemo(() => accounts.find(
    (a: any) => a.platform === 'x' || a.platform === 'twitter',
  ), [accounts]);
  const threadsAccount = useMemo(() => accounts.find((a: any) => a.platform === 'threads'), [accounts]);

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 64 + insets.top },
        ]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
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
            onRefresh={onRefresh}
            tintColor={APP_COLORS.primary}
          />
        }>
        {/* Header Section */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>Connected Pages</Text>
          <Text style={styles.subtitle}>
            Linking accounts gives PostOnce permissions to publish on your
            behalf. We don't post without your approval.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Instagram Card */}
          <View
            style={[
              styles.card,
              instagramAccount ? styles.connectedCard : styles.disconnectedCard,
            ]}>
            <View style={styles.cardHeader}>
              <View>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: instagramAccount
                        ? APP_COLORS.surfaceContainerLowest
                        : APP_COLORS.surfaceContainer,
                    },
                  ]}>
                  <Instagram size={28} color={APP_COLORS.primary} />
                </View>
                <Text style={styles.platformName}>Instagram</Text>
                <Text style={styles.platformMeta}>BUSINESS ACCOUNT</Text>
              </View>

              {instagramAccount ? (
                <View style={styles.connectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.success },
                    ]}
                  />
                  <Text
                    style={[
                      styles.connectedBadgeText,
                      { color: APP_COLORS.success },
                    ]}>
                    CONNECTED
                  </Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.error },
                    ]}
                  />
                  <Text style={styles.disconnectedBadgeText}>DISCONNECTED</Text>
                </View>
              )}
            </View>

            {instagramAccount ? (
              <View style={styles.cardFooterConnectedWrap}>
                <View style={styles.connectedProfileBox}>
                  <Image
                    source={{
                      uri:
                        instagramAccount.profilePicture ||
                        `https://ui-avatars.com/api/?name=${instagramAccount.accountName}`,
                    }}
                    style={styles.pageProfileImage}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.pageName}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      @{instagramAccount.accountName}
                    </Text>
                    <Text style={styles.pageRole}>Business Account</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.disconnectButtonFull}
                  activeOpacity={0.7}
                  onPress={() =>
                    handleDisconnect(
                      instagramAccount._id,
                      instagramAccount.accountName,
                    )
                  }>
                  <Text style={styles.disconnectButtonText}>
                    Disconnect Account
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cardFooterDisconnect}>
                <Text style={styles.disconnectDesc}>
                  Post directly to your Feed and Reels. Ensure it's a
                  Professional account.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    { backgroundColor: APP_COLORS.primary },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleConnect('instagram')}>
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Simulated Blur Bubble */}
            {!instagramAccount && <View style={styles.blurBubble} />}
          </View>

          {/* Threads Card */}
          <View
            style={[
              styles.card,
              threadsAccount ? styles.connectedCard : styles.disconnectedCard,
            ]}>
            <View style={styles.cardHeader}>
              <View>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: threadsAccount
                        ? APP_COLORS.surfaceContainerLowest
                        : APP_COLORS.surfaceContainer,
                    },
                  ]}>
                  <AtSign size={28} color={APP_COLORS.onSurface} />
                </View>
                <Text style={styles.platformName}>Threads</Text>
                <Text style={styles.platformMeta}>TEXT CONVERSATIONS</Text>
              </View>

              {threadsAccount ? (
                <View style={styles.connectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.success },
                    ]}
                  />
                  <Text
                    style={[
                      styles.connectedBadgeText,
                      { color: APP_COLORS.success },
                    ]}>
                    CONNECTED
                  </Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.error },
                    ]}
                  />
                  <Text style={styles.disconnectedBadgeText}>DISCONNECTED</Text>
                </View>
              )}
            </View>

            {threadsAccount ? (
              <View style={styles.cardFooterConnectedWrap}>
                <View style={styles.connectedProfileBox}>
                  <Image
                    source={{
                      uri:
                        threadsAccount.profilePicture ||
                        `https://ui-avatars.com/api/?name=${threadsAccount.accountName}`,
                    }}
                    style={styles.pageProfileImage}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.pageName}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      @{threadsAccount.accountName}
                    </Text>
                    <Text style={styles.pageRole}>Threads Profile</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.disconnectButtonFull}
                  activeOpacity={0.7}
                  onPress={() =>
                    handleDisconnect(
                      threadsAccount._id,
                      threadsAccount.accountName,
                    )
                  }>
                  <Text style={styles.disconnectButtonText}>
                    Disconnect Account
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cardFooterDisconnect}>
                <Text style={styles.disconnectDesc}>
                  Share text updates and join public conversations on Threads.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    { backgroundColor: APP_COLORS.onSurface },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleConnect('threads')}>
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            )}

            {!threadsAccount && (
              <View
                style={[
                  styles.blurBubble,
                  { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
                ]}
              />
            )}
          </View>

          {/* Facebook Card */}
          <View
            style={[
              styles.card,
              facebookAccounts.length > 0
                ? styles.connectedCard
                : styles.disconnectedCard,
            ]}>
            <View style={styles.cardHeader}>
              <View>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        facebookAccounts.length > 0
                          ? APP_COLORS.surfaceContainerLowest
                          : APP_COLORS.surfaceContainer,
                    },
                  ]}>
                  <BarChart2 size={28} color={APP_COLORS.secondary} />
                </View>
                <Text style={styles.platformName}>Facebook</Text>
                <Text style={styles.platformMeta}>COMMUNITY REACH</Text>
              </View>

              {facebookAccounts.length > 0 ? (
                <View style={styles.connectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.success },
                    ]}
                  />
                  <Text
                    style={[
                      styles.connectedBadgeText,
                      { color: APP_COLORS.success },
                    ]}>
                    CONNECTED
                  </Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.error },
                    ]}
                  />
                  <Text style={styles.disconnectedBadgeText}>DISCONNECTED</Text>
                </View>
              )}
            </View>

            {facebookAccounts.length > 0 ? (
              <View style={{ gap: 12, marginTop: 16 }}>
                {facebookAccounts.map((account: any) => (
                  <View
                    key={account._id}
                    style={styles.cardFooterConnectedWrap}>
                    <View style={styles.connectedProfileBox}>
                      <Image
                        source={{
                          uri:
                            account.profilePicture ||
                            `https://ui-avatars.com/api/?name=${account.accountName}`,
                        }}
                        style={styles.pageProfileImage}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pageName} numberOfLines={1}>
                          {account.accountName}
                        </Text>
                        <Text style={styles.pageRole}>Page</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.disconnectButtonFull}
                      activeOpacity={0.7}
                      onPress={() =>
                        handleDisconnect(account._id, account.accountName)
                      }>
                      <Text style={styles.disconnectButtonText}>
                        Disconnect Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.cardFooterDisconnect}>
                <Text style={styles.disconnectDesc}>
                  Connect to share posts, videos, and reels to your Page.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    { backgroundColor: APP_COLORS.secondary },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleConnect('facebook')}>
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            )}
            {!facebookAccounts.length && (
              <View
                style={[
                  styles.blurBubble,
                  { backgroundColor: 'rgba(0, 88, 189, 0.05)' },
                ]}
              />
            )}
          </View>

          {/* YouTube Card */}
          <View
            style={[
              styles.card,
              youtubeAccounts.length > 0
                ? styles.connectedCard
                : styles.disconnectedCard,
            ]}>
            <View style={styles.cardHeader}>
              <View>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        youtubeAccounts.length > 0
                          ? APP_COLORS.surfaceContainerLowest
                          : APP_COLORS.surfaceContainer,
                    },
                  ]}>
                  <Youtube size={28} color={APP_COLORS.tertiary} />
                </View>
                <Text style={styles.platformName}>YouTube</Text>
                <Text style={styles.platformMeta}>VIDEO CONTENT</Text>
              </View>

              {youtubeAccounts.length > 0 ? (
                <View style={styles.connectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.success },
                    ]}
                  />
                  <Text
                    style={[
                      styles.connectedBadgeText,
                      { color: APP_COLORS.success },
                    ]}>
                    CONNECTED
                  </Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.error },
                    ]}
                  />
                  <Text style={styles.disconnectedBadgeText}>DISCONNECTED</Text>
                </View>
              )}
            </View>

            {youtubeAccounts.length > 0 ? (
              <View style={{ gap: 12, marginTop: 16 }}>
                {youtubeAccounts.map((account: any) => (
                  <View
                    key={account._id}
                    style={styles.cardFooterConnectedWrap}>
                    <View style={styles.connectedProfileBox}>
                      <Image
                        source={{
                          uri:
                            account.profilePicture ||
                            `https://ui-avatars.com/api/?name=${account.accountName}`,
                        }}
                        style={styles.pageProfileImage}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pageName} numberOfLines={1}>
                          {account.accountName}
                        </Text>
                        <Text style={styles.pageRole}>Channel</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.disconnectButtonFull}
                      activeOpacity={0.7}
                      onPress={() =>
                        handleDisconnect(account._id, account.accountName)
                      }>
                      <Text style={styles.disconnectButtonText}>
                        Disconnect Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.cardFooterDisconnect}>
                <Text style={styles.disconnectDesc}>
                  Connect to publish videos directly to your YouTube Channel.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    { backgroundColor: APP_COLORS.tertiary },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleConnect('youtube')}>
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            )}
            {!youtubeAccounts.length && (
              <View
                style={[
                  styles.blurBubble,
                  { backgroundColor: 'rgba(178, 0, 75, 0.05)' },
                ]}
              />
            )}
          </View>

          {/* X (Twitter) Card */}
          <View
            style={[
              styles.card,
              xAccount ? styles.connectedCard : styles.disconnectedCard,
            ]}>
            <View style={styles.cardHeader}>
              <View>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: xAccount
                        ? APP_COLORS.surfaceContainerLowest
                        : APP_COLORS.surfaceContainer,
                    },
                  ]}>
                  <Twitter size={28} color={APP_COLORS.twitter} />
                </View>
                <Text style={styles.platformName}>X (Twitter)</Text>
                <Text style={styles.platformMeta}>UPDATE & TREND</Text>
              </View>

              {xAccount ? (
                <View style={styles.connectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.success },
                    ]}
                  />
                  <Text
                    style={[
                      styles.connectedBadgeText,
                      { color: APP_COLORS.success },
                    ]}>
                    CONNECTED
                  </Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: APP_COLORS.error },
                    ]}
                  />
                  <Text style={styles.disconnectedBadgeText}>DISCONNECTED</Text>
                </View>
              )}
            </View>

            {xAccount ? (
              <View style={styles.cardFooterConnectedWrap}>
                <View style={styles.connectedProfileBox}>
                  <Image
                    source={{
                      uri:
                        xAccount.profilePicture ||
                        `https://ui-avatars.com/api/?name=${xAccount.accountName}`,
                    }}
                    style={styles.pageProfileImage}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.pageName}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      @{xAccount.accountName}
                    </Text>
                    <Text style={styles.pageRole}>Twitter Account</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.disconnectButtonFull}
                  activeOpacity={0.7}
                  onPress={() =>
                    handleDisconnect(xAccount._id, xAccount.accountName)
                  }>
                  <Text style={styles.disconnectButtonText}>
                    Disconnect Account
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cardFooterDisconnect}>
                <Text style={styles.disconnectDesc}>
                  Share thoughts and media instantly to your followers on X.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    { backgroundColor: APP_COLORS.twitter },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleConnect('x')}>
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            )}

            {!xAccount && (
              <View
                style={[
                  styles.blurBubble,
                  { backgroundColor: 'rgba(29, 161, 242, 0.05)' },
                ]}
              />
            )}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Platform.OS === 'ios' ? 100 : 96 }]}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(252, 249, 248, 0.85)',
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: APP_COLORS.onPrimaryContainer,
    fontSize: 12,
    fontWeight: '800',
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  heroSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: APP_COLORS.onSurfaceVariant,
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.15)', // ghost-border
    overflow: 'hidden',
  },
  disconnectedCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    shadowColor: '#1c1b1b',
    shadowOpacity: 0.04,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
    elevation: 4,
  },
  connectedCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    shadowColor: '#1c1b1b',
    shadowOpacity: 0.04,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    zIndex: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformName: {
    fontSize: 24,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginBottom: 4,
  },
  platformMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: APP_COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
  },
  disconnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  disconnectedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: APP_COLORS.onSurfaceVariant,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // success with 10% opacity
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  connectedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: APP_COLORS.success,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardFooterDisconnect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    zIndex: 10,
  },
  disconnectDesc: {
    flex: 1,
    fontSize: 12,
    color: APP_COLORS.onSurfaceVariant,
  },
  connectButton: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  connectButtonText: {
    color: APP_COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  cardFooterConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.1)',
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)', // APP_COLORS.error with opacity
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
  },
  disconnectButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.error,
  },
  cardFooterConnectedWrap: {
    gap: 12,
  },
  connectedProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.1)',
  },
  disconnectButtonFull: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
  },
  connectedProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
  },
  pageName: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  pageRole: {
    fontSize: 12,
    color: APP_COLORS.onSurfaceVariant,
  },
  blurBubble: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(83, 65, 205, 0.05)',
    zIndex: 1,
  },
  placeholderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  placeholderBox: {
    flex: 1,
    backgroundColor: 'rgba(246, 243, 242, 0.5)', // surfaceContainerLow/50
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.3)', // dashed technically requires view hacking in RN, we use thin border
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(71, 69, 84, 0.6)',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: APP_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: APP_COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100,
  },
});
