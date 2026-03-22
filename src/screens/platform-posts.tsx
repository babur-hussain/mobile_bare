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
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ExternalLink, Image as ImageIcon, Video, AlignLeft, BarChart2, Heart, MessageCircle, Share2, X as XIcon, Eye, AtSign, CornerUpLeft, ArrowUp } from 'lucide-react-native';
import api from '../services/api';
import { threadsService } from '../services/threads.service';
import { instagramService } from '../services/instagram.service';
import { facebookService } from '../services/facebook.service';

const APP_COLORS = {
  primary: '#5341cd',
  surface: '#fcf9f8',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#474554',
  outlineVariant: '#c8c4d7',
  error: '#ba1a1a',
  surfaceContainerLow: '#f6f3f2',
};

const { width } = Dimensions.get('window');
const TILE_SIZE = width / 3;

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

  // Replies Modal State
  const [postReplies, setPostReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());

  const handleSendReply = async () => {
    const targetId = replyTargetId || selectedPost?.id;
    if (!replyText.trim() || !targetId) return;
    const sentText = replyText;
    
    setReplyText('');
    setReplyTargetId(null);
    setPostReplies(prev => [{ text: sentText, timestamp: new Date().toISOString(), id: Math.random().toString(), username: 'You' }, ...prev]);

    try {
      if (platform?.toLowerCase() === 'threads') {
        await threadsService.replyToPost(targetId, sentText);
      } else if (platform?.toLowerCase() === 'instagram') {
        await instagramService.replyToComment(accountId, targetId, sentText);
      } else if (platform?.toLowerCase() === 'facebook') {
        await facebookService.replyToComment(accountId, targetId, sentText);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to reply');
    }
  };

  const toggleLikeReply = (replyId: string) => {
    setLikedReplies(prev => {
      const next = new Set(prev);
      if (next.has(replyId)) next.delete(replyId);
      else next.add(replyId);
      return next;
    });
  };

  const handlePressReply = (item: any) => {
    setReplyTargetId(item.id);
  };

  const fetchReplies = async (postId: string) => {
    try {
      setLoadingReplies(true);
      if (platform?.toLowerCase() === 'threads') {
        const responseData = await threadsService.getReplies(postId);
        setPostReplies(responseData?.data || []);
      } else if (platform?.toLowerCase() === 'instagram') {
        const responseData = await instagramService.getComments(accountId, postId);
        setPostReplies(responseData?.data || []);
      } else if (platform?.toLowerCase() === 'facebook') {
        const responseData = await facebookService.getComments(accountId, postId);
        setPostReplies(responseData?.data || []);
      }
    } catch (err: any) {
      Alert.alert('Fetch Error', err?.response?.data?.message || err?.message || 'Failed to fetch replies');
    } finally {
      setLoadingReplies(false);
    }
  };

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
    if (['threads', 'instagram', 'facebook'].includes(platform?.toLowerCase())) {
      fetchReplies(post.id);
    }
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
    const hasMedia = !!(item.mediaUrl || item.thumbnailUrl);

    return (
      <TouchableOpacity 
        style={[styles.tile, { width: TILE_SIZE, height: TILE_SIZE }]} 
        activeOpacity={0.8} 
        onPress={() => openAnalytics(item)}>

        {hasMedia ? (
          <Image 
            source={{ uri: item.thumbnailUrl || item.mediaUrl }} 
            style={styles.tileImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.textTile}>
            {item.text ? (
              <Text style={styles.textTileCaption} numberOfLines={4}>{item.text}</Text>
            ) : (
              <AlignLeft size={24} color={APP_COLORS.outlineVariant} />
            )}
          </View>
        )}

        {isVideo && (
          <View style={styles.tileIconOverlay}>
            <Video size={16} color="#fff" />
          </View>
        )}
        
        {item.mediaType === 'CAROUSEL_ALBUM' && (
          <View style={styles.tileIconOverlay}>
            <ImageIcon size={16} color="#fff" />
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
            numColumns={3}
            contentContainerStyle={styles.gridContent}
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
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

            <View style={{ flex: 1 }}>
              <FlatList
                data={['threads', 'instagram', 'facebook'].includes(platform?.toLowerCase()) ? postReplies : []}
                keyExtractor={(r, idx) => r.id || idx.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
                ListHeaderComponent={
                  <View style={{ paddingBottom: 16 }}>
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

                     {selectedPost && ['threads', 'instagram', 'facebook'].includes(platform?.toLowerCase()) && (
                      <View style={[styles.repliesHeader, { marginTop: 24 }]}>
                        <MessageCircle size={16} color={APP_COLORS.onSurfaceVariant} />
                        <Text style={styles.repliesTitle}>
                          {platform?.toLowerCase() === 'threads' ? 'Threads Replies' : platform?.toLowerCase() === 'instagram' ? 'Instagram Comments' : 'Facebook Comments'}
                        </Text>
                      </View>
                    )}
                    
                    {selectedPost && ['threads', 'instagram', 'facebook'].includes(platform?.toLowerCase()) && loadingReplies && (
                      <View style={{ padding: 24, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={APP_COLORS.primary} />
                        <Text style={{ marginTop: 8, fontSize: 13, color: APP_COLORS.onSurfaceVariant }}>Loading {platform?.toLowerCase() === 'threads' ? 'replies' : 'comments'}...</Text>
                      </View>
                    )}
                    {selectedPost && ['threads', 'instagram', 'facebook'].includes(platform?.toLowerCase()) && !loadingReplies && postReplies.length === 0 && (
                      <View style={{ padding: 24, alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: APP_COLORS.onSurfaceVariant }}>No {platform?.toLowerCase() === 'threads' ? 'replies' : 'comments'} to show.</Text>
                      </View>
                    )}
                  </View>
                }
                renderItem={({ item, index }) => (
                  <View style={[styles.replyItem, index === postReplies.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.replyAvatar}>
                      {item.username ? (
                        <Image source={{ uri: `https://ui-avatars.com/api/?name=${item.username}&background=random` }} style={styles.replyAvatarImg} />
                      ) : (
                        <AtSign size={16} color="#fff" />
                      )}
                    </View>
                    <View style={styles.replyContent}>
                      {item.username && <Text style={styles.replyUsername}>{item.username}</Text>}
                      <Text style={styles.replyText}>{item.text}</Text>
                      <View style={styles.replyActionsRow}>
                        <Text style={styles.replyTime}>{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                        {item.id && (
                          <TouchableOpacity onPress={() => handlePressReply(item)}>
                            <Text style={styles.replyActionText}>Reply</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <View style={styles.replyFarRight}>
                      <TouchableOpacity onPress={() => toggleLikeReply(item.id || index.toString())}>
                         <Heart size={14} color={likedReplies.has(item.id || index.toString()) ? '#e74c3c' : APP_COLORS.outlineVariant} fill={likedReplies.has(item.id || index.toString()) ? '#e74c3c' : 'transparent'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>

            {selectedPost && ['threads', 'instagram', 'facebook'].includes(platform?.toLowerCase()) && (
              <View style={styles.replyInputContainer}>
                {replyTargetId && (
                  <View style={styles.replyingToBanner}>
                    <Text style={styles.replyingToText}>
                      Replying to {postReplies.find(r => r.id === replyTargetId)?.username || 'comment'}
                    </Text>
                    <TouchableOpacity onPress={() => { setReplyTargetId(null); setReplyText(''); }}>
                       <XIcon size={14} color={APP_COLORS.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.replyInputRow}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Add a reply..."
                    value={replyText}
                    onChangeText={setReplyText}
                    placeholderTextColor={APP_COLORS.outlineVariant}
                  />
                  <TouchableOpacity style={styles.replyInputButton} onPress={handleSendReply}>
                    <ArrowUp size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setSelectedPost(null)}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
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
  gridContent: {
    paddingBottom: 40,
  },
  tile: {
    borderWidth: 0.5,
    borderColor: APP_COLORS.surface,
    backgroundColor: APP_COLORS.surfaceContainerLow,
    position: 'relative',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  textTile: {
    width: '100%',
    height: '100%',
    padding: 8,
    backgroundColor: APP_COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTileCaption: {
    fontSize: 10,
    color: APP_COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 14,
  },
  tileIconOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 6,
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
    height: '90%',
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
  repliesContainer: {
    marginTop: 24,
    backgroundColor: APP_COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.outlineVariant,
    paddingBottom: 12,
  },
  repliesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: APP_COLORS.onSurface,
    marginLeft: 8,
  },
  replyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.outlineVariant,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  replyAvatarImg: {
    width: '100%',
    height: '100%',
  },
  replyContent: {
    flex: 1,
    paddingRight: 8,
  },
  replyUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 14,
    color: APP_COLORS.onSurface,
    lineHeight: 20,
    marginBottom: 4,
  },
  replyTime: {
    fontSize: 12,
    color: APP_COLORS.onSurfaceVariant,
  },
  replyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 12,
  },
  replyActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.onSurfaceVariant,
  },
  replyFarRight: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    paddingLeft: 8,
  },
  replyInputContainer: {
    paddingTop: 8,
    flexDirection: 'column',
    gap: 8,
    backgroundColor: APP_COLORS.surface,
    paddingBottom: 8,
  },
  replyingToBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: APP_COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  replyInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    fontSize: 14,
    color: APP_COLORS.onSurface,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
  },
  replyInputButton: {
    backgroundColor: APP_COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  }
});
