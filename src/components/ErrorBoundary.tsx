import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { APP_COLORS } from '../constants/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary — catches unhandled JS render errors and displays
 * a user-friendly fallback instead of a white/blank screen.
 * Required for Play Store production stability.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, you could send this to a crash reporting service
    // e.g. Firebase Crashlytics, Sentry, etc.
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😵</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              The app ran into an unexpected error. Please try again.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.debugBox} nestedScrollEnabled>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
              activeOpacity={0.8}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_COLORS.onSurface,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: APP_COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  debugBox: {
    maxHeight: 120,
    width: '100%',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  debugText: {
    fontSize: 11,
    color: '#991b1b',
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
