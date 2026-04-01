import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Animated,
  Easing,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  AlertCircle,
  BarChart2,
  Heart,
  TrendingUp,
  MessageCircle,
  Share2,
  Users,
  Eye,
  Trash2,
  CheckCircle,
} from 'lucide-react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { postsService } from '../services/posts.service';
import { threadsService } from '../services/threads.service';
import { createThumbnail } from 'react-native-create-thumbnail';
import { TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import { removePost } from '../store/slices/posts.slice';
import api from '../services/api';
import LottieView from 'lottie-react-native';
import { Config } from '../constants/config';

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

export default function PostDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = (route.params as any) || {};

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <ArrowLeft size={24} color={APP_COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text>Post not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStr = (post.status || '').toUpperCase();
  const isFailed = statusStr.includes('FAILED');
  const isScheduled = statusStr.includes('SCHEDULED') || statusStr.includes('QUEUED');
  const isPublished = statusStr.includes('PUBLISHED') || statusStr === 'SUCCESS';

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  // Skeleton Animation Pulse - useRef to persist across renders
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<any | null>(null);
  const [deletingPlatform, setDeletingPlatform] = useState<string | null>(null);

  const dispatch = useDispatch();
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const [successMessage, setSuccessMessage] = useState('This post has been permanently removed from your history and all platforms.');

  const handleDeleteEverywhere = () => {
    Alert.alert(
      'Delete Post Everywhere',
      'Are you sure you want to completely delete this post from all platforms and your history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAll(true);
            try {
              // 1. Delete from all platforms if published
              const promises = [];
              const platList = (post?.platforms || []).map((p: string) => p.toLowerCase());
              if (platList.includes('facebook')) promises.push(postsService.deleteFacebook(post._id));
              if (platList.includes('instagram')) promises.push(postsService.deleteInstagram(post._id));
              if (platList.includes('threads')) promises.push(postsService.deleteThreads(post._id));

              await Promise.allSettled(promises);

              // 2. Delete from backend DB
              await api.delete(`/api/v1/posts/${post._id}`);

              // 3. Remove locally so it disappears from Recent Posts immediately
              dispatch(removePost(post._id));

              // 4. Show success animation
              setIsDeletingAll(false);
              setSuccessMessage('This post has been permanently removed from your history and all platforms.');
              setShowSuccessOverlay(true);

              Animated.timing(successOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                // Let the Lottie animation play for 2.5 seconds before navigating back
                setTimeout(() => {
                  Animated.timing(successOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => {
                    setShowSuccessOverlay(false);
                    navigation.goBack();
                  });
                }, 2500);
              });

            } catch (err: any) {
              setIsDeletingAll(false);
              Alert.alert('Error', err?.message || 'Failed to delete post.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (loadingAnalytics) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      pulseLoopRef.current = loop;
      loop.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;
      pulseAnim.setValue(0.3);
    }
    return () => {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;
    };
  }, [loadingAnalytics, pulseAnim]);

  const getFullUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${Config.API_BASE_URL}${url}`;
    return `${Config.API_BASE_URL}/${url}`;
  };

  const rawMediaUrl = post?.mediaUrl || post?.mediaUrls?.[0] || post?.img;
  const rawThumbnailUrl = post?.thumbnailUrl || null;

  const mediaUrl = getFullUrl(rawMediaUrl);
  const serverThumbnailUrl = getFullUrl(rawThumbnailUrl);

  useEffect(() => {
    if (mediaUrl) {
      const _isVideo =
        mediaUrl.match(/\.(mp4|mov|m4v)$/i) || mediaUrl.includes('video');
      setIsVideo(!!_isVideo);

      if (_isVideo) {
        if (serverThumbnailUrl) {
          // Use server-stored thumbnail — works cross-device, no local generation needed
          setVideoThumbnail(serverThumbnailUrl);
        } else {
          // Fallback: generate locally (only works on this device, this session)
          createThumbnail({ url: mediaUrl, timeStamp: 1000 })
            .then(res => setVideoThumbnail(res.path))
            .catch(err => console.log('Error generating thumbnail:', err));
        }
      }
    }
  }, [mediaUrl, serverThumbnailUrl]);


  useEffect(() => {
    let mounted = true;
    if (isPublished && post?._id) {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      const platList = post.platforms && Array.isArray(post.platforms)
        ? post.platforms.map((p: string) => p.toLowerCase())
        : [];

      const fetchPromises: Promise<any>[] = [];

      if (platList.includes('facebook')) {
        fetchPromises.push(postsService.getFacebookAnalytics(post._id));
      }
      if (platList.includes('instagram')) {
        fetchPromises.push(postsService.getInstagramAnalytics(post._id));
      }
      if (platList.includes('threads')) {
        fetchPromises.push(postsService.getThreadsAnalytics(post._id));
      }

      if (fetchPromises.length === 0) {
        setLoadingAnalytics(false);
        setAnalyticsError('No platforms found to fetch analytics for.');
        return;
      }

      Promise.allSettled(fetchPromises)
        .then(results => {
          if (mounted) {
            const aggregated: any[] = [];
            let anySuccess = false;
            const errors: string[] = [];

            results.forEach(res => {
              if (res.status === 'fulfilled' && res.value) {
                aggregated.push(res.value);
                anySuccess = true;
              } else if (res.status === 'rejected') {
                const errorMsg = res.reason?.response?.data?.message || res.reason?.message || 'Failed to fetch analytics.';
                errors.push(errorMsg);
              }
            });

            if (!anySuccess) {
              const uniqueErrors = Array.from(new Set(errors));
              setAnalyticsError(
                uniqueErrors.length > 0
                  ? uniqueErrors.join('\n')
                  : 'Unable to fetch analytics from Meta. Please check your account connections.'
              );
            } else {
              setAnalytics(aggregated);
            }
          }
        })
        .finally(() => {
          if (mounted) { setLoadingAnalytics(false); }
        });
    }
    return () => {
      mounted = false;
    };
  }, [post?._id, isPublished, post?.platforms]);

  const platformList = useMemo(() => {
    if (post.publishResults && Array.isArray(post.publishResults) && post.publishResults.some((r: any) => r.success)) {
      return post.publishResults.filter((r: any) => r.success).map((r: any) => r.platform);
    }
    return post.platforms && Array.isArray(post.platforms) ? post.platforms : [];
  }, [post.publishResults, post.platforms]);

  const displayAnalytics = useMemo(() => platformList.map((platformName: string) => {
    const actual = analytics.find(
      (a: any) =>
        (a.platform || '').toLowerCase() === platformName.toLowerCase(),
    );
    if (actual) { return actual; }
    return {
      platform: platformName,
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      impressions: 0,
    };
  }), [platformList, analytics]);

  const maxEngagement = useMemo(() => {
    let max = 1;
    displayAnalytics.forEach((a: any) => {
      const total = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
      if (total > max) { max = total; }
    });
    return max;
  }, [displayAnalytics]);

  const platformData = useMemo(() => displayAnalytics.map((a: any) => {
    const totalEngagement =
      (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
    return {
      name: a.platform,
      height: Math.max((totalEngagement / maxEngagement) * 100, 5),
      color: APP_COLORS.primary,
    };
  }), [displayAnalytics, maxEngagement]);

  const totalEngagementAll = useMemo(() => displayAnalytics.reduce(
    (acc: number, a: any) =>
      acc + (a.likes || 0) + (a.comments || 0) + (a.shares || 0),
    0,
  ), [displayAnalytics]);

  const totalReachAll = useMemo(() => displayAnalytics.reduce(
    (acc: number, a: any) => acc + (a.reach || 0),
    0,
  ), [displayAnalytics]);

  const totalImpressionsAll = useMemo(() => displayAnalytics.reduce(
    (acc: number, a: any) => acc + (a.impressions || 0),
    0,
  ), [displayAnalytics]);

  const growthCurve = useMemo(() => {
    const maxVal = totalImpressionsAll;
    if (maxVal === 0) {
      return {
        path: "M0,140 L400,140",
        fillPath: "M0,140 L400,140 V150 H0 Z",
        dots: []
      };
    }
    const points = [0, maxVal * 0.15, maxVal * 0.45, maxVal * 0.8, maxVal];
    const xStep = 400 / (points.length - 1);
    const coords = points.map((val, i) => ({
      x: i * xStep,
      y: 140 - (val / maxVal) * 120
    }));

    let d = `M${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }

    return { path: d, fillPath: `${d} V150 H0 Z`, dots: coords.slice(1, -1) };
  }, [totalImpressionsAll]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <ArrowLeft size={24} color={APP_COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Media Preview */}
        {mediaUrl ? (
          <TouchableOpacity
            style={[styles.mediaPreview, { overflow: 'hidden' }]}
            activeOpacity={isVideo ? 0.8 : 1}
            onPress={() => {
              if (isVideo) {
                Linking.openURL(mediaUrl).catch(err =>
                  console.error("Couldn't load page", err),
                );
              }
            }}>
            <Image
              source={{ uri: isVideo ? videoThumbnail || mediaUrl : mediaUrl }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
            {isVideo && (
              <View style={styles.videoPlayOverlay}>
                <View style={styles.playButtonCircle}>
                  <Text
                    style={{
                      color: APP_COLORS.primary,
                      fontSize: 24,
                      paddingLeft: 4,
                    }}>
                    ▶
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.noMediaBox}>
            <Text style={styles.noMediaText}>No Media</Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.statusRow}>
            <Text style={styles.label}>STATUS</Text>
            <View
              style={[
                styles.statusBadge,
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
                  styles.statusText,
                  {
                    color: isFailed
                      ? APP_COLORS.error
                      : isScheduled
                        ? APP_COLORS.onSecondaryFixedVariant
                        : APP_COLORS.onSurfaceVariant,
                  },
                ]}>
                {statusStr}
              </Text>
            </View>
          </View>

          {isFailed && (
            <View style={styles.errorBox}>
              <AlertCircle size={20} color={APP_COLORS.error} />
              <View style={{ flex: 1 }}>
                <Text style={styles.errorTitle}>Publishing Failed</Text>
                <Text style={styles.errorDescription}>
                  {post.publishResults?.find((r: any) => !r.success && r.error)?.error || 
                   post.errorReason ||
                   'The server could not publish this post. Please check your account connections or try again later.'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.label}>PLATFORM</Text>
            <Text style={styles.valueText}>
              {post.platforms && Array.isArray(post.platforms)
                ? post.platforms.join(', ')
                : post.platform || 'App'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>TIME</Text>
            <Text style={styles.valueText}>
              {post.time ||
                (post.scheduledTime
                  ? new Date(post.scheduledTime).toLocaleDateString()
                  : post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : 'Just now')}
            </Text>
          </View>
        </View>

        {/* Caption Card */}
        <View style={styles.captionCard}>
          <Text style={styles.label}>CAPTION</Text>
          <Text style={styles.captionText}>{post.caption || post.title || 'No Caption'}</Text>
        </View>

        {/* Analytics Section (Only for Published Posts) */}
        {isPublished && (
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsHeaderBox}>
              <Text style={styles.analyticsPretitle}>PERFORMANCE OVERVIEW</Text>
              <LinearGradient
                colors={[APP_COLORS.primary, '#6c5ce7']} // primary to primary-container approx
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientTitleContainer}>
                <Text style={styles.analyticsTitleText}>Analytics</Text>
              </LinearGradient>
              {analyticsError ? (
                <Text style={[styles.analyticsSubtitle, { color: APP_COLORS.error, marginTop: 8 }]}>
                  {analyticsError}
                </Text>
              ) : (
                <Text style={styles.analyticsSubtitle}>
                  Your content reached{' '}
                  <Text style={styles.analyticsSubtitleHighlight}>
                    {totalReachAll} users
                  </Text>{' '}
                  with {totalImpressionsAll} impressions.
                </Text>
              )
              }
            </View>

            {/* Bento Grid: Top Stats */}
            <View style={styles.bentoGrid}>
              {/* Posts Performance Card */}
              <View style={[styles.bentoCard, styles.bentoCardSpan2]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>Posts Performance</Text>
                    <Text style={styles.cardSubtitle}>
                      Engagement per platform
                    </Text>
                  </View>
                  <View style={styles.iconBox}>
                    <BarChart2 size={20} color={APP_COLORS.primary} />
                  </View>
                </View>

                {/* Simple Bar Chart Visualization */}
                <View style={styles.barChartContainer}>
                  {loadingAnalytics ? (
                    <Animated.View style={[styles.skeletonBlock, { opacity: pulseAnim, height: 100, width: '100%', borderRadius: 8 }]} />
                  ) : analyticsError ? (
                    <View style={styles.errorStateBox}>
                      <AlertCircle size={24} color={APP_COLORS.error} opacity={0.6} />
                      <Text style={styles.errorStateText}>Data unavailable</Text>
                    </View>
                  ) : (
                    <>
                      {platformData.map((data: any, index: number) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.barColumn}
                          onPress={() => {
                            const stat = displayAnalytics.find((a: any) => a.platform === data.name);
                            if (stat) setSelectedPlatform(stat);
                          }}
                        >
                          <View style={styles.barTrack}>
                            <View
                              style={[
                                styles.barFill,
                                {
                                  height: `${data.height}%`,
                                  backgroundColor: data.color,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.barLabel} numberOfLines={1}>
                            {data.name.substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {platformData.length === 0 && (
                        <Text style={styles.noDataText}>No platform data</Text>
                      )}
                    </>
                  )}
                </View>
              </View>

              <View style={styles.bentoRow}>
                {/* Engagement Mini Card */}
                <View style={[styles.bentoCard, styles.bentoMiniCard]}>
                  <View style={styles.miniCardHeader}>
                    <Heart
                      size={20}
                      color={APP_COLORS.tertiary}
                      fill={APP_COLORS.tertiary}
                    />
                    <Text
                      style={[
                        styles.miniCardBadge,
                        { color: APP_COLORS.tertiary },
                      ]}>
                      Latest
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.miniCardLabel}>ENGAGEMENT</Text>
                    {loadingAnalytics ? (
                      <Animated.View style={[styles.skeletonBlock, { opacity: pulseAnim, width: 60, height: 28, marginTop: 4, borderRadius: 4 }]} />
                    ) : analyticsError ? (
                      <Text style={[styles.miniCardValue, { color: APP_COLORS.onSurfaceVariant }]}>-</Text>
                    ) : (
                      <Text style={styles.miniCardValue}>
                        {totalEngagementAll}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Reach Mini Card */}
                <View style={[styles.bentoCard, styles.bentoMiniCard]}>
                  <View style={styles.miniCardHeader}>
                    <TrendingUp size={20} color={APP_COLORS.secondary} />
                    <Text
                      style={[
                        styles.miniCardBadge,
                        { color: APP_COLORS.secondary },
                      ]}>
                      Total
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.miniCardLabel}>REACH</Text>
                    {loadingAnalytics ? (
                      <Animated.View style={[styles.skeletonBlock, { opacity: pulseAnim, width: 60, height: 28, marginTop: 4, borderRadius: 4 }]} />
                    ) : analyticsError ? (
                      <Text style={[styles.miniCardValue, { color: APP_COLORS.onSurfaceVariant }]}>-</Text>
                    ) : (
                      <Text style={styles.miniCardValue}>
                        {totalReachAll}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Audience Insights Section */}
            <View style={styles.audienceSection}>
              <View style={styles.audienceHeader}>
                <Text style={styles.cardTitle}>Audience Growth</Text>
                <View style={styles.audienceDots}>
                  <View
                    style={[styles.dot, { backgroundColor: APP_COLORS.primary }]}
                  />
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: APP_COLORS.surfaceContainerHighest },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.audienceCard}>
                {loadingAnalytics ? (
                  <Animated.View style={[styles.skeletonBlock, { opacity: pulseAnim, width: '100%', height: 250, borderRadius: 28 }]} />
                ) : analyticsError ? (
                  <View style={[styles.chartArea, { height: 250, justifyContent: 'center', alignItems: 'center' }]}>
                    <AlertCircle size={32} color={APP_COLORS.error} opacity={0.6} />
                    <Text style={[styles.errorStateText, { marginTop: 12 }]}>Failed to load audience insight</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.chartArea}>
                      {/* Line Chart Visual */}
                      <View style={styles.svgContainer}>
                        <Svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 400 150"
                          preserveAspectRatio="none">
                          <Defs>
                            <SvgLinearGradient
                              id="lineGrad"
                              x1="0%"
                              y1="0%"
                              x2="0%"
                              y2="100%">
                              <Stop
                                offset="0%"
                                stopColor="#5341cd"
                                stopOpacity="0.2"
                              />
                              <Stop
                                offset="100%"
                                stopColor="#5341cd"
                                stopOpacity="0"
                              />
                            </SvgLinearGradient>
                          </Defs>
                          <Path
                            d={growthCurve.path}
                            fill="none"
                            stroke="#5341cd"
                            strokeLinecap="round"
                            strokeWidth="3"
                          />
                          <Path
                            d={growthCurve.fillPath}
                            fill="url(#lineGrad)"
                          />
                          {/* Dots for points */}
                          {growthCurve.dots.map((dot, index) => (
                            <Circle
                              key={index}
                              cx={dot.x}
                              cy={dot.y}
                              r="4"
                              fill="#ffffff"
                              stroke="#5341cd"
                              strokeWidth="2"
                            />
                          ))}
                        </Svg>
                      </View>
                    </View>

                    {/* Legend / Stats */}
                    <View style={styles.chartLegend}>
                      <View style={styles.legendItem}>
                        <Text style={styles.legendLabel}>TOTAL ACCS</Text>
                        <Text style={styles.legendValue}>
                          {displayAnalytics.length}
                        </Text>
                      </View>
                      <View style={[styles.legendItem, styles.legendItemCenter]}>
                        <Text style={styles.legendLabel}>IMPRESSIONS</Text>
                        <Text style={styles.legendValue}>
                          {totalImpressionsAll}
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <Text style={styles.legendLabel}>REACH</Text>
                        <Text style={styles.legendValue}>{totalReachAll}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Platform Breakdown Section */}
            {loadingAnalytics ? (
              <View style={styles.platformBreakdownSection}>
                <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
                  Platform Breakdown
                </Text>
                <Animated.View style={[styles.skeletonBlock, { opacity: pulseAnim, width: '100%', height: 140, borderRadius: 20, marginBottom: 16 }]} />
                <Animated.View style={[styles.skeletonBlock, { opacity: pulseAnim, width: '100%', height: 140, borderRadius: 20 }]} />
              </View>
            ) : displayAnalytics.length > 0 && (
              <View style={styles.platformBreakdownSection}>
                <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
                  Platform Breakdown
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {displayAnalytics.map((platformStat: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.platformMiniChip}
                      onPress={() => setSelectedPlatform(platformStat)}
                    >
                      <View style={styles.platformChipHeader}>
                        <Text style={styles.platformChipName}>{platformStat.platform}</Text>
                        <Heart size={14} color={APP_COLORS.primary} style={{ marginLeft: 8 }} />
                        <Text style={styles.platformChipValue}>{platformStat.likes || 0}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Threads Replies Section */}
        <ThreadsRepliesSection post={post} platformList={platformList} />

        {/* Action Buttons — show for published/partially-published posts */}
        {!isScheduled && (
          <View style={{ gap: 12 }}>
            {platformList.map((platformName: string) => {
              const platformLower = platformName.toLowerCase();

              const isFb = platformLower === 'facebook';
              const isIg = platformLower === 'instagram';
              const isThreads = platformLower === 'threads';
              const isDeleting = deletingPlatform === platformLower;

              return (
                <TouchableOpacity
                  key={platformName}
                  disabled={isDeleting || !!deletingPlatform || isDeletingAll}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isFb ? '#1877F2' : isIg ? '#E1306C' : isThreads ? '#000000' : APP_COLORS.primary,
                      opacity: (isDeleting || !!deletingPlatform || isDeletingAll) ? 0.6 : 1,
                    }
                  ]}
                  onPress={() => {
                    Alert.alert(
                      `Delete ${platformName} Post`,
                      `Are you sure you want to delete this post from ${platformName}? This cannot be undone.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              setDeletingPlatform(platformLower);
                              if (isFb) {
                                await postsService.deleteFacebook(post._id);
                              } else if (isIg) {
                                await postsService.deleteInstagram(post._id);
                              } else if (isThreads) {
                                await postsService.deleteThreads(post._id);
                              }
                              setDeletingPlatform(null);

                              // Check if we just deleted the LAST platform
                              const remainingPlatforms = platformList.filter((p: string) => p.toLowerCase() !== platformLower);

                              if (remainingPlatforms.length === 0) {
                                // Effectively deleted from everywhere -> remove from DB
                                await api.delete(`/api/v1/posts/${post._id}`);
                                dispatch(removePost(post._id));
                                setSuccessMessage('This post has been permanently removed from your history and all platforms.');
                              } else {
                                setSuccessMessage(`This post has been permanently manually un-published from ${platformName}.`);
                              }

                              setShowSuccessOverlay(true);
                              Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
                                setTimeout(() => {
                                  Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                                    setShowSuccessOverlay(false);
                                    navigation.goBack();
                                  });
                                }, 2500);
                              });
                            } catch (err: any) {
                              setDeletingPlatform(null);
                              const msg = err?.response?.data?.message || err?.message || 'Something went wrong.';
                              Alert.alert('Delete Failed', msg);
                            }
                          },
                        },
                      ],
                    );
                  }}>
                  {isDeleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.actionButtonText}>Delete {platformName} Post</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Delete Everywhere Master Button */}
            <TouchableOpacity
              disabled={isDeletingAll || !!deletingPlatform}
              style={[
                styles.actionButton,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: APP_COLORS.error,
                  opacity: (isDeletingAll || !!deletingPlatform) ? 0.6 : 1,
                  marginTop: 16
                }
              ]}
              onPress={handleDeleteEverywhere}>
              {isDeletingAll ? (
                <ActivityIndicator color={APP_COLORS.error} />
              ) : (
                <>
                  <Trash2 size={20} color={APP_COLORS.error} />
                  <Text style={[styles.actionButtonText, { color: APP_COLORS.error }]}>Delete Post Everywhere</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Success Deletion Overlay */}
      {showSuccessOverlay && (
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, opacity: successOpacity }]}>
          <View style={{ alignItems: 'center', padding: 24, width: '100%' }}>
            <LottieView
              source={require('../LottieAnimations/DeleteMessage.lottie')}
              autoPlay
              loop={false}
              style={{ width: 250, height: 250, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1c1b1b', marginBottom: 8, textAlign: 'center' }}>Deleted Successfully</Text>
            <Text style={{ fontSize: 15, color: '#474554', textAlign: 'center', maxWidth: 280 }}>{successMessage}</Text>
          </View>
        </Animated.View>
      )}

      {/* Platform Analytics Modal */}
      <Modal
        visible={!!selectedPlatform}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPlatform(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedPlatform(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>{selectedPlatform?.platform} Analytics</Text>

                <View style={[styles.platformStatsGrid, { width: '100%', marginBottom: 16 }]}>
                  <View style={styles.platformStatItem}>
                    <Heart size={20} color={APP_COLORS.onSurfaceVariant} />
                    <Text style={styles.platformStatValue}>{selectedPlatform?.likes || 0}</Text>
                    <Text style={styles.platformStatLabel}>Likes</Text>
                  </View>
                  <View style={styles.platformStatItem}>
                    <MessageCircle size={20} color={APP_COLORS.onSurfaceVariant} />
                    <Text style={styles.platformStatValue}>{selectedPlatform?.comments || 0}</Text>
                    <Text style={styles.platformStatLabel}>Comments</Text>
                  </View>
                  <View style={styles.platformStatItem}>
                    <Share2 size={20} color={APP_COLORS.onSurfaceVariant} />
                    <Text style={styles.platformStatValue}>{selectedPlatform?.shares || 0}</Text>
                    <Text style={styles.platformStatLabel}>Shares</Text>
                  </View>
                  <View style={styles.platformStatItem}>
                    <Users size={20} color={APP_COLORS.primary} />
                    <Text style={[styles.platformStatValue, { color: APP_COLORS.primary }]}>
                      {selectedPlatform?.reach || 0}
                    </Text>
                    <Text style={[styles.platformStatLabel, { color: APP_COLORS.primary }]}>Reach</Text>
                  </View>
                  <View style={styles.platformStatItem}>
                    <Eye size={20} color={APP_COLORS.secondary} />
                    <Text style={[styles.platformStatValue, { color: APP_COLORS.secondary }]}>
                      {selectedPlatform?.impressions || 0}
                    </Text>
                    <Text style={[styles.platformStatLabel, { color: APP_COLORS.secondary }]}>Impress.</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedPlatform(null)}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const ThreadsRepliesSection = React.memo(({ post, platformList }: { post: any, platformList: any[] }) => {
  const [threadsReplies, setThreadsReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');

  const isPublished = (post.status || '').toUpperCase().includes('PUBLISHED') || post.status === 'SUCCESS';
  const hasThreads = useMemo(() => platformList.map((p: string) => p.toLowerCase()).includes('threads'), [platformList]);

  const threadsMediaId = useMemo(() => {
    const res = post?.publishResults?.find((r: any) => r.platform?.toLowerCase() === 'threads' && r.success);
    return res?.platformPostId || post?.platformPostId || null;
  }, [post]);

  useEffect(() => {
    let mounted = true;
    if (isPublished && hasThreads && threadsMediaId) {
      setLoadingReplies(true);
      threadsService.getReplies(threadsMediaId)
        .then(res => {
          if (mounted) setThreadsReplies(res?.data || []);
        })
        .catch(err => console.log('Replies error', err))
        .finally(() => {
          if (mounted) setLoadingReplies(false);
        });
    }
    return () => { mounted = false; };
  }, [isPublished, hasThreads, threadsMediaId]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !threadsMediaId) return;
    try {
      await threadsService.replyToPost(threadsMediaId, replyText);
      setThreadsReplies(prev => [{ text: replyText, timestamp: new Date().toISOString(), _id: Math.random().toString() }, ...prev]);
      setReplyText('');
      Alert.alert('Success', 'Reply sent to Threads!');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to reply');
    }
  };

  if (!isPublished || !hasThreads) return null;

  return (
    <View style={localStyles.repliesCard}>
      <Text style={[localStyles.cardTitleTheme, { marginBottom: 4 }]}>Threads Replies</Text>
      {!threadsMediaId && (
        <Text style={localStyles.emptyRepliesText}>Analytics post ID missing.</Text>
      )}
      <View style={localStyles.replyInputContainer}>
        <TextInput
          style={localStyles.replyInput}
          placeholder="Reply to this thread..."
          value={replyText}
          onChangeText={setReplyText}
          placeholderTextColor={APP_COLORS.outlineVariant}
        />
        <TouchableOpacity style={localStyles.replyButton} onPress={handleSendReply}>
          <MessageCircle size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      {loadingReplies ? (
        <ActivityIndicator size="small" color={APP_COLORS.primary} style={{ marginTop: 16 }} />
      ) : threadsReplies.length === 0 ? (
        <Text style={localStyles.emptyRepliesText}>No replies yet.</Text>
      ) : (
        threadsReplies.map((reply: any, idx: number) => (
          <View key={idx} style={localStyles.replyItem}>
            <View style={localStyles.replyAvatar} />
            <View style={localStyles.replyContent}>
              <Text style={localStyles.replyText} numberOfLines={0}>{reply.text}</Text>
              <Text style={localStyles.replyTime}>{new Date(reply.timestamp).toLocaleString()}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
});

const localStyles = StyleSheet.create({
  repliesCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 32,
  },
  replyInputContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 20,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 48,
    color: APP_COLORS.onSurface,
  },
  replyButton: {
    backgroundColor: APP_COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRepliesText: {
    color: APP_COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginVertical: 12,
  },
  replyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.outlineVariant,
    gap: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
  },
  replyContent: {
    flex: 1,
  },
  replyText: {
    fontSize: 14,
    color: APP_COLORS.onSurface,
    lineHeight: 20,
    marginBottom: 4,
  },
  replyTime: {
    fontSize: 11,
    color: APP_COLORS.onSurfaceVariant,
  },
  cardTitleTheme: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 196, 215, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  mediaPreview: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: APP_COLORS.surfaceContainerLowest,
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMediaBox: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.2)',
    borderStyle: 'dashed',
  },
  noMediaText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.onSurfaceVariant,
  },
  infoCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: APP_COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 196, 215, 0.2)',
    paddingTop: 16,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.onSurface,
    textTransform: 'capitalize',
  },
  captionCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.1)',
  },
  captionText: {
    fontSize: 16,
    lineHeight: 24,
    color: APP_COLORS.onSurface,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.onPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(178, 0, 75, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(178, 0, 75, 0.1)',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.error,
    marginBottom: 4,
  },
  errorDescription: {
    fontSize: 13,
    color: APP_COLORS.error,
    opacity: 0.9,
    lineHeight: 18,
  },
  analyticsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  analyticsHeaderBox: {
    marginBottom: 32,
  },
  analyticsPretitle: {
    color: APP_COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  gradientTitleContainer: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    borderRadius: 8,
    // Note: To get the actual gradient text, we'd need @react-native-community/masked-view
    // For now, we'll use block gradient or just solid text to avoid more dependencies if not strictly needed
  },
  analyticsTitleText: {
    fontSize: 40,
    fontWeight: '800',
    color: APP_COLORS.onPrimary, // if using background gradient
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  analyticsSubtitle: {
    color: APP_COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: '80%',
  },
  analyticsSubtitleHighlight: {
    color: APP_COLORS.secondary,
    fontWeight: '600',
  },
  bentoGrid: {
    gap: 16,
    marginBottom: 32,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bentoCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  bentoCardSpan2: {
    width: '100%',
  },
  bentoMiniCard: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceContainerLow,
    shadowOpacity: 0,
    elevation: 0,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  cardSubtitle: {
    fontSize: 14,
    color: APP_COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  iconBox: {
    backgroundColor: 'rgba(83, 65, 205, 0.1)',
    padding: 8,
    borderRadius: 12,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: 16,
    gap: 12,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    width: '100%',
    height: 100,
    backgroundColor: APP_COLORS.surfaceContainerLow,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: APP_COLORS.outlineVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noDataText: {
    color: APP_COLORS.onSurfaceVariant,
    fontSize: 14,
    alignSelf: 'center',
    flex: 1,
    textAlign: 'center',
  },
  miniCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  miniCardBadge: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: APP_COLORS.outlineVariant,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  miniCardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
  },
  audienceSection: {
    marginBottom: 40,
  },
  audienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  audienceDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  audienceCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  chartArea: {
    padding: 24,
    height: 200,
  },
  svgContainer: {
    flex: 1,
    width: '100%',
  },
  chartLegend: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 196, 215, 0.2)',
  },
  legendItem: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  legendItemCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.2)',
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: APP_COLORS.outlineVariant,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  platformBreakdownSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  platformCard: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.1)',
  },
  platformCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.surfaceContainerHighest,
  },
  platformNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    textTransform: 'capitalize',
  },
  platformStatusBadge: {
    backgroundColor: APP_COLORS.secondaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  platformStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: APP_COLORS.onSecondaryFixedVariant,
    textTransform: 'uppercase',
  },
  platformStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  platformStatItem: {
    alignItems: 'center',
    width: '18%', // Roughly 5 items across
    gap: 4,
  },
  platformStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginTop: 4,
  },
  platformStatLabel: {
    fontSize: 10,
    color: APP_COLORS.onSurfaceVariant,
  },
  skeletonBlock: {
    backgroundColor: APP_COLORS.surfaceContainerHighest,
  },
  errorStateBox: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  errorStateText: {
    fontSize: 13,
    color: APP_COLORS.onSurfaceVariant,
    fontWeight: '600'
  },
  platformMiniChip: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformChipName: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.onSurface,
    textTransform: 'capitalize',
  },
  platformChipValue: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: APP_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: APP_COLORS.outlineVariant,
    borderRadius: 2,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  modalCloseButton: {
    marginTop: 32,
    width: '100%',
    paddingVertical: 14,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
