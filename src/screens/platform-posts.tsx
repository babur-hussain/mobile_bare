import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ExternalLink, Image as ImageIcon, Video, AlignLeft, BarChart2, Heart, MessageCircle, Share2, X as XIcon, Eye } from 'lucide-react-native';
import api from '../services/api';

const APP_COLORS = {
  primary: '#5341cd',
  surface: '#fcf9f8',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#474554',
  outlineVariant: '#c8c4d7',
  error: '#ba1a1a',
  surfaceContainerLow: '#f6f3f2',
};

export default function PlatformPostsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const { accountId, platform, accountName } = route.params || {};

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics Modal State
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalytics = async (postId: string) => {
    setAnalytics(null);
    setAnalyticsError(null);
    setAnalyticsLoading(true);
    try {
      const response = await api.get(`/api/v1/posts/platform/${accountId}/analytics/${postId}`);
      setAnalytics(response.data.data);
    } catch (err: any) {
      console.error(err);
      setAnalyticsError(err?.response?.data?.message || 'Could not load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const openAnalytics = (post: any) => {
    setSelectedPost(post);
    fetchAnalytics(post.id);
  };

  const fetchPosts = async (isLoadMore = false) => {
    if ((isLoadMore && !hasNext) || loading || (isLoadMore && loadingMore)) return;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const url = `/api/v1/posts/platform/${accountId}?limit=10${isLoadMore && cursor ? `&cursor=${cursor}` : ''}`;
      const response = await api.get(url);
      
      const payload = response.data.data || {};
      const newPosts = payload.data || [];
      const paging = payload.paging || {};
      
      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setCursor(paging.nextCursor || null);
      setHasNext(paging.hasNext || false);
    } catch (err: any) {
      console.error(err);
      if (!isLoadMore) {
        setError(err?.response?.data?.message || err.message || 'Failed to fetch posts');
      }
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchPosts();
    }
  }, [accountId]);

  const renderItem = ({ item }: { item: any }) => {
    const isImage = item.mediaType === 'IMAGE' || item.mediaType === 'CAROUSEL_ALBUM';
    const isVideo = item.mediaType === 'VIDEO' || item.mediaType === 'REELS';

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8} 
        onPress={() => openAnalytics(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.timestamp}>
            {item.timestamp ? new Date(item.timestamp).toLocaleString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }) : 'Unknown Date'}
          </Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => item.permalink && Linking.openURL(item.permalink)}>
            <ExternalLink size={16} color={APP_COLORS.primary} />
            <Text style={styles.linkText}>View Original</Text>
          </TouchableOpacity>
        </View>

        {(item.mediaUrl || item.thumbnailUrl) && (
          <View style={styles.mediaContainer}>
            <Image 
              source={{ uri: item.thumbnailUrl || item.mediaUrl }} 
              style={styles.media} 
              resizeMode="cover" 
            />
            {isVideo && (
              <View style={styles.mediaIconOverlay}>
                <Video size={24} color="#fff" />
              </View>
            )}
            {isImage && (
              <View style={styles.mediaIconOverlay}>
                <ImageIcon size={24} color="#fff" />
              </View>
            )}
          </View>
        )}

        {item.text ? (
          <Text style={styles.caption} numberOfLines={4}>
            {item.text}
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.5, marginTop: 8 }}>
            <AlignLeft size={16} color={APP_COLORS.onSurfaceVariant} style={{ marginRight: 6 }} />
            <Text style={{ color: APP_COLORS.onSurfaceVariant, fontSize: 13, fontStyle: 'italic' }}>No caption</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={APP_COLORS.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>Lifetime Posts</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{accountName} • {platform}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={APP_COLORS.primary} />
            <Text style={{ marginTop: 12, color: APP_COLORS.onSurfaceVariant }}>Fetching posts...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: APP_COLORS.error, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts()}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onEndReached={() => fetchPosts(true)}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={{ color: APP_COLORS.onSurfaceVariant }}>No posts found for this account.</Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={APP_COLORS.primary} />
                </View>
              ) : hasNext && posts.length > 0 ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <TouchableOpacity 
                    style={styles.fetchMoreBtn}
                    onPress={() => fetchPosts(true)}>
                    <Text style={{ color: APP_COLORS.primary, fontWeight: '600' }}>Fetch 10 More</Text>
                  </TouchableOpacity>
                </View>
              ) : posts.length > 0 ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Text style={{ color: APP_COLORS.outlineVariant, fontSize: 13 }}>End of history</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Analytics Modal */}
      <Modal
        visible={!!selectedPost}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <BarChart2 size={20} color={APP_COLORS.primary} />
                <Text style={styles.modalTitle}>Post Analytics</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPost(null)} style={{ padding: 4 }}>
                <XIcon size={24} color={APP_COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            
            {analyticsLoading ? (
              <View style={styles.modalCenter}>
                <ActivityIndicator size="large" color={APP_COLORS.primary} />
                <Text style={{ marginTop: 12, color: APP_COLORS.onSurfaceVariant }}>Loading insights...</Text>
              </View>
            ) : analyticsError ? (
              <View style={styles.modalCenter}>
                <Text style={{ color: APP_COLORS.error, textAlign: 'center', marginBottom: 16 }}>{analyticsError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchAnalytics(selectedPost?.id)}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : analytics ? (
              <View style={styles.analyticsGrid}>
                <View style={styles.analyticStatBox}>
                   <Heart size={24} color="#e74c3c" />
                   <Text style={styles.statValue}>{analytics.likes.toLocaleString()}</Text>
                   <Text style={styles.statLabel}>Likes</Text>
                </View>
                <View style={styles.analyticStatBox}>
                   <MessageCircle size={24} color="#3498db" />
                   <Text style={styles.statValue}>{analytics.comments.toLocaleString()}</Text>
                   <Text style={styles.statLabel}>Comments</Text>
                </View>
                <View style={styles.analyticStatBox}>
                   <Share2 size={24} color="#f39c12" />
                   <Text style={styles.statValue}>{analytics.shares.toLocaleString()}</Text>
                   <Text style={styles.statLabel}>Shares</Text>
                </View>
                <View style={styles.analyticStatBox}>
                   <Eye size={24} color="#9b59b6" />
                   <Text style={styles.statValue}>{analytics.reach.toLocaleString()}</Text>
                   <Text style={styles.statLabel}>Reach</Text>
                </View>
              </View>
            ) : null}
            
            <View style={{ marginTop: 24 }}>
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setSelectedPost(null)}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.surfaceContainerLow,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  headerSubtitle: {
    fontSize: 13,
    color: APP_COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  retryButton: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.surfaceContainerLow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: APP_COLORS.onSurfaceVariant,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.primary,
    marginLeft: 6,
  },
  mediaContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: APP_COLORS.surfaceContainerLow,
    marginBottom: 12,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaIconOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 8,
  },
  caption: {
    fontSize: 14,
    color: APP_COLORS.onSurface,
    lineHeight: 20,
  },
  fetchMoreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: APP_COLORS.surfaceContainerLow,
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
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginLeft: 8,
  },
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  analyticStatBox: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.surfaceContainerLow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 13,
    color: APP_COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  closeBtn: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  }
});
