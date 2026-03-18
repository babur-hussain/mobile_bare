import React, { useState, useEffect, useRef } from 'react';
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
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { createThumbnail } from 'react-native-create-thumbnail';

export interface AppMedia {
  asset: Asset;
  displayUri: string;
  isUploading: boolean;
  progress: number;
  s3Url?: string;
  hasError: boolean;
}
import DateTimePicker from '@react-native-community/datetimepicker';
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
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { createNewPost } from '../store/actions/posts.actions';
import { mediaService } from '../services/media.service';

type Platform_Type = 'instagram' | 'facebook' | 'youtube' | 'threads' | 'x';

const APP_COLORS = {
  primary: '#ea4353',
  secondary: '#026381',
  tertiary: '#006947',
  surface: '#f6f8fb',
  onSurface: '#1f2937',
  onSurfaceVariant: '#4b5563',
  surfaceContainerLow: '#ebf1fa',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHighest: '#dbe3ed',
  outlineVariant: '#a8aeb5',
  outline: '#787586',
  onPrimary: '#ffffff',
  primaryContainer: '#ff7576',
  onPrimaryContainer: '#4e000a',
  secondaryContainer: '#94dbfe',
  onSecondaryContainer: '#004e66',
  error: '#b02500',
  onBackground: '#2a3136',
  instagram: '#E1306C',
  facebook: '#1877F2',
  youtube: '#FF0000',
  twitter: '#1DA1F2',
  threads: '#000000',
};

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
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [tagsModalVisible, setTagsModalVisible] = useState(false);
  const [advancedModalVisible, setAdvancedModalVisible] = useState(false);

  // Custom Tag Input
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState('');

  // Advanced Settings State
  const [hideLikes, setHideLikes] = useState(false);
  const [turnOffComments, setTurnOffComments] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isUploadingAny = mediaItems.some(m => m.isUploading);

  // Animation state for loading screen
  const [pulseValue] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isSubmitting) {
      Animated.loop(
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
      ).start();
    } else {
      pulseValue.setValue(1);
    }
  }, [isSubmitting, pulseValue]);

  const { items: accounts } = useSelector((state: RootState) => state.accounts);
  const { user } = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

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
        if (item.asset.type?.startsWith('video/')) {
          try {
            const thumb = await createThumbnail({
              url: displayUri,
              timeStamp: 1000,
            });
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
          setMediaItems(current =>
            current.map(m =>
              m.asset.uri === item.asset.uri
                ? { ...m, isUploading: false, progress: 100, s3Url: media.s3Url }
                : m,
            ),
          );
        } catch (e) {
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

  const removeMedia = (index: number) => {
    setMediaItems(items => items.filter((_, i) => i !== index));
  };

  const togglePlatform = (platform: Platform_Type) => {
    setPlatformSelectionError(false);
    const next = new Set(selectedPlatforms);
    if (next.has(platform)) {
      next.delete(platform);
    } else {
      next.add(platform);
    }
    setSelectedPlatforms(next);
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

      const newPost = await dispatch(
        createNewPost({
          mediaUrls: urls,
          caption: caption.trim(),
          platforms: Array.from(selectedPlatforms),
          scheduledAt: submitAsScheduled
            ? scheduledDate.toISOString()
            : undefined,
        }),
      ).unwrap();

      // Reset form silently before navigating
      setCaption('');
      setMediaItems([]);
      setSelectedPlatforms(new Set());

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

  const hasPlatformAccount = (platform: Platform_Type) =>
    accounts.some((a: any) => a.platform === platform);

  // Dynamic user avatar similar to home screen
  const getAvatarUrl = () => {
    return (
      (user as any)?.picture ||
      (user as any)?.profilePicture ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQSzzHDXZ46-Z0Xr_8MJ8gowSA1wKCM1bJrEkfYW8rKM_9B5ypmBIJjXmEShmAmqWDXONuk1TCWl4nkZ4uoUoOaDWDThiyFqGkGjgSQWzv_1sGAb13D7BVlOViESBYl5trKHyudZhUnICNTmh7vY6JqsWc78EZWcysKzUhjMRwgSCwnSsmhCXb3tJopa3dS-7lvYP-MSr_cefXU8WXeVhJ27jseyOkCClpq2CSkqWWBfpPIKfiVVy78VRPPK0n1DvaGmm_USKGT6ZZ'
    );
  };

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
          <Share2 size={24} color={APP_COLORS.primary} />
          <Text style={styles.headerBrand}>PostOnce</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={APP_COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Image source={{ uri: getAvatarUrl() }} style={styles.avatarCircle} />
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
            <View style={styles.draftBadge}>
              <CheckCircle2 size={16} color={APP_COLORS.primary} />
              <View>
                <Text style={styles.draftBadgeTitle}>Draft Auto-saved</Text>
                <Text style={styles.draftBadgeSub}>Last saved at 10:42 AM</Text>
              </View>
            </View>
          </View>

          {/* Action Row right below title */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => { }}>
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
            </View>
            {platformSelectionError && (
              <Text style={styles.platformErrorText}>
                Please select at least one platform to publish.
              </Text>
            )}
          </View>

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
                  <Text style={styles.dropZoneTitle}>Drag and drop assets here</Text>
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
                <View style={styles.captionTools}>
                  <TouchableOpacity style={styles.toolBtn}>
                    <Smile size={20} color={APP_COLORS.onSurfaceVariant} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.toolBtn}>
                    <MapPin size={20} color={APP_COLORS.onSurfaceVariant} strokeWidth={2.5} />
                  </TouchableOpacity>
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
                <Text style={styles.infoBannerText}>Peak engagement predicted for LinkedIn</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleWithIcon}>
              <Tag size={18} color={APP_COLORS.onSurfaceVariant} />
              <Text style={styles.sectionTitleText}>Categories</Text>
            </Text>
          </View>
          <View style={styles.categoriesContainer}>
            {tags.length > 0 ? (
              tags.map((tag, idx) => (
                <View key={idx} style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => setTags(tags.filter((_, i) => i !== idx))}>
                    <X size={14} color="#64748b" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyCategoriesText}>No categories added yet.</Text>
            )}

            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={() => setTagsModalVisible(true)}>
              <Text style={styles.addCategoryBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>

          {/* Re-use tags modal for adding categories */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={tagsModalVisible}
            onRequestClose={() => setTagsModalVisible(false)}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Category</Text>
                  <TouchableOpacity
                    onPress={() => setTagsModalVisible(false)}>
                    <X size={24} color={APP_COLORS.onSurface} />
                  </TouchableOpacity>
                </View>
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                    placeholder="e.g. Marketing, Tech..."
                    placeholderTextColor={APP_COLORS.onSurfaceVariant}
                    value={currentTagInput}
                    onChangeText={setCurrentTagInput}
                    onSubmitEditing={() => {
                      if (currentTagInput.trim()) {
                        setTags([...tags, currentTagInput.trim()]);
                        setCurrentTagInput('');
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.addTagButton}
                    onPress={() => {
                      if (currentTagInput.trim()) {
                        setTags([...tags, currentTagInput.trim()]);
                        setCurrentTagInput('');
                      }
                    }}>
                    <Text style={styles.addTagButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={() => setTagsModalVisible(false)}>
                  <Text style={styles.modalSaveButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) {
                setScheduledDate(date);
                setShowTimePicker(true);
              } else if (isScheduled) {
                setIsScheduled(false);
              }
            }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="time"
            onChange={(_, date) => {
              setShowTimePicker(false);
              if (date) {
                setScheduledDate(date);
                if (isScheduled) {
                  finalizeSchedule();
                }
              } else if (isScheduled) {
                setIsScheduled(false);
              }
            }}
          />
        )}

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Beautiful Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <Animated.View style={[styles.loadingPulseCircle, { transform: [{ scale: pulseValue }] }]}>
            <Send size={48} color={APP_COLORS.onPrimary} />
          </Animated.View>
          <Text style={styles.loadingOverlayText}>Publishing your post...</Text>
          <Text style={styles.loadingOverlaySubText}>Please wait while we send it across to your requested platforms.</Text>
        </View>
      )}
    </KeyboardAvoidingView>
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
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
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
});
