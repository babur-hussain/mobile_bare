import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react-native';

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
  const {post} = (route.params as any) || {};

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
          <View style={{width: 40}} />
        </View>
        <View style={styles.emptyContainer}>
          <Text>Post not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFailed = post.status.includes('FAILED');
  const isScheduled = post.status.includes('SCHEDULED');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <ArrowLeft size={24} color={APP_COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Media Preview */}
        {post.img ? (
          <Image source={{uri: post.img}} style={styles.mediaPreview} />
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
                {post.status}
              </Text>
            </View>
          </View>

          {isFailed && (
            <View style={styles.errorBox}>
              <AlertCircle size={20} color={APP_COLORS.error} />
              <View style={{flex: 1}}>
                <Text style={styles.errorTitle}>Publishing Failed</Text>
                <Text style={styles.errorDescription}>
                  {post.errorReason ||
                    'The server could not publish this post. Please check your account connections or try again later.'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.label}>PLATFORM</Text>
            <Text style={styles.valueText}>{post.platform}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>TIME</Text>
            <Text style={styles.valueText}>{post.time}</Text>
          </View>
        </View>

        {/* Caption Card */}
        <View style={styles.captionCard}>
          <Text style={styles.label}>CAPTION</Text>
          <Text style={styles.captionText}>{post.title}</Text>
        </View>

        {/* Action Button (Optional) */}
        {!isFailed && !isScheduled && (
          <TouchableOpacity style={styles.actionButton}>
            <ExternalLink size={20} color={APP_COLORS.onPrimary} />
            <Text style={styles.actionButtonText}>View on {post.platform}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
});
