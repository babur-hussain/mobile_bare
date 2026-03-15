import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
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
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { createNewPost } from '../store/actions/posts.actions';
import { mediaService } from '../services/media.service';

type Platform_Type = 'instagram' | 'facebook' | 'youtube';

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
  outline: '#787586',
  surfaceDim: '#dcd9d9',
  onPrimary: '#ffffff',
  secondaryContainer: '#1470e8',
  primaryContainer: '#6c5ce7',
  onPrimaryContainer: '#faf6ff',
  error: '#ba1a1a',
  instagram: '#E1306C',
  facebook: '#1877F2',
  youtube: '#FF0000',
};

export default function CreatePostScreen() {
  const [caption, setCaption] = useState('');
  const [mediaAssets, setMediaAssets] = useState<Asset[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<
    Set<Platform_Type>
  >(new Set());

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

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setMediaAssets([...mediaAssets, ...result.assets]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaAssets(mediaAssets.filter((_, i) => i !== index));
    setUploadedUrls(uploadedUrls.filter((_, i) => i !== index));
  };

  const togglePlatform = (platform: Platform_Type) => {
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
      Alert.alert('Error', 'Please select at least one platform');
      return;
    }

    if (!caption.trim() && mediaAssets.length === 0) {
      Alert.alert('Error', 'Please add a caption or media');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload media files
      let urls = [...uploadedUrls];
      if (mediaAssets.length > urls.length) {
        setIsUploading(true);
        for (let i = urls.length; i < mediaAssets.length; i++) {
          const media = await mediaService.upload(mediaAssets[i]);
          urls.push(media.s3Url);
        }
        setUploadedUrls(urls);
        setIsUploading(false);
      }

      await dispatch(
        createNewPost({
          mediaUrls: urls,
          caption: caption.trim(),
          platforms: Array.from(selectedPlatforms),
          scheduledAt: submitAsScheduled
            ? scheduledDate.toISOString()
            : undefined,
        }),
      ).unwrap();

      Alert.alert(
        'Success',
        submitAsScheduled
          ? 'Post scheduled successfully!'
          : 'Post sent for publishing!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }],
      );

      // Reset form
      setCaption('');
      setMediaAssets([]);
      setUploadedUrls([]);
      setSelectedPlatforms(new Set());
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create post',
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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
          { paddingTop: insets.top, height: 64 + insets.top },
        ]}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: getAvatarUrl() }} style={styles.avatarCircle} />
          <Text style={styles.headerBrand}>PostOnce</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color={APP_COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Context / Breadcrumb */}
        <View style={styles.heroSection}>
          <Text style={styles.breadcrumb}>NEW EDITORIAL</Text>
          <Text style={styles.title}>Create Post</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Platform Selection Bento */}
          <View style={styles.platformSection}>
            <TouchableOpacity
              style={[
                styles.platformCard,
                selectedPlatforms.has('instagram') &&
                styles.platformCardSelected,
                !hasPlatformAccount('instagram') && styles.platformCardDisabled,
              ]}
              disabled={!hasPlatformAccount('instagram')}
              onPress={() => togglePlatform('instagram')}
              activeOpacity={0.8}>
              <View style={styles.platformCardHeader}>
                <View
                  style={[
                    styles.platformIconBox,
                    { backgroundColor: `${APP_COLORS.instagram}15` },
                  ]}>
                  <Camera size={24} color={APP_COLORS.instagram} />
                </View>
                {/* Custom Checkbox visual */}
                <View
                  style={[
                    styles.checkbox,
                    selectedPlatforms.has('instagram') &&
                    styles.checkboxSelected,
                  ]}>
                  {selectedPlatforms.has('instagram') && (
                    <Check size={14} color={APP_COLORS.onPrimary} />
                  )}
                </View>
              </View>
              <Text style={styles.platformName}>Instagram</Text>
              {!hasPlatformAccount('instagram') && (
                <Text style={styles.notConnectedText}>
                  Connect Account First
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.platformCard,
                selectedPlatforms.has('facebook') &&
                styles.platformCardSelected,
                !hasPlatformAccount('facebook') && styles.platformCardDisabled,
              ]}
              disabled={!hasPlatformAccount('facebook')}
              onPress={() => togglePlatform('facebook')}
              activeOpacity={0.8}>
              <View style={styles.platformCardHeader}>
                <View
                  style={[
                    styles.platformIconBox,
                    { backgroundColor: `${APP_COLORS.facebook}15` },
                  ]}>
                  <Users size={24} color={APP_COLORS.facebook} />
                </View>
                <View
                  style={[
                    styles.checkbox,
                    selectedPlatforms.has('facebook') &&
                    styles.checkboxSelected,
                  ]}>
                  {selectedPlatforms.has('facebook') && (
                    <Check size={14} color={APP_COLORS.onPrimary} />
                  )}
                </View>
              </View>
              <Text style={styles.platformName}>Facebook</Text>
              {!hasPlatformAccount('facebook') && (
                <Text style={styles.notConnectedText}>
                  Connect Account First
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.platformCard,
                selectedPlatforms.has('youtube') && styles.platformCardSelected,
                !hasPlatformAccount('youtube') && styles.platformCardDisabled,
              ]}
              disabled={!hasPlatformAccount('youtube')}
              onPress={() => togglePlatform('youtube')}
              activeOpacity={0.8}>
              <View style={styles.platformCardHeader}>
                <View
                  style={[
                    styles.platformIconBox,
                    { backgroundColor: `${APP_COLORS.youtube}15` },
                  ]}>
                  <Youtube size={24} color={APP_COLORS.youtube} />
                </View>
                <View
                  style={[
                    styles.checkbox,
                    selectedPlatforms.has('youtube') && styles.checkboxSelected,
                  ]}>
                  {selectedPlatforms.has('youtube') && (
                    <Check size={14} color={APP_COLORS.onPrimary} />
                  )}
                </View>
              </View>
              <Text style={styles.platformName}>YouTube</Text>
              {!hasPlatformAccount('youtube') && (
                <Text style={styles.notConnectedText}>
                  Connect Account First
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Media Upload Area */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>MEDIA PREVIEW</Text>
              <TouchableOpacity onPress={pickMedia}>
                <Text style={styles.addMoreText}>Add more</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mediaGrid}>
              {mediaAssets.length > 0 ? (
                <>
                  {/* Main Preview (first asset) */}
                  <TouchableOpacity
                    style={styles.mainMediaContainer}
                    onPress={pickMedia}
                    activeOpacity={0.9}>
                    <Image
                      source={{ uri: mediaAssets[0].uri }}
                      style={styles.mainMedia}
                    />
                    <View style={styles.mediaOverlay}>
                      <Edit2 size={32} color={APP_COLORS.onPrimary} />
                    </View>
                    <TouchableOpacity
                      style={styles.removeMediaFab}
                      onPress={() => removeMedia(0)}>
                      <X size={16} color={APP_COLORS.onPrimary} />
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Thumbnails (remaining assets) */}
                  <View style={styles.sideMediaContainer}>
                    {mediaAssets.slice(1, 3).map((asset, index) => (
                      <View key={index + 1} style={styles.sideThumbWrapper}>
                        <Image
                          source={{ uri: asset.uri }}
                          style={styles.sideMedia}
                        />
                        <TouchableOpacity
                          style={styles.removeMediaSmall}
                          onPress={() => removeMedia(index + 1)}>
                          <X size={12} color={APP_COLORS.onPrimary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {/* Add More Button if we have media but < 3 */}
                    {mediaAssets.length < 3 && (
                      <TouchableOpacity
                        style={styles.uploadBoxSmall}
                        onPress={pickMedia}>
                        <ImagePlus
                          size={24}
                          color={APP_COLORS.onSurfaceVariant}
                        />
                        <Text style={styles.uploadTextSmall}>Upload</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              ) : (
                /* Empty State */
                <>
                  <TouchableOpacity
                    style={styles.mainEmptyBox}
                    onPress={pickMedia}>
                    <ImageIcon size={48} color="rgba(71, 69, 84, 0.2)" />
                  </TouchableOpacity>
                  <View style={styles.sideMediaContainer}>
                    <TouchableOpacity
                      style={styles.uploadBoxSmall}
                      onPress={pickMedia}>
                      <ImagePlus
                        size={24}
                        color={APP_COLORS.onSurfaceVariant}
                      />
                      <Text style={styles.uploadTextSmall}>Upload</Text>
                    </TouchableOpacity>
                    <View style={styles.emptyBoxSmall}>
                      <ImageIcon size={24} color="rgba(71, 69, 84, 0.2)" />
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Caption Editor */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>CAPTION</Text>
              <Text style={styles.charCount}>{caption.length} / 2200</Text>
            </View>
            <View style={styles.captionContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="What's the story behind this post?"
                placeholderTextColor={APP_COLORS.outline}
                multiline
                numberOfLines={8}
                maxLength={2200}
                value={caption}
                onChangeText={setCaption}
              />
              <View style={styles.captionTools}>
                <TouchableOpacity style={styles.toolBtn}>
                  <Smile size={24} color={APP_COLORS.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn}>
                  <AtSign size={24} color={APP_COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Advanced Settings */}
          <View style={styles.advancedSection}>
            <TouchableOpacity
              style={styles.advancedRow}
              activeOpacity={0.7}
              onPress={() => setLocationModalVisible(true)}>
              <View style={styles.advancedLeft}>
                <MapPin size={24} color={APP_COLORS.onSurfaceVariant} />
                <Text style={styles.advancedText}>Add Location</Text>
              </View>
              <ChevronRight size={24} color={APP_COLORS.outline} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.advancedRow}
              activeOpacity={0.7}
              onPress={() => setTagsModalVisible(true)}>
              <View style={styles.advancedLeft}>
                <Tag size={24} color={APP_COLORS.onSurfaceVariant} />
                <Text style={styles.advancedText}>Tag People</Text>
              </View>
              <ChevronRight size={24} color={APP_COLORS.outline} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.advancedRow}
              activeOpacity={0.7}
              onPress={() => {
                setAdvancedModalVisible(true);
              }}>
              <View style={styles.advancedLeft}>
                <Sliders size={24} color={APP_COLORS.onSurfaceVariant} />
                <Text style={styles.advancedText}>Advanced Settings</Text>
              </View>
              <ChevronRight size={24} color={APP_COLORS.outline} />
            </TouchableOpacity>
            {/* Modal Components */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={locationModalVisible}
              onRequestClose={() => setLocationModalVisible(false)}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add Location</Text>
                    <TouchableOpacity
                      onPress={() => setLocationModalVisible(false)}>
                      <X size={24} color={APP_COLORS.onSurface} />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Search locations..."
                    placeholderTextColor={APP_COLORS.onSurfaceVariant}
                    value={location}
                    onChangeText={setLocation}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={() => setLocationModalVisible(false)}>
                    <Text style={styles.modalSaveButtonText}>
                      Save Location
                    </Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Modal>

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
                    <Text style={styles.modalTitle}>Tag People</Text>
                    <TouchableOpacity
                      onPress={() => setTagsModalVisible(false)}>
                      <X size={24} color={APP_COLORS.onSurface} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                      placeholder="Type username..."
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

                  <View style={styles.tagsList}>
                    {tags.map((tag, idx) => (
                      <View key={idx} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>@{tag}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            setTags(tags.filter((_, i) => i !== idx))
                          }>
                          <X
                            size={14}
                            color={APP_COLORS.primary}
                            style={{ marginLeft: 4 }}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={() => setTagsModalVisible(false)}>
                    <Text style={styles.modalSaveButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={advancedModalVisible}
              onRequestClose={() => setAdvancedModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Advanced Settings</Text>
                    <TouchableOpacity
                      onPress={() => setAdvancedModalVisible(false)}>
                      <X size={24} color={APP_COLORS.onSurface} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingRow}>
                    <View>
                      <Text style={styles.settingTitle}>Hide Like Count</Text>
                      <Text style={styles.settingSubtitle}>
                        Only you will see the total number of likes on this
                        post.
                      </Text>
                    </View>
                    <Switch
                      value={hideLikes}
                      onValueChange={setHideLikes}
                      trackColor={{ true: APP_COLORS.primary }}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <View>
                      <Text style={styles.settingTitle}>
                        Turn Off Commenting
                      </Text>
                      <Text style={styles.settingSubtitle}>
                        You can change this later from the post menu.
                      </Text>
                    </View>
                    <Switch
                      value={turnOffComments}
                      onValueChange={setTurnOffComments}
                      trackColor={{ true: APP_COLORS.primary }}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.advancedRow,
                      { paddingHorizontal: 0, marginTop: 16 },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setAdvancedModalVisible(false);
                      setTimeout(() => setShowDatePicker(true), 300);
                    }}>
                    <View style={styles.advancedLeft}>
                      <Calendar size={24} color={APP_COLORS.onSurfaceVariant} />
                      <Text style={styles.advancedText}>
                        Adjust Schedule Time
                      </Text>
                    </View>
                    <ChevronRight size={24} color={APP_COLORS.outline} />
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
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
                // Cancelled flow
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
                // Cancelled flow
                setIsScheduled(false);
              }
            }}
          />
        )}

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Floating Action Footer (Post/Schedule) */}
      <View
        style={[
          styles.footerNav,
          { paddingBottom: Platform.OS === 'ios' ? 104 : 86 },
        ]}>
        {isSubmitting ? (
          <View style={styles.loadingFooter}>
            <ActivityIndicator color={APP_COLORS.primary} size="large" />
            <Text style={styles.loadingText}>
              {isUploading
                ? 'Uploading media...'
                : 'Publishing your editorial...'}
            </Text>
          </View>
        ) : (
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.scheduleButton}
              activeOpacity={0.8}
              onPress={handleSchedulePost}
              disabled={selectedPlatforms.size === 0}>
              <Calendar
                size={20}
                color={APP_COLORS.onSurface}
                strokeWidth={2.5}
              />
              <Text style={styles.scheduleButtonText}>Schedule Post</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.postNowButton}
              activeOpacity={0.8}
              onPress={handlePostNow}
              disabled={selectedPlatforms.size === 0}>
              <Send size={20} color={APP_COLORS.onPrimary} strokeWidth={2.5} />
              <Text style={styles.postNowButtonText}>Post Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    marginBottom: 32,
  },
  breadcrumb: {
    fontSize: 11,
    fontWeight: '800',
    color: APP_COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    letterSpacing: -1,
    lineHeight: 40,
  },
  formContainer: {
    gap: 40,
  },
  platformSection: {
    flexDirection: 'row',
    gap: 16,
  },
  platformCard: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceContainerLowest,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 215, 0.15)', // ghost-border
    shadowColor: '#1c1b1b',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 16,
  },
  platformCardSelected: {
    borderColor: APP_COLORS.primary,
    backgroundColor: '#FAF9FF',
  },
  platformCardDisabled: {
    opacity: 0.5,
    backgroundColor: APP_COLORS.surfaceContainerLow,
  },
  platformCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: APP_COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
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
  mainEmptyBox: {
    flex: 2,
    borderRadius: 24,
    backgroundColor: 'rgba(229, 226, 225, 0.3)', // surface-container-highest/30
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'relative',
  },
  captionInput: {
    backgroundColor: APP_COLORS.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    paddingBottom: 60, // space for icons
    fontSize: 18,
    color: APP_COLORS.onSurface,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  captionTools: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  toolBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'transparent', // hover:bg-surface-container-high isn't great in RN, keep transparent
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
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(83, 65, 205, 0.1)', // primary 10%
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagChipText: {
    color: APP_COLORS.primary,
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
});
