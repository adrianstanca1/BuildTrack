import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationsStore, mapDbNotification } from '../stores/notificationsStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

export function useNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotificationsStore();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = (Notifications as any).addNotificationReceivedListener?.(
      (notification: any) => {
        console.log('Notification received:', notification);
      }
    ) || { remove: () => {} };

    responseListener.current = (Notifications as any).addNotificationResponseReceivedListener?.(
      (response: any) => {
        const data = response.notification.request.content.data as {
          type?: string;
          relatedId?: string;
          notificationId?: string;
        };
        console.log('Notification tapped:', data);
      }
    );

    return () => {
      if (notificationListener.current) {
        (Notifications as any).removeNotificationSubscription?.(notificationListener.current);
      }
      if (responseListener.current) {
        (Notifications as any).removeNotificationSubscription?.(responseListener.current);
      }
    };
  }, []);

  const sendLocalNotification = useCallback(
    async (title: string, body: string, data?: Record<string, any>) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'general', ...data },
        },
        trigger: null as any,
      });
    },
    []
  );

  const scheduleNotification = useCallback(
    async (title: string, body: string, date: Date, data?: Record<string, any>) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'scheduled', ...data },
        },
        trigger: { type: 'date', date } as any,
      });
    },
    []
  );

  const sendPushNotification = useCallback(
    async (
      userId: string,
      title: string,
      body: string,
      type: string = 'general',
      relatedId?: string
    ) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          body,
          type,
          related_id: relatedId,
          read: false,
        })
        .select()
        .single();

      if (!error && data) {
        addNotification(mapDbNotification(data));
      }

      return { data, error };
    },
    [user, addNotification]
  );

  const cancelAllScheduled = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  const getBadgeCount = useCallback(async () => {
    return await Notifications.getBadgeCountAsync();
  }, []);

  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  return {
    sendLocalNotification,
    scheduleNotification,
    sendPushNotification,
    cancelAllScheduled,
    getBadgeCount,
    setBadgeCount,
  };
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a365d',
    } as any);
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return;
  }

  try {
    const token = await (Notifications as any).getExpoPushTokenAsync?.() || { data: null };
    console.log('Push token:', token.data);
  } catch (e) {
    console.warn('Could not get push token:', e);
  }
}
