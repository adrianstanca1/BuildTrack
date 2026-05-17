import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationsStore, mapDbNotification } from '../../stores/notificationsStore';
import { NotificationCard } from '../../components/notifications/NotificationCard';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import * as Notifications from 'expo-notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    notifications,
    isLoading,
    error,
    unreadCount,
    lastRefreshed,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setLoading,
    setError,
    setLastRefreshed,
    getGroupedNotifications,
  } = useNotificationsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: dbError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      const mapped = (data || []).map(mapDbNotification);
      setNotifications(mapped);
      setLastRefreshed(Date.now());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user, setNotifications, setLoading, setError, setLastRefreshed]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = mapDbNotification(payload.new);
          addNotification(notification);

          // Also show a local notification
          Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.body,
              data: {
                type: notification.type,
                relatedId: notification.relatedId,
                notificationId: notification.id,
              },
            },
            trigger: null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotification]);

  // Initial fetch
  useEffect(() => {
    if (!lastRefreshed) {
      fetchNotifications();
    }
  }, [fetchNotifications, lastRefreshed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handlePress = useCallback(
    async (notification: { id: string; type: string; relatedId?: string; read: boolean }) => {
      if (!notification.read) {
        markAsRead(notification.id);
        try {
          await supabase.from('notifications').update({ read: true }).eq('id', notification.id);
        } catch (_e) {
          // silent fail — already updated locally
        }
      }

      if (notification.type === 'project' && notification.relatedId) {
        router.push(`/(modals)/project-details?id=${notification.relatedId}` as any);
      } else if (notification.type === 'task' && notification.relatedId) {
        router.push(`/(modals)/task-details?id=${notification.relatedId}` as any);
      } else if (notification.type === 'safety' && notification.relatedId) {
        router.push(`/(modals)/safety-report?id=${notification.relatedId}` as any);
      }
      // team / general: no deep link
    },
    [markAsRead, router]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const { error: dbError } = await supabase.from('notifications').delete().eq('id', id);
        if (dbError) throw dbError;
        deleteNotification(id);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to delete notification');
      } finally {
        setDeletingId(null);
      }
    },
    [deleteNotification]
  );

  const handleMarkAllRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;
    markAllAsRead();
    try {
      await supabase.from('notifications').update({ read: true }).eq('read', false);
    } catch (_e) {
      // silent fail — already updated locally
    }
  }, [user, unreadCount, markAllAsRead]);

  const grouped = getGroupedNotifications();
  const groupKeys = Object.keys(grouped);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllRead}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">Mark all read</Text>
            </Pressable>
          )}
        </View>
      </View>

      {isLoading && !refreshing && notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">Loading notifications…</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
          <Text className="text-gray-900 dark:text-white text-lg font-semibold mt-3">Something went wrong</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-1">{error}</Text>
          <Pressable
            onPress={fetchNotifications}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </Pressable>
        </View>
      ) : notifications.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#fff' : '#000'} />
          }
        >
          <Ionicons name="notifications-off" size={56} color={isDark ? '#374151' : '#d1d5db'} />
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">No notifications</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center px-8">
            Pull down to refresh or check back later for updates.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#fff' : '#000'} />
          }
        >
          {groupKeys.map((group) => (
            <View key={group} className="mt-4">
              <Text className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                {group}
              </Text>
              {grouped[group].map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={handlePress}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          ))}
          {/* Bottom spacer */}
          <View className="h-6" />
        </ScrollView>
      )}

      {deletingId && (
        <View className="absolute inset-0 justify-center items-center bg-black/20">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}
