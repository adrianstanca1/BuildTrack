/**
 * Push notification registration and handling for BuildTrack.
 * Registers Expo push tokens, stores them in Supabase, and handles incoming notifications.
 */

import * as Notifications from 'expo-notifications';
// @ts-ignore — expo-device types resolve at build time via Expo
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

let currentPushToken: string | null = null;

// Configure notification behaviour globally
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request permissions and register for push notifications.
 * Returns the Expo push token string, or null if unavailable.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
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

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || undefined,
    });
    currentPushToken = tokenData.data;

    // Persist token in the push_tokens table via Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user && currentPushToken) {
      const { error } = await supabase.from('push_tokens').upsert(
        {
          user_id: user.id,
          token: currentPushToken,
          platform: Platform.OS as 'ios' | 'android' | 'web',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );
      if (error) {
        console.error('[Push] Failed to store push token:', error);
      } else {
        console.log('[Push] Token stored successfully');
      }
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return currentPushToken;
  } catch (err: any) {
    console.error('[Push] Failed to get push token:', err);
    return null;
  }
}

export function getPushToken(): string | null {
  return currentPushToken;
}

/**
 * Remove the push token from Supabase (call on logout).
 */
export async function unregisterPushTokenAsync(): Promise<void> {
  if (!currentPushToken) return;
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('token', currentPushToken);
  if (error) {
    console.error('[Push] Failed to delete push token:', error);
  } else {
    console.log('[Push] Token unregistered');
  }
  currentPushToken = null;
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
