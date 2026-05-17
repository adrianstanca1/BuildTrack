import { View, Text, Pressable, useColorScheme , Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useRef } from 'react';
import { AppNotification, NotificationType } from '../../stores/notificationsStore';
import { colors } from '../../constants/colors';

interface NotificationCardProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
  onDelete: (id: string) => void;
}

const typeConfig: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  task: {
    icon: 'list',
    color: colors.info,
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  project: {
    icon: 'construct',
    color: colors.primary,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  safety: {
    icon: 'shield-checkmark',
    color: colors.danger,
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  team: {
    icon: 'people',
    color: colors.success,
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  general: {
    icon: 'notifications',
    color: colors.gray,
    bg: 'bg-gray-50 dark:bg-gray-800/50',
  },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function NotificationCard({ notification, onPress, onDelete }: NotificationCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = typeConfig[notification.type];
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = (_: any, dragX: Animated.AnimatedInterpolation<string | number>) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Pressable
        onPress={() => {
          swipeRef.current?.close();
          onDelete(notification.id);
        }}
        className="justify-center items-center bg-red-500 w-20 rounded-r-xl"
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={22} color="#fff" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} friction={2}>
      <Pressable
        onPress={() => onPress(notification)}
        className={`flex-row items-start p-4 mx-4 mb-2 rounded-xl border ${
          notification.read
            ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
            : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30'
        }`}
      >
        {/* Icon */}
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${config.bg}`}>
          <Ionicons name={config.icon} size={18} color={config.color} />
        </View>

        {/* Content */}
        <View className="flex-1 pr-2">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-sm font-semibold flex-1 mr-2 ${
                notification.read
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-900 dark:text-white'
              }`}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {formatTimeAgo(notification.createdAt)}
            </Text>
          </View>

          <Text
            className={`text-sm mt-0.5 ${
              notification.read
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-gray-600 dark:text-gray-300'
            }`}
            numberOfLines={2}
          >
            {notification.body}
          </Text>

          {!notification.read && (
            <View className="flex-row items-center mt-1.5">
              <View className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
              <Text className="text-xs text-blue-500 font-medium">Unread</Text>
            </View>
          )}
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? '#4b5563' : '#9ca3af'}
          style={{ marginTop: 2 }}
        />
      </Pressable>
    </Swipeable>
  );
}
