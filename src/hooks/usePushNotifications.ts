import { useEffect } from 'react';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import api from '../services/api';

export function usePushNotifications(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) return;

    let unsubscribeTokenRefresh: (() => void) | undefined;

    const setupPushNotifications = async () => {
      try {
        // Request permission handles both iOS and Android 13+
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Push notification permission denied');
          return;
        }

        if (Platform.OS === 'ios' && !messaging().isDeviceRegisteredForRemoteMessages) {
            await messaging().registerDeviceForRemoteMessages();
        }

        const token = await messaging().getToken();
        if (token) {
          await api.patch('/api/v1/auth/fcm-token', { token }).catch(err => console.error('Failed to save FCM token:', err));
        }

        unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
          await api.patch('/api/v1/auth/fcm-token', { token: newToken }).catch(() => {});
        });
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    setupPushNotifications();

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
    });

    return () => {
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
      if (unsubscribeForeground) unsubscribeForeground();
    };
  }, [isAuthenticated]);
}
