import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Switch,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { createThumbnail } from 'react-native-create-thumbnail';

export interface AppMedia {
  asset: Asset;
  displayUri: string;
  isUploading: boolean;
  progress: number;
  s3Url?: string;
  thumbnailS3Url?: string; // uploaded thumbnail URL for videos
  hasError: boolean;
}

export interface AppLocation {
  name: string;
  lat: number;
  lng: number;
  id?: string;
  address?: string;
}
import { LayoutAnimation, UIManager } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface PlatformConfig {
  mentions: string[];
  hashtags: string[];
  location?: AppLocation;
}
import {
  Bell,
  Camera,
  Users,
  Edit2,
  X,
  ImagePlus,
  ImageIcon,
  Smile,
  AtSign,
  MapPin,
  Tag,
  Sliders,
  ChevronRight,
  Calendar,
  Send,
  Check,
  Youtube,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Share2,
  Search,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { createNewPost } from '../store/actions/posts.actions';
import { mediaService } from '../services/media.service';
import api from '../services/api';

import { APP_COLORS } from '../constants/colors';

type Platform_Type = 'instagram' | 'facebook' | 'youtube' | 'threads' | 'x';

export default function CreatePostScreen() {
  const [caption, setCaption] = useState('');
  const [mediaItems, setMediaItems] = useState<AppMedia[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<
    Set<Platform_Type>
  >(new Set());
  const [platformSelectionError, setPlatformSelectionError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Timing state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 3600000),
  ); // +1h
  // UI State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showYoutubeWarning, setShowYoutubeWarning] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [tagsModalVisible, setTagsModalVisible] = useState(false);
  const [advancedModalVisible, setAdvancedModalVisible] = useState(false);

  // Location Search State
  const [location, setLocation] = useState<AppLocation | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState<AppLocation[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Custom Tag Input
  const [tags, setTags] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState('');

  // Platform-Specific Config
  const [platformConfig, setPlatformConfig] = useState<Record<Platform_Type, PlatformConfig>>({
    instagram: { mentions: [], hashtags: [] },
    facebook: { mentions: [], hashtags: [] },
    threads: { mentions: [], hashtags: [] },
    x: { mentions: [], hashtags: [] },
    youtube: { mentions: [], hashtags: [] },
  });
  const [activePlatformInput, setActivePlatformInput] = useState<{ platform: Platform_Type; field: 'mentions' | 'hashtags' } | null>(null);
  const [chipInputText, setChipInputText] = useState('');
  const [platformLocationModal, setPlatformLocationModal] = useState<Platform_Type | null>(null);
  const [platformLocQuery, setPlatformLocQuery] = useState('');
  const [platformLocResults, setPlatformLocResults] = useState<AppLocation[]>([]);
  const [platformLocSearching, setPlatformLocSearching] = useState(false);

  // Mention Search State
  const [mentionSearchResults, setMentionSearchResults] = useState<any[]>([]);
  const [mentionSearching, setMentionSearching] = useState(false);
  const [recentMentions, setRecentMentions] = useState<string[]>([]);
  const mentionSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent mentions on mount
  useEffect(() => {
    AsyncStorage.getItem('recent_mentions').then(val => {
      if (val) {
        try { setRecentMentions(JSON.parse(val)); } catch (e) { }
      }
    });
  }, []);

  // Advanced Settings State
  const [hideLikes, setHideLikes] = useState(false);
  const [turnOffComments, setTurnOffComments] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isUploadingAny = useMemo(() => mediaItems.some(m => m.isUploading), [mediaItems]);

  // Animation state for loading screen — useRef to avoid leaking Animated nodes
  const pulseValue = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isSubmitting) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          })
        ])
      );
      pulseLoopRef.current = loop;
      loop.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;
      pulseValue.setValue(1);
    }
    return () => {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;
    };
  }, [isSubmitting, pulseValue]);

  const { items: accounts } = useSelector((state: RootState) => state.accounts);
  const { user } = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // #40: Debounce location search to reduce API calls
  const locationSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchLocations = useCallback((query: string) => {
    if (!query.trim()) {
      setLocationResults([]);
      return;
    }
    // Clear previous timer
    if (locationSearchTimerRef.current) {
      clearTimeout(locationSearchTimerRef.current);
    }
    locationSearchTimerRef.current = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await api.get(`/api/v1/locations/search?q=${encodeURIComponent(query)}`);
        setLocationResults(res.data || []);
      } catch (err) {
        console.log('Location search failed', err);
        setLocationResults([]);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 500);
  }, []);

  const pickMedia = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 10,
      quality: 0.8,
    });

    if (result.assets) {
      const newItems: AppMedia[] = result.assets.map(asset => ({
        asset,
        displayUri: asset.uri || '',
        isUploading: true,
        progress: 0,
        hasError: false,
      }));
      setMediaItems(prev => [...prev, ...newItems]);

      newItems.forEach(async item => {
        let displayUri = item.asset.uri || '';
        let thumbnailLocalPath: string | null = null;

        if (item.asset.type?.startsWith('video/')) {
          try {
            const thumb = await createThumbnail({
              url: displayUri,
              timeStamp: 1000,
            });
            thumbnailLocalPath = thumb.path;
            displayUri = thumb.path;
          } catch (e) {
            console.log('Thumbnail error', e);
          }
        }

        setMediaItems(current =>
          current.map(m =>
            m.asset.uri === item.asset.uri ? { ...m, displayUri } : m,
          ),
        );

        try {
          // Upload main media
          const media = await mediaService.upload(item.asset, progressEvent => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setMediaItems(current =>
                current.map(m =>
                  m.asset.uri === item.asset.uri ? { ...m, progress } : m,
                ),
              );
            }
          });

          // Upload thumbnail to S3 so it's stored server-side and cross-device
          let thumbnailS3Url: string | undefined;
          if (thumbnailLocalPath) {
            try {
              const thumbMedia = await mediaService.uploadFromPath(thumbnailLocalPath);
              thumbnailS3Url = thumbMedia.s3Url;
            } catch (thumbErr) {
              console.log('Thumbnail S3 upload failed (non-critical):', thumbErr);
            }
          }

          setMediaItems(current =>
            current.map(m =>
              m.asset.uri === item.asset.uri
                ? { ...m, isUploading: false, progress: 100, s3Url: media.s3Url, thumbnailS3Url }
                : m,
            ),
          );
        } catch (e: any) {
          // #41: Show user-friendly error message
          const errMsg = e?.response?.data?.message || 'Upload failed. Please check your connection and try again.';
          Alert.alert('Upload Error', errMsg);
          setMediaItems(current =>
            current.map(m =>
              m.asset.uri === item.asset.uri
                ? { ...m, isUploading: false, hasError: true }
                : m,
            ),
          );
        }
      });
    }
  };

  const removeMedia = useCallback((index: number) => {
    setMediaItems(items => items.filter((_, i) => i !== index));
  }, []);

  const togglePlatform = useCallback((platform: Platform_Type) => {
    setPlatformSelectionError(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  }, []);

  const addChipToConfig = useCallback((platform: Platform_Type, field: 'mentions' | 'hashtags', value: string) => {
    const clean = value.trim().replace(/^[@#]/, '');
    if (!clean) return;
    setPlatformConfig(prev => {
      const current = prev[platform][field];
      if (current.includes(clean)) return prev;
      return { ...prev, [platform]: { ...prev[platform], [field]: [...current, clean] } };
    });

    if (field === 'mentions') {
      setRecentMentions(prev => {
        const updated = [clean, ...prev.filter(m => m !== clean)].slice(0, 5);
        AsyncStorage.setItem('recent_mentions', JSON.stringify(updated)).catch(() => { });
        return updated;
      });
    }
  }, []);

  const removeChipFromConfig = useCallback((platform: Platform_Type, field: 'mentions' | 'hashtags', index: number) => {
    setPlatformConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: prev[platform][field].filter((_, i) => i !== index),
      },
    }));
  }, []);

  const setPlatformLocation = useCallback((platform: Platform_Type, loc: AppLocation | undefined) => {
    setPlatformConfig(prev => ({
      ...prev, [platform]: { ...prev[platform], location: loc },
    }));
  }, []);

  const searchPlatformLocations = useCallback((query: string, platform: Platform_Type) => {
    if (!query.trim()) { setPlatformLocResults([]); return; }
    if (locationSearchTimerRef.current) clearTimeout(locationSearchTimerRef.current);
    locationSearchTimerRef.current = setTimeout(async () => {
      setPlatformLocSearching(true);
      try {
        console.log(`[PlatformLocationSearch] query: ${query}, platform: ${platform}`);
        const res = await api.get('/api/v1/social-accounts/search-locations', {
          params: { platform, q: query }
        });
        const data = res.data?.data || res.data;
        setPlatformLocResults(data?.results || []);
      } catch (err: any) {
        console.error('[PlatformLocationSearch] Error:', err?.message, err?.response?.data);
        setPlatformLocResults([]);
      }
      finally { setPlatformLocSearching(false); }
    }, 500);
  }, []);

  const searchMentionUsers = useCallback((query: string, platform: Platform_Type) => {
    if (!query.trim() || query.length < 2) { setMentionSearchResults([]); return; }
    if (mentionSearchTimerRef.current) clearTimeout(mentionSearchTimerRef.current);
    mentionSearchTimerRef.current = setTimeout(async () => {
      setMentionSearching(true);
      console.log('[MentionSearch] Searching for:', query, 'on platform:', platform);
      try {
        const res = await api.get('/api/v1/social-accounts/search-users', {
          params: { platform, q: query },
        });
        console.log('[MentionSearch] Response:', JSON.stringify(res.data));
        const data = res.data?.data || res.data;
        setMentionSearchResults(data?.results || []);
      } catch (err: any) {
        console.error('[MentionSearch] Error:', err?.message, err?.response?.data);
        setMentionSearchResults([]);
      }
      finally { setMentionSearching(false); }
    }, 600);
  }, []);

  const PLATFORM_FEATURES: Record<Platform_Type, { mentions: boolean; hashtags: boolean; location: boolean }> = {
    instagram: { mentions: true, hashtags: true, location: false },
    facebook: { mentions: true, hashtags: true, location: false },
    threads: { mentions: true, hashtags: true, location: false },
    x: { mentions: true, hashtags: true, location: false },
    youtube: { mentions: false, hashtags: true, location: false },
  };

  const renderPlatformConfigPanel = (platform: Platform_Type) => {
    if (!selectedPlatforms.has(platform)) return null;
    const features = PLATFORM_FEATURES[platform];
    const config = platformConfig[platform];

    return (
      <View style={pcStyles.panel}>
        {/* Mentions */}
        {features.mentions && (
          <View style={pcStyles.fieldRow}>
            <View style={pcStyles.fieldHeader}>
              <AtSign size={14} color={APP_COLORS.primary} />
              <Text style={pcStyles.fieldLabel}>Mentions</Text>
            </View>
            <View style={pcStyles.chipsWrap}>
              {config.mentions.map((m, i) => (
                <View key={i} style={pcStyles.chip}>
                  <Text style={pcStyles.chipText}>@{m}</Text>
                  <TouchableOpacity onPress={() => removeChipFromConfig(platform, 'mentions', i)}>
                    <X size={12} color={APP_COLORS.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={pcStyles.addChipBtn}
                onPress={() => { setActivePlatformInput({ platform, field: 'mentions' }); setChipInputText(''); }}>
                <Text style={pcStyles.addChipText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hashtags */}
        {features.hashtags && (
          <View style={pcStyles.fieldRow}>
            <View style={pcStyles.fieldHeader}>
              <Tag size={14} color="#f97316" />
              <Text style={pcStyles.fieldLabel}>Hashtags</Text>
            </View>
            <View style={pcStyles.chipsWrap}>
              {config.hashtags.map((h, i) => (
                <View key={i} style={[pcStyles.chip, { backgroundColor: 'rgba(249,115,22,0.1)' }]}>
                  <Text style={[pcStyles.chipText, { color: '#f97316' }]}>#{h}</Text>
                  <TouchableOpacity onPress={() => removeChipFromConfig(platform, 'hashtags', i)}>
                    <X size={12} color="#f97316" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={pcStyles.addChipBtn}
                onPress={() => { setActivePlatformInput({ platform, field: 'hashtags' }); setChipInputText(''); }}>
                <Text style={pcStyles.addChipText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Location */}
        {features.location && (
          <View style={pcStyles.fieldRow}>
            <View style={pcStyles.fieldHeader}>
              <MapPin size={14} color={APP_COLORS.primary} />
              <Text style={pcStyles.fieldLabel}>Location</Text>
            </View>
            {config.location ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[pcStyles.chip, { backgroundColor: 'rgba(83,65,205,0.08)' }]}>
                  <MapPin size={12} color={APP_COLORS.primary} />
                  <Text style={[pcStyles.chipText, { color: APP_COLORS.primary }]}>{config.location.name.split(',')[0]}</Text>
                  <TouchableOpacity onPress={() => setPlatformLocation(platform, undefined)}>
                    <X size={12} color={APP_COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={pcStyles.addChipBtn}
                onPress={() => { setPlatformLocationModal(platform); setPlatformLocQuery(''); setPlatformLocResults([]); }}>
                <Text style={pcStyles.addChipText}>Search Location</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const handlePostNow = async () => {
    setIsScheduled(false);
    await handleSubmit(false);
  };

  const handleSchedulePost = async () => {
    setIsScheduled(true);
    // Open date picker to confirm time before submitting. For simplicity in demo, we'll just submit if scheduledDate is already future, or open picker if we want to force user to pick.
    // Given the UI shows both buttons, we'll assume the time is picked via advanced settings or we trigger it now.
    // Let's open the picker flow
    setShowDatePicker(true);
  };

  // Called when date/time flow finishes
  const finalizeSchedule = async () => {
    await handleSubmit(true);
  };

  const handleSubmit = async (submitAsScheduled: boolean) => {
    if (selectedPlatforms.size === 0) {
      setPlatformSelectionError(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (selectedPlatforms.has('youtube')) {
      const hasImage = mediaItems.some(m => !m.asset.type?.startsWith('video/'));
      if (hasImage) {
        setShowYoutubeWarning(true);
        return;
      }
    }

    if (!caption.trim() && mediaItems.length === 0) {
      Alert.alert('Error', 'Please add a caption or media');
      return;
    }
    if (mediaItems.some(m => m.isUploading)) {
      Alert.alert('Error', 'Please wait for media to finish uploading');
      return;
    }
    if (mediaItems.some(m => m.hasError)) {
      Alert.alert(
        'Error',
        'Some media failed to upload. Please remove them and try again.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const urls = mediaItems.map(m => m.s3Url).filter(Boolean) as string[];
      // Use the first video's thumbnail URL if available
      const thumbnailUrl = mediaItems.find(m => m.thumbnailS3Url)?.thumbnailS3Url;

      // Build per-platform config payload (only for selected platforms with data)
      const configPayload: Record<string, any> = {};
      for (const p of Array.from(selectedPlatforms)) {
        const pc = platformConfig[p];
        if (pc.mentions.length > 0 || pc.hashtags.length > 0 || pc.location) {
          configPayload[p] = {
            ...(pc.mentions.length > 0 ? { mentions: pc.mentions } : {}),
            ...(pc.hashtags.length > 0 ? { hashtags: pc.hashtags } : {}),
            ...(pc.location ? { location: pc.location } : {}),
          };
        }
      }

      const newPost = await dispatch(
        createNewPost({
          mediaUrls: urls,
          caption: caption.trim(),
          platforms: Array.from(selectedPlatforms),
          scheduledTime: submitAsScheduled
            ? scheduledDate.toISOString()
            : undefined,
          location: location || undefined,
          thumbnailUrl,
          ...(Object.keys(configPayload).length > 0 ? { platformConfig: configPayload } : {}),
        }),
      ).unwrap();

      // Reset form silently before navigating
      setCaption('');
      setMediaItems([]);
      setSelectedPlatforms(new Set());
      setPlatformConfig({
        instagram: { mentions: [], hashtags: [] },
        facebook: { mentions: [], hashtags: [] },
        threads: { mentions: [], hashtags: [] },
        x: { mentions: [], hashtags: [] },
        youtube: { mentions: [], hashtags: [] }
      });

      // Navigate to success screen
      navigation.navigate('PostSuccess', { post: newPost });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create post',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPlatformAccount = useCallback((platform: Platform_Type) =>
    accounts.some((a: any) => a.platform === platform), [accounts]);

  // Dynamic user avatar similar to home screen
  const avatarUrl = useMemo(() => (
    (user as any)?.picture ||
    (user as any)?.profilePicture ||
    null
  ), [user]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Top App Bar */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 60 + insets.top }, // matched home.tsx
        ]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Share2 color="#b71029" size={24} />
          </View>
          <Text style={styles.headerBrand}>PostOnce</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={APP_COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Image source={{ uri: avatarUrl }} style={styles.avatarCircle} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Context / Breadcrumb & Title */}
        <View style={styles.heroSection}>
          <Text style={styles.breadcrumb}>CONTENT STUDIO</Text>
          <View style={styles.heroTitleRow}>
            <Text style={styles.title}>Compose</Text>

            {/* Replace floating Draft Auto-saved with an absolute positioning if tricky later, doing inline for now */}
          </View>

          {/* Action Row right below title */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => Alert.alert('Coming Soon', 'Draft saving will be available in a future update.')}>
              <Text style={styles.btnSecondaryText}>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handlePostNow}
              disabled={isSubmitting}>
              <Text style={styles.btnPrimaryText}>Publish Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          {/* Media Upload Area */}
          <View style={styles.section}>
            <View style={[styles.mediaGrid, { height: 260 }]}>
              {mediaItems.length > 0 ? (
                <>
                  {/* Main Preview (first asset) */}
                  <TouchableOpacity
                    style={styles.mainMediaContainer}
                    onPress={pickMedia}
                    activeOpacity={0.9}>
                    <Image
                      source={{ uri: mediaItems[0].displayUri }}
                      style={styles.mainMedia}
                    />
                    <View style={styles.mediaOverlay}>
                      <Edit2 size={32} color={APP_COLORS.onPrimary} />
                    </View>
                    {mediaItems[0].isUploading && (
                      <View
                        style={[
                          styles.mediaOverlay,
                          { opacity: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
                        ]}>
                        <ActivityIndicator
                          color={APP_COLORS.primary}
                          size="large"
                        />
                        <Text
                          style={{
                            color: 'white',
                            marginTop: 8,
                            fontWeight: 'bold',
                          }}>
                          {mediaItems[0].progress}%
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeMediaFab}
                      onPress={() => removeMedia(0)}>
                      <X size={16} color={APP_COLORS.onPrimary} />
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Thumbnails (remaining assets) */}
                  <View style={styles.sideMediaContainer}>
                    {mediaItems.slice(1, 3).map((item, index) => (
                      <View key={index + 1} style={styles.sideThumbWrapper}>
                        <Image
                          source={{ uri: item.displayUri }}
                          style={styles.sideMedia}
                        />
                        {item.isUploading && (
                          <View
                            style={[
                              styles.mediaOverlay,
                              { opacity: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
                            ]}>
                            <ActivityIndicator
                              color={APP_COLORS.primary}
                              size="small"
                            />
                            <Text
                              style={{
                                color: 'white',
                                marginTop: 4,
                                fontSize: 10,
                                fontWeight: 'bold',
                              }}>
                              {item.progress}%
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.removeMediaSmall}
                          onPress={() => removeMedia(index + 1)}>
                          <X size={12} color={APP_COLORS.onPrimary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {/* Add More Button if we have media but < 3 */}
                    {mediaItems.length < 3 && (
                      <TouchableOpacity
                        style={styles.uploadBoxSmall}
                        onPress={pickMedia}
                        disabled={isUploadingAny}>
                        <>
                          <ImagePlus
                            size={24}
                            color={APP_COLORS.onSurfaceVariant}
                          />
                          <Text style={styles.uploadTextSmall}>Upload</Text>
                        </>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              ) : (
                /* Empty Dropzone State */
                <TouchableOpacity
                  style={styles.dropZoneEmptyBox}
                  onPress={pickMedia}>
                  <UploadCloud size={48} color={APP_COLORS.outlineVariant} />
                  <Text style={styles.dropZoneTitle}>Tap to select photos or videos</Text>
                  <Text style={styles.dropZoneSub}>Supports High-Res JPG, PNG, or MP4 up to 100MB</Text>
                  <View style={styles.browseButton}>
                    <Text style={styles.browseButtonText}>Browse Files</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Caption Editor */}
          <View style={styles.section}>
            <View style={styles.captionContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="What's on your mind?&#10;Capture your audience's attention..."
                placeholderTextColor={APP_COLORS.outlineVariant}
                multiline
                numberOfLines={8}
                maxLength={2200}
                value={caption}
                onChangeText={setCaption}
              />
              <View style={styles.captionFooter}>
                {/* TEMP DISABLED: Global Location Tagging
                {location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8, alignSelf: 'flex-start' }}>
                    <MapPin size={12} color={APP_COLORS.primary} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: APP_COLORS.onSurface }}>{location.name.split(',')[0]}...</Text>
                    <TouchableOpacity onPress={() => setLocation(null)} style={{ marginLeft: 6 }}>
                      <X size={14} color={APP_COLORS.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                )}
                */}
                <View style={styles.captionTools}>
                  <TouchableOpacity style={styles.toolBtn}>
                    <Smile size={20} color={APP_COLORS.onSurfaceVariant} strokeWidth={2.5} />
                  </TouchableOpacity>
                  {/* TEMP DISABLED: Global Location Button
                  <TouchableOpacity style={styles.toolBtn} onPress={() => setLocationModalVisible(true)}>
                    <MapPin size={20} color={location ? APP_COLORS.primary : APP_COLORS.onSurfaceVariant} strokeWidth={2.5} />
                  </TouchableOpacity>
                  */}
                  <TouchableOpacity style={styles.toolBtn}>
                    <Text style={styles.boldIconText}>B</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.charCount}>
                  {caption.length} / 2200
                </Text>
              </View>
            </View>
          </View>

          {/* Scheduling Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleWithIcon}>
                <Calendar size={18} color="#f97316" />
                <Text style={styles.sectionTitleText}>Scheduling</Text>
              </Text>
            </View>
            <View style={styles.schedulingContainer}>
              <TouchableOpacity
                style={styles.scheduleInputCard}
                onPress={() => {
                  setIsScheduled(true);
                  setShowDatePicker(true);
                }}>
                <View>
                  <Text style={styles.scheduleInputLabel}>PUBLISH DATE</Text>
                  <Text style={styles.scheduleInputValue}>
                    {scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <Calendar size={20} color={APP_COLORS.onSurfaceVariant} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.scheduleInputCard}
                onPress={() => {
                  setIsScheduled(true);
                  setShowTimePicker(true);
                }}>
                <View>
                  <Text style={styles.scheduleInputLabel}>OPTIMIZED TIME</Text>
                  <Text style={styles.scheduleInputValue}>
                    {scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Sparkles size={20} color={APP_COLORS.onSurfaceVariant} />
              </TouchableOpacity>

              <View style={styles.scheduleInfoBanner}>
                <View style={styles.bannerIconBox}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#ea580c' }}>i</Text>
                </View>
                <Text style={styles.infoBannerText}>Peak engagement predicted based on your audience</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location Search Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={locationModalVisible}
          onRequestClose={() => setLocationModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: '80%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Search Location</Text>
                <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                  <X size={24} color={APP_COLORS.onSurface} />
                </TouchableOpacity>
              </View>
              <View style={styles.tagInputContainer}>
                <Search size={20} color={APP_COLORS.onSurfaceVariant} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="Search places..."
                  placeholderTextColor={APP_COLORS.onSurfaceVariant}
                  value={locationSearchQuery}
                  onChangeText={(text) => {
                    setLocationSearchQuery(text);
                    searchLocations(text);
                  }}
                  autoFocus
                />
              </View>
              {isSearchingLocation ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={APP_COLORS.primary} />
              ) : (
                <ScrollView style={{ marginTop: 16 }}>
                  {locationResults.map((loc, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}
                      onPress={() => {
                        setLocation(loc);
                        setLocationModalVisible(false);
                        setLocationSearchQuery('');
                        setLocationResults([]);
                      }}>
                      <Text style={{ fontSize: 16, color: APP_COLORS.onSurface, fontWeight: '500' }}>{loc.name.split(',')[0]}</Text>
                      <Text style={{ fontSize: 12, color: APP_COLORS.onSurfaceVariant, marginTop: 2 }}>{loc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Chip Input Modal (Mentions / Hashtags) */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!activePlatformInput}
          onRequestClose={() => { setActivePlatformInput(null); setMentionSearchResults([]); }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Add {activePlatformInput?.field === 'mentions' ? '@Mention' : '#Hashtag'}
                </Text>
                <TouchableOpacity onPress={() => { setActivePlatformInput(null); setMentionSearchResults([]); }}>
                  <X size={24} color={APP_COLORS.onSurface} />
                </TouchableOpacity>
              </View>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                  placeholder={activePlatformInput?.field === 'mentions' ? 'Search username...' : 'hashtag'}
                  placeholderTextColor={APP_COLORS.onSurfaceVariant}
                  value={chipInputText}
                  onChangeText={(text) => {
                    setChipInputText(text);
                    if (activePlatformInput?.field === 'mentions') {
                      searchMentionUsers(text, activePlatformInput.platform);
                    }
                  }}
                  autoFocus
                  autoCapitalize="none"
                  onSubmitEditing={() => {
                    if (activePlatformInput && chipInputText.trim()) {
                      addChipToConfig(activePlatformInput.platform, activePlatformInput.field, chipInputText);
                      setChipInputText('');
                      setMentionSearchResults([]);
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={() => {
                    if (activePlatformInput && chipInputText.trim()) {
                      addChipToConfig(activePlatformInput.platform, activePlatformInput.field, chipInputText);
                      setChipInputText('');
                      setMentionSearchResults([]);
                    }
                  }}>
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Live Search Results for Mentions */}
              {activePlatformInput?.field === 'mentions' && mentionSearching && (
                <ActivityIndicator style={{ marginVertical: 12 }} color={APP_COLORS.primary} />
              )}
              {/* Show Recent Mentions when not searching and results are empty */}
              {activePlatformInput?.field === 'mentions' && !mentionSearching && mentionSearchResults.length === 0 && recentMentions.length > 0 && chipInputText.length < 2 && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, color: APP_COLORS.onSurfaceVariant, marginBottom: 8, fontWeight: '600' }}>Recent Pickups</Text>
                  <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                    {recentMentions.map((username, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          paddingVertical: 8,
                          paddingHorizontal: 4,
                          borderBottomWidth: idx !== recentMentions.length - 1 ? 1 : 0,
                          borderBottomColor: '#f1f5f9',
                        }}
                        onPress={() => {
                          if (activePlatformInput) {
                            addChipToConfig(activePlatformInput.platform, 'mentions', username);
                            setChipInputText('');
                          }
                        }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: APP_COLORS.primaryContainer, justifyContent: 'center', alignItems: 'center' }}>
                          <AtSign size={14} color={APP_COLORS.primary} />
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '500', color: APP_COLORS.onSurface }}>@{username}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {activePlatformInput?.field === 'mentions' && mentionSearchResults.length > 0 && (
                <ScrollView style={{ maxHeight: 180, marginBottom: 12 }} keyboardShouldPersistTaps="handled">
                  {mentionSearchResults.map((user, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 4,
                        borderBottomWidth: 1,
                        borderBottomColor: '#e2e8f0',
                      }}
                      onPress={() => {
                        if (activePlatformInput) {
                          addChipToConfig(activePlatformInput.platform, 'mentions', user.username);
                          setChipInputText('');
                          setMentionSearchResults([]);
                        }
                      }}>
                      {user.profilePicture ? (
                        <Image
                          source={{ uri: user.profilePicture }}
                          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0' }}
                        />
                      ) : (
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: APP_COLORS.primaryContainer, justifyContent: 'center', alignItems: 'center' }}>
                          <AtSign size={16} color={APP_COLORS.primary} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: APP_COLORS.onSurface }}>@{user.username}</Text>
                        {user.name && user.name !== user.username && (
                          <Text style={{ fontSize: 12, color: APP_COLORS.onSurfaceVariant }}>{user.name}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Show current chips */}
              {activePlatformInput && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {platformConfig[activePlatformInput.platform][activePlatformInput.field].map((v, i) => (
                    <View key={i} style={[pcStyles.chip, { backgroundColor: activePlatformInput.field === 'mentions' ? 'rgba(83,65,205,0.1)' : 'rgba(249,115,22,0.1)' }]}>
                      <Text style={[pcStyles.chipText, { color: activePlatformInput.field === 'mentions' ? APP_COLORS.primary : '#f97316' }]}>
                        {activePlatformInput.field === 'mentions' ? '@' : '#'}{v}
                      </Text>
                      <TouchableOpacity onPress={() => removeChipFromConfig(activePlatformInput.platform, activePlatformInput.field, i)}>
                        <X size={12} color={APP_COLORS.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => { setActivePlatformInput(null); setMentionSearchResults([]); }}>
                <Text style={styles.modalSaveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Per-Platform Location Search Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!platformLocationModal}
          onRequestClose={() => setPlatformLocationModal(null)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: '80%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Location for {platformLocationModal ? platformLocationModal.charAt(0).toUpperCase() + platformLocationModal.slice(1) : ''}</Text>
                <TouchableOpacity onPress={() => setPlatformLocationModal(null)}>
                  <X size={24} color={APP_COLORS.onSurface} />
                </TouchableOpacity>
              </View>
              <View style={styles.tagInputContainer}>
                <Search size={20} color={APP_COLORS.onSurfaceVariant} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="Search places..."
                  placeholderTextColor={APP_COLORS.onSurfaceVariant}
                  value={platformLocQuery}
                  onChangeText={(text) => {
                    setPlatformLocQuery(text);
                    if (platformLocationModal) {
                      searchPlatformLocations(text, platformLocationModal);
                    }
                  }}
                  autoFocus
                />
              </View>
              {platformLocSearching ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={APP_COLORS.primary} />
              ) : (
                <ScrollView style={{ marginTop: 16 }}>
                  {platformLocResults.map((loc, idx) => (
                    <TouchableOpacity
                      key={loc.id || idx}
                      style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}
                      onPress={() => {
                        if (platformLocationModal) {
                          // Ensure loc structure matches what we expect
                          setPlatformLocation(platformLocationModal, {
                            name: loc.name,
                            lat: 0, // native place IDs don't expose simple lat/lng in our UI directly
                            lng: 0,
                            id: loc.id // IMPORTANT: inject the Place ID directly properties
                          } as any);
                        }
                        setPlatformLocationModal(null);
                        setPlatformLocQuery('');
                        setPlatformLocResults([]);
                      }}>
                      <Text style={{ fontSize: 16, color: APP_COLORS.onSurface, fontWeight: '500' }}>{loc.name}</Text>
                      <Text style={{ fontSize: 12, color: APP_COLORS.onSurfaceVariant, marginTop: 2 }}>{loc.address || ''}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Date/Time Pickers */}
        {Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide" visible={showDatePicker || showTimePicker}>
            <View style={styles.pickerModalOverlay}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <TouchableOpacity onPress={() => {
                    if (showDatePicker) setShowDatePicker(false);
                    if (showTimePicker) setShowTimePicker(false);
                  }}>
                    <Text style={styles.pickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker && (
                  <DateTimePicker
                    value={scheduledDate}
                    mode="date"
                    display="inline"
                    themeVariant="light"
                    textColor={APP_COLORS.onSurface}
                    minimumDate={new Date()}
                    onChange={(_, date) => {
                      if (date) setScheduledDate(date);
                    }}
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    value={scheduledDate}
                    mode="time"
                    display="spinner"
                    themeVariant="light"
                    textColor={APP_COLORS.onSurface}
                    onChange={(_, date) => {
                      if (date) setScheduledDate(date);
                    }}
                  />
                )}
              </View>
            </View>
          </Modal>
        ) : (
          <>
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="date"
                themeVariant="light"
                textColor={APP_COLORS.onSurface}
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setScheduledDate(date);
                  }
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="time"
                themeVariant="light"
                textColor={APP_COLORS.onSurface}
                onChange={(_, date) => {
                  setShowTimePicker(false);
                  if (date) {
                    setScheduledDate(date);
                  }
                }}
              />
            )}
          </>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ backgroundColor: APP_COLORS.primary, padding: 4, borderRadius: 6 }}>
                <Share2 size={14} color={APP_COLORS.onPrimary} />
              </View>
              <Text style={[styles.sectionLabel, { fontSize: 14, color: APP_COLORS.onSurface }]}>Target Platforms</Text>
            </View>
          </View>
          <View style={styles.platformVerticalContainer}>
            <TouchableOpacity
              style={[
                styles.platformRow,
                !hasPlatformAccount('instagram') && styles.platformRowDisabled,
              ]}
              disabled={!hasPlatformAccount('instagram')}
              onPress={() => togglePlatform('instagram')}
              activeOpacity={0.8}>
              <View style={styles.platformRowLeft}>
                <View style={[styles.platformIconBox, { backgroundColor: APP_COLORS.instagram }]}>
                  <Camera size={20} color={APP_COLORS.onPrimary} />
                </View>
                <View>
                  <Text style={styles.platformRowName}>Instagram</Text>
                  {!hasPlatformAccount('instagram') && (
                    <Text style={styles.notConnectedTextInline}>Connect Account</Text>
                  )}
                </View>
              </View>
              <Switch
                value={selectedPlatforms.has('instagram')}
                onValueChange={() => togglePlatform('instagram')}
                disabled={!hasPlatformAccount('instagram')}
                trackColor={{ true: APP_COLORS.primary, false: '#e2e8f0' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>
            {renderPlatformConfigPanel('instagram')}

            <TouchableOpacity
              style={[
                styles.platformRow,
                !hasPlatformAccount('facebook') && styles.platformRowDisabled,
              ]}
              disabled={!hasPlatformAccount('facebook')}
              onPress={() => togglePlatform('facebook')}
              activeOpacity={0.8}>
              <View style={styles.platformRowLeft}>
                <View style={[styles.platformIconBox, { backgroundColor: APP_COLORS.secondary }]}>
                  <Users size={20} color={APP_COLORS.onPrimary} />
                </View>
                <View>
                  <Text style={styles.platformRowName}>Facebook</Text>
                  {!hasPlatformAccount('facebook') && (
                    <Text style={styles.notConnectedTextInline}>Connect Account</Text>
                  )}
                </View>
              </View>
              <Switch
                value={selectedPlatforms.has('facebook')}
                onValueChange={() => togglePlatform('facebook')}
                disabled={!hasPlatformAccount('facebook')}
                trackColor={{ true: APP_COLORS.primary, false: '#e2e8f0' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>
            {renderPlatformConfigPanel('facebook')}

            <TouchableOpacity
              style={[
                styles.platformRow,
                !hasPlatformAccount('threads') && styles.platformRowDisabled,
              ]}
              disabled={!hasPlatformAccount('threads')}
              onPress={() => togglePlatform('threads')}
              activeOpacity={0.8}>
              <View style={styles.platformRowLeft}>
                <View style={[styles.platformIconBox, { backgroundColor: APP_COLORS.threads }]}>
                  <AtSign size={20} color={APP_COLORS.onPrimary} />
                </View>
                <View>
                  <Text style={styles.platformRowName}>Threads</Text>
                  {!hasPlatformAccount('threads') && (
                    <Text style={styles.notConnectedTextInline}>Connect Account</Text>
                  )}
                </View>
              </View>
              <Switch
                value={selectedPlatforms.has('threads')}
                onValueChange={() => togglePlatform('threads')}
                disabled={!hasPlatformAccount('threads')}
                trackColor={{ true: APP_COLORS.primary, false: '#e2e8f0' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>
            {renderPlatformConfigPanel('threads')}

            <TouchableOpacity
              style={[
                styles.platformRow,
                !hasPlatformAccount('x') && styles.platformRowDisabled,
              ]}
              disabled={!hasPlatformAccount('x')}
              onPress={() => togglePlatform('x')}
              activeOpacity={0.8}>
              <View style={styles.platformRowLeft}>
                <View style={[styles.platformIconBox, { backgroundColor: '#000000' }]}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color: APP_COLORS.onPrimary }}>X</Text>
                </View>
                <View>
                  <Text style={styles.platformRowName}>X / Twitter</Text>
                  {!hasPlatformAccount('x') && (
                    <Text style={styles.notConnectedTextInline}>Connect Account</Text>
                  )}
                </View>
              </View>
              <Switch
                value={selectedPlatforms.has('x')}
                onValueChange={() => togglePlatform('x')}
                disabled={!hasPlatformAccount('x')}
                trackColor={{ true: APP_COLORS.primary, false: '#e2e8f0' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>
            {renderPlatformConfigPanel('x')}

            <TouchableOpacity
              style={[
                styles.platformRow,
                !hasPlatformAccount('youtube') && styles.platformRowDisabled,
              ]}
              disabled={!hasPlatformAccount('youtube')}
              onPress={() => togglePlatform('youtube')}
              activeOpacity={0.8}>
              <View style={styles.platformRowLeft}>
                <View style={[styles.platformIconBox, { backgroundColor: APP_COLORS.youtube }]}>
                  <Youtube size={20} color={APP_COLORS.onPrimary} />
                </View>
                <View>
                  <Text style={styles.platformRowName}>YouTube</Text>
                  {!hasPlatformAccount('youtube') && (
                    <Text style={styles.notConnectedTextInline}>Connect Account</Text>
                  )}
                </View>
              </View>
              <Switch
                value={selectedPlatforms.has('youtube')}
                onValueChange={() => togglePlatform('youtube')}
                disabled={!hasPlatformAccount('youtube')}
                trackColor={{ true: APP_COLORS.primary, false: '#e2e8f0' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>
            {renderPlatformConfigPanel('youtube')}
          </View>
          {platformSelectionError && (
            <Text style={styles.platformErrorText}>
              Please select at least one platform to publish.
            </Text>
          )}
        </View>

        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity style={styles.btnPrimary} onPress={handlePostNow} disabled={isSubmitting}>
            <Text style={styles.btnPrimaryText}>Publish Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Beautiful Loading Overlay */}
      {
        isSubmitting && (
          <View style={styles.loadingOverlay}>
            <Animated.View style={[styles.loadingPulseCircle, { transform: [{ scale: pulseValue }] }]}>
              <Send size={48} color={APP_COLORS.onPrimary} />
            </Animated.View>
            <Text style={styles.loadingOverlayText}>Publishing your post...</Text>
            <Text style={styles.loadingOverlaySubText}>Please wait while we send it across to your requested platforms.</Text>
          </View>
        )
      }

      {/* YouTube Warning Modal */}
      <Modal transparent animationType="fade" visible={showYoutubeWarning}>
        <View style={styles.warningOverlay}>
          <View style={styles.warningCard}>
            <LottieView
              source={require('../LottieAnimations/Incorrect.lottie')}
              autoPlay
              loop={false}
              style={{ width: 120, height: 120, alignSelf: 'center' }}
            />
            <Text style={styles.warningTitle}>YouTube Limitation</Text>
            <Text style={styles.warningDesc}>
              YouTube does not support posting static images. Please remove the image or deselect YouTube to continue.
            </Text>
            <TouchableOpacity style={styles.warningBtn} onPress={() => setShowYoutubeWarning(false)}>
              <Text style={styles.warningBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView >
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
    gap: 8,
  },
  headerIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_COLORS.primaryContainer,
  },
  headerBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#b71029',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: APP_COLORS.surfaceContainerLowest,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  heroSection: {
    marginBottom: 32,
  },
  breadcrumb: {
    fontSize: 11,
    fontWeight: '800',
    color: APP_COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    letterSpacing: -1,
    lineHeight: 40,
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#1c1b1b',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginTop: -20, // To pull it up slightly as per design absolute positioning
  },
  draftBadgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  draftBadgeSub: {
    fontSize: 11,
    color: '#8A8D9F',
    marginTop: 2,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#E2E8F0', // slate-200
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155', // slate-700
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.onPrimary,
  },
  formContainer: {
    gap: 40,
  },
  platformSection: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 24, // extra padding at the end of scroll
    paddingVertical: 4,
  },
  platformVerticalContainer: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.15)',
    shadowColor: '#1c1b1b',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 8,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  platformRowDisabled: {
    opacity: 0.5,
  },
  platformRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  platformRowName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155', // slate-700
  },
  notConnectedTextInline: {
    fontSize: 11,
    color: APP_COLORS.error,
    fontWeight: '600',
    marginTop: 2,
  },
  platformSectionError: {
    // optional: highlighting container logic
  },
  platformErrorText: {
    color: APP_COLORS.error,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 4,
  },
  platformIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notConnectedText: {
    fontSize: 10,
    color: APP_COLORS.error,
    fontWeight: '700',
    marginTop: -10,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: APP_COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  uploadInfoText: {
    fontSize: 12,
    color: APP_COLORS.outline,
    marginBottom: 8,
    marginTop: -4,
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.primary,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
    color: APP_COLORS.outline,
  },
  mediaGrid: {
    flexDirection: 'row',
    height: 288, // ~ h-72
    gap: 12,
  },
  mainMediaContainer: {
    flex: 2,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    position: 'relative',
  },
  dropZoneEmptyBox: {
    flex: 1, // take the full height of mediaGrid
    borderRadius: 16,
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: '#e2e8f0', // slate-200 dashed
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dropZoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
    marginTop: 16,
    marginBottom: 4,
  },
  dropZoneSub: {
    fontSize: 12,
    color: '#8A8D9F',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.primary,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.primary,
  },
  mainMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0, // In RN, hover states don't exist, we keep it visible or hidden. For now, keep hidden unless touched. We can just leave it since the user clicks to edit.
  },
  removeMediaFab: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideMediaContainer: {
    flex: 1,
    gap: 12,
  },
  sideThumbWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  sideMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeMediaSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBoxSmall: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceContainerLow,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: APP_COLORS.outlineVariant,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.onSurfaceVariant,
  },
  emptyBoxSmall: {
    flex: 1,
    backgroundColor: 'rgba(229, 226, 225, 0.3)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.15)', // invisible border to match others
    shadowColor: '#1c1b1b',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  captionInput: {
    fontSize: 18,
    color: APP_COLORS.onSurface,
    minHeight: 180, // slightly less since tools are inline now
    textAlignVertical: 'top',
    padding: 0,
    marginBottom: 20,
  },
  captionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.surfaceContainerHighest, // thin divider line based on design
  },
  captionTools: {
    flexDirection: 'row',
    gap: 8,
  },
  toolBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  boldIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: APP_COLORS.onSurfaceVariant,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    marginLeft: 8,
  },
  schedulingContainer: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.15)',
    gap: 12,
  },
  scheduleInputCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
  },
  scheduleInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: APP_COLORS.outline,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  scheduleInputValue: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.onSurface,
  },
  scheduleInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed', // orange-50
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  bannerIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffedd5', // orange-100
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa', // orange-200
  },
  infoBannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ea580c', // orange-600
  },
  advancedSection: {
    gap: 8,
  },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  advancedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  advancedText: {
    fontSize: 16,
    fontWeight: '500',
    color: APP_COLORS.onSurface,
  },
  footerNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(252, 249, 248, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 196, 215, 0.1)',
    paddingHorizontal: 24,
    paddingTop: 24,
    zIndex: 100,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scheduleButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
  },
  postNowButton: {
    flex: 1,
    backgroundColor: APP_COLORS.primary, // gradient fallback
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: APP_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
  },
  postNowButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: APP_COLORS.onPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    letterSpacing: -0.5,
  },
  modalInput: {
    backgroundColor: APP_COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: APP_COLORS.onSurface,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.2)',
  },
  modalSaveButton: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  modalSaveButtonText: {
    color: APP_COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  addTagButton: {
    backgroundColor: 'rgba(83, 65, 205, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addTagButtonText: {
    color: APP_COLORS.primary,
    fontWeight: '700',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.15)',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 67, 83, 0.1)', // primary 10%
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryChipText: {
    color: APP_COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyCategoriesText: {
    fontSize: 14,
    color: APP_COLORS.outline,
    fontStyle: 'italic',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  addCategoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryBtnText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingRight: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.onSurface,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: APP_COLORS.onSurfaceVariant,
    maxWidth: '90%',
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: APP_COLORS.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(252, 249, 248, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingPulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: APP_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: APP_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  loadingOverlayText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingOverlaySubText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerModalContent: {
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerDoneText: {
    color: APP_COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  warningOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  warningCard: {
    width: '85%',
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningDesc: {
    fontSize: 14,
    color: APP_COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  warningBtn: {
    backgroundColor: APP_COLORS.error,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  warningBtnText: {
    color: APP_COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});

// Platform config panel styles
const pcStyles = StyleSheet.create({
  panel: {
    marginLeft: 56,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(83, 65, 205, 0.15)',
    gap: 12,
  },
  fieldRow: {
    gap: 6,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(83, 65, 205, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.primary,
  },
  addChipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    borderStyle: 'dashed',
  },
  addChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.onSurfaceVariant,
  },
});
