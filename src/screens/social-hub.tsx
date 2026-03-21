import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Search,
  AtSign,
  UserCheck,
  MessageCircle,
  ExternalLink,
} from 'lucide-react-native';
import { threadsService } from '../services/threads.service';
import { APP_COLORS } from '../constants/colors';

type TabType = 'mentions' | 'search' | 'discovery';
type PlatformType = 'all' | 'threads' | 'instagram' | 'facebook';

export default function SocialHub() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('mentions');
  const [platform, setPlatform] = useState<PlatformType>('all');

  // State for each tab
  const [mentions, setMentions] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [discoveryProfile, setDiscoveryProfile] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries
  const [searchQuery, setSearchQuery] = useState('');
  const [usernameQuery, setUsernameQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'mentions') {
      fetchMentions();
    }
  }, [activeTab, platform]);

  const fetchMentions = async () => {
    setLoading(true);
    setError(null);
    try {
      if (platform === 'instagram' || platform === 'facebook') {
        setMentions([]);
        return;
      }
      const data = await threadsService.getMentions();
      setMentions(data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch mentions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (platform === 'instagram' || platform === 'facebook') {
        setSearchResults([]);
        return;
      }
      const data = await threadsService.searchThreads(searchQuery.trim());
      setSearchResults(data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to search threads');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscovery = async () => {
    if (!usernameQuery.trim()) return;
    setLoading(true);
    setError(null);
    setDiscoveryProfile(null);
    try {
      if (platform === 'instagram' || platform === 'facebook') {
        return;
      }
      const data = await threadsService.discoverProfile(usernameQuery.trim());
      setDiscoveryProfile(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to discover profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={APP_COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Platform Selector */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.platformsContainer}>
          {(['all', 'threads', 'instagram', 'facebook'] as PlatformType[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.platformPill, platform === p && styles.activePlatformPill]}
              onPress={() => {
                setPlatform(p);
                // Clear state when switching to FB/IG
                if (p === 'instagram' || p === 'facebook') {
                  setMentions([]);
                  setSearchResults([]);
                  setDiscoveryProfile(null);
                } else if (activeTab === 'mentions') {
                  fetchMentions(); // Re-fetch mentions if switching back to 'all' or 'threads'
                }
              }}>
              <Text style={[styles.platformPillText, platform === p && styles.activePlatformPillText]}>
                {p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mentions' && styles.activeTab]}
          onPress={() => setActiveTab('mentions')}>
          <AtSign size={16} color={activeTab === 'mentions' ? APP_COLORS.primary : APP_COLORS.onSurfaceVariant} />
          <Text style={[styles.tabText, activeTab === 'mentions' && styles.activeTabText]}>Mentions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}>
          <Search size={16} color={activeTab === 'search' ? APP_COLORS.primary : APP_COLORS.onSurfaceVariant} />
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discovery' && styles.activeTab]}
          onPress={() => setActiveTab('discovery')}>
          <UserCheck size={16} color={activeTab === 'discovery' ? APP_COLORS.primary : APP_COLORS.onSurfaceVariant} />
          <Text style={[styles.tabText, activeTab === 'discovery' && styles.activeTabText]}>Discovery</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'mentions' && (
          <View>
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>Recent conversations mentioning your connected account.</Text>
            </View>
            {loading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color={APP_COLORS.primary} />
            ) : mentions.length === 0 ? (
              <Text style={styles.emptyText}>No mentions found.</Text>
            ) : (
              mentions.map((mention, idx) => (
                <View key={idx} style={styles.itemCard}>
                  <MessageCircle size={20} color={APP_COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={styles.itemCardContent}>
                    <Text style={styles.itemText}>{mention.text}</Text>
                    <Text style={styles.timeText}>{new Date(mention.timestamp).toLocaleString()}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'search' && (
          <View>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Threads keywords..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Search size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color={APP_COLORS.primary} />
            ) : searchResults.length === 0 ? (
              <Text style={styles.emptyText}>Enter keywords to explore Threads.</Text>
            ) : (
              searchResults.map((result, idx) => (
                <View key={idx} style={styles.itemCard}>
                  <Search size={20} color={APP_COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={styles.itemCardContent}>
                    <Text style={styles.itemText}>{result.text}</Text>
                    <Text style={styles.timeText}>{new Date(result.timestamp).toLocaleString()}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'discovery' && (
          <View>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter exact username..."
                value={usernameQuery}
                onChangeText={setUsernameQuery}
                onSubmitEditing={handleDiscovery}
                returnKeyType="search"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleDiscovery}>
                <Search size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color={APP_COLORS.primary} />
            ) : discoveryProfile ? (
              <View style={styles.profileCard}>
                <Image
                  source={{ uri: discoveryProfile.profile_picture_url || 'https://via.placeholder.com/150' }}
                  style={styles.profileImage}
                />
                <Text style={styles.profileName}>{discoveryProfile.name || discoveryProfile.username}</Text>
                <Text style={styles.profileUsername}>@{discoveryProfile.username}</Text>
                {discoveryProfile.biography ? (
                  <Text style={styles.profileBio}>{discoveryProfile.biography}</Text>
                ) : null}
                <View style={styles.profileStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{discoveryProfile.followers_count || 0}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>Search for a profile to see details.</Text>
            )}
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.outlineVariant,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  platformsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  platformPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activePlatformPill: {
    backgroundColor: APP_COLORS.primaryContainer,
    borderColor: APP_COLORS.primary,
  },
  platformPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.onSurfaceVariant,
  },
  activePlatformPillText: {
    color: APP_COLORS.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#ece9fc', // Light primary tint
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.onSurfaceVariant,
  },
  activeTabText: {
    color: APP_COLORS.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  infoBanner: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    color: APP_COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: APP_COLORS.onSurfaceVariant,
    marginTop: 40,
    fontSize: 14,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  itemCardContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 15,
    color: APP_COLORS.onSurface,
    lineHeight: 22,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: APP_COLORS.onSurfaceVariant,
  },
  searchBarContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
  },
  searchButton: {
    backgroundColor: APP_COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 15,
    color: APP_COLORS.primary,
    marginBottom: 16,
  },
  profileBio: {
    fontSize: 14,
    color: APP_COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.outlineVariant,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  statLabel: {
    fontSize: 12,
    color: APP_COLORS.onSurfaceVariant,
    marginTop: 4,
  },
});
