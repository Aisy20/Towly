import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';

// expo-notifications requires a physical device or simulator for push tokens.
// On web it's a no-op for push tokens but in-app notifications still work.

export function usePushNotifications() {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!user) return;

    // Push token registration — native only (web has no Expo push token)
    if (Platform.OS !== 'web') {
      (async () => {
        try {
          const Notifications = await import('expo-notifications');
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldShowBanner: true,
              shouldShowList: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            }),
          });

          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') return;

          const token = await Notifications.getExpoPushTokenAsync();
          await apiClient.post('/auth/push-token', { expoPushToken: token.data }).catch(() => {});
        } catch {
          // Ignore — dev environment may not have a project ID configured
        }
      })();
    }

    // In-app notification response handler — works on all platforms
    let sub: { remove: () => void } | null = null;
    (async () => {
      try {
        const Notifications = await import('expo-notifications');
        sub = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as { reportId?: string };
          if (data.reportId) {
            navigation.navigate('ReportDetail', { id: data.reportId });
          }
        });
      } catch {}
    })();

    return () => { sub?.remove(); };
  }, [user]);
}
