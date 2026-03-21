import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MessageCircle, Search } from 'lucide-react-native';
import { APP_COLORS } from '../../constants/colors';
import { messagesService, Conversation, PlatformType } from '../../services/messages.service';
import { socketService } from '../../services/socket.service';

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    let h = d.getHours();
    let m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const minStr = m < 10 ? '0' + m : m.toString();
    return `${h}:${minStr} ${ampm}`;
  } catch (e) {
    return '';
  }
}

export default function MessagesScreen() {
  const navigation = useNavigation<any>();
  const [platform, setPlatform] = useState<PlatformType>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fetchConversations = async (p: PlatformType = platform) => {
    setLoading(true);
    setErrorText(null);
    try {
      const data = await messagesService.getConversations(p);
      setConversations(data);
    } catch (error: any) {
      console.error(error);
      setErrorText(error?.response?.data?.message || 'Failed to fetch messages. Please reconnect your accounts with message permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    socketService.connect();
  }, [platform]);

  useEffect(() => {
    // Register connected accounts with socket
    conversations.forEach(c => socketService.registerAccount(c.accountId));
  }, [conversations]);

  useEffect(() => {
    const handleNewMessage = (msg: any) => {
      setConversations(prev => {
        // We match senderId or recipientId to know if it belongs to this conversation
        const targetIdx = prev.findIndex(c =>
          c.accountId === msg.accountId &&
          (c.recipientId === msg.senderId || c.recipientId === msg.recipientId)
        );

        if (targetIdx === -1) {
          // If conversation not in list, refetch
          fetchConversations();
          return prev;
        }

        const newArr = [...prev];
        const updatedTarget = { ...newArr[targetIdx] };
        updatedTarget.lastMessage = msg.text;
        updatedTarget.timestamp = new Date().toISOString();
        // If it was sent by someone else, increase unread count
        if (msg.senderId !== msg.accountId) {
          updatedTarget.unreadCount += 1;
        }

        newArr[targetIdx] = updatedTarget;
        // Move to front
        return newArr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      });
    };

    socketService.onNewMessage(handleNewMessage);
    return () => socketService.offNewMessage(handleNewMessage);
  }, []);

  const renderPlatformIcon = (plat: PlatformType) => {
    // Simplified: in a real app, use specific icons for IG/FB/Threads
    switch (plat) {
      case 'instagram': return <Text style={{ fontSize: 12 }}>📷</Text>;
      case 'facebook': return <Text style={{ fontSize: 12 }}>📘</Text>;
      case 'threads': return <Text style={{ fontSize: 12 }}>🧵</Text>;
      default: return null;
    }
  };

  // COMING SOON OVERRIDE
  // Temporarily showing "Coming Soon" without deleting the original code.
  // Set to false to re-enable the full inbox feature.
  const isComingSoon = true;
  if (isComingSoon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inbox</Text>
        </View>
        <View style={[styles.emptyState, { marginTop: 0 }]}>
          <MessageCircle size={64} color={APP_COLORS.outlineVariant} style={{ marginBottom: 24, opacity: 0.5 }} />
          <Text style={styles.emptyTextTitle}>Coming Soon</Text>
          <Text style={[styles.emptyTextSub, { paddingHorizontal: 32 }]}>
            We are working hard to bring you a unified inbox for all your platforms.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // eslint-disable-next-line no-unreachable
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Search size={22} color={APP_COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Platform Selector */}
      <View style={{ marginBottom: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.platformsContainer}>
          {(['all', 'threads', 'instagram', 'facebook'] as PlatformType[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.platformPill, platform === p && styles.activePlatformPill]}
              onPress={() => setPlatform(p)}>
              <Text style={[styles.platformPillText, platform === p && styles.activePlatformPillText]}>
                {p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conversation List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchConversations()} />
        }>
        {loading && conversations.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={APP_COLORS.primary} />
        ) : errorText ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={APP_COLORS.error} style={{ opacity: 0.8, marginBottom: 16 }} />
            <Text style={styles.emptyTextTitle}>Connection Error</Text>
            <Text style={[styles.emptyTextSub, { paddingHorizontal: 20 }]}>{errorText}</Text>
          </View>
        ) : platform === 'threads' ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={APP_COLORS.outlineVariant} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Text style={styles.emptyTextTitle}>Threads API Limitation</Text>
            <Text style={styles.emptyTextSub}>The official Meta Threads API currently does not support Direct Messages.</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={APP_COLORS.outlineVariant} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTextTitle}>No Messages</Text>
            <Text style={styles.emptyTextSub}>You have no conversations on {platform === 'all' ? 'any platform' : platform}.</Text>
          </View>
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              style={[styles.conversationCard, conv.unreadCount > 0 && styles.unreadCard]}
              onPress={() => navigation.navigate('ChatScreen', {
                conversationId: conv.id,
                platform: conv.platform,
                accountId: conv.accountId,
                recipientId: conv.recipientId
              })}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: conv.userAvatar }} style={styles.avatar} />
                <View style={styles.platformBadge}>
                  {renderPlatformIcon(conv.platform)}
                </View>
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.rowTop}>
                  <Text style={[styles.userName, conv.unreadCount > 0 && styles.unreadText]}>{conv.userName}</Text>
                  <Text style={styles.timeText}>
                    {formatTime(conv.timestamp)}
                  </Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text style={[styles.lastMessage, conv.unreadCount > 0 && styles.unreadText]} numberOfLines={1}>
                    {conv.lastMessage}
                  </Text>
                  {conv.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
  },
  iconButton: {
    padding: 8,
  },
  platformsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  platformPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
  },
  activePlatformPill: {
    backgroundColor: APP_COLORS.primary,
  },
  platformPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.onSurfaceVariant,
  },
  activePlatformPillText: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // accommodate bottom tab
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: '#f8faff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
  },
  platformBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  contentContainer: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.onSurface,
  },
  unreadText: {
    fontWeight: '800',
  },
  timeText: {
    fontSize: 12,
    color: APP_COLORS.onSurfaceVariant,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: APP_COLORS.onSurfaceVariant,
    flex: 1,
    paddingRight: 8,
  },
  unreadBadge: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginBottom: 8,
  },
  emptyTextSub: {
    fontSize: 14,
    color: APP_COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
});
