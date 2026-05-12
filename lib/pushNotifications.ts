/**
 * Push notification registration and handling for BuildTrack.
 * Registers Expo push tokens, stores them via API, and handles incoming notifications.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from '../services/api';

let pushToken: string | null = null;

/**
 * Request permissions and register for push notifications.
 * Returns the Expo push token string, or null if unavailable.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Push] Must use a physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Notification permission denied');
    return null;
  }

  // Configure notification behaviour
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || undefined,
    });
    pushToken = tokenData.data;

    // Register token with the API
    await apiClient.updateProfile({ push_token: pushToken, platform: Platform.OS });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return pushToken;
  } catch (err: any) {
    console.error('[Push] Failed to get push token:', err);
    return null;
  }
}

export function getPushToken(): string | null {
  return pushToken;
}

/**
 * Listen for push notifications while the app is foregrounded.
 */
export function addPushNotificationListener(
  handler: (notification: Notifications.Notification) => void
): () => void {
  const subscription = Notifications.addNotificationReceivedListener(handler);
  return () => subscription.remove();
}

/**
 * Listen for user taps on notifications.
 */
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(handler);
  return () => subscription.remove();
}
