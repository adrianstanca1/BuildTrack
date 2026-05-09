import { View, Text, ScrollView, Pressable, useColorScheme, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectsStore } from '../../stores/projectsStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useTeamStore } from '../../stores/teamStore';
import { useNotificationsStore } from '../../stores/notificationsStore';
import { useSyncStore } from '../../stores/syncStore';
import { colors } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from '../../constants/storage';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, signOut } = useAuth();
  const { projects } = useProjectsStore();
  const { tasks } = useTasksStore();
  const { workers } = useTeamStore();
  const { unreadCount } = useNotificationsStore();
  const { pendingCount, lastSyncRelative, isOnline } = useSyncStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again on next launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            Alert.alert('Done', 'Onboarding will be shown on next app launch.');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'construct' as const,
      label: 'My Projects',
      value: projects.length.toString(),
      color: colors.primary,
      onPress: () => router.push('/projects'),
    },
    {
      icon: 'list' as const,
      label: 'My Tasks',
      value: tasks.length.toString(),
      color: colors.success,
      onPress: () => router.push('/tasks'),
    },
    {
      icon: 'people' as const,
      label: 'Team Members',
      value: workers.length.toString(),
      color: colors.info,
      onPress: () => router.push('/team'),
    },
    {
      icon: 'notifications' as const,
      label: 'Notifications',
      value: unreadCount > 0 ? `${unreadCount} unread` : 'All caught up',
      color: colors.warning,
      onPress: () => router.push('/notifications'),
    },
    {
      icon: 'settings' as const,
      label: 'Settings',
      value: '',
      color: colors.gray,
      onPress: () => router.push('/settings'),
    },
    {
      icon: 'shield-checkmark' as const,
      label: 'Admin Dashboard',
      value: '',
      color: '#7c3aed',
      onPress: () => router.push('/admin/dashboard'),
    },
  ];

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`px-6 pt-14 pb-6 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-blue-600 items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            {user?.email || 'Not signed in'}
          </Text>
        </View>

        {/* Sync Status */}
        <View className="flex-row justify-center mt-4 space-x-4">
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          {pendingCount > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="cloud-upload" size={12} color={colors.warning} />
              <Text className="text-xs text-yellow-600 ml-1">{pendingCount} pending</Text>
            </View>
          )}
          <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            Last sync: {lastSyncRelative || 'Never'}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View className="px-4 mt-4">
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            className={`flex-row items-center p-4 mb-2 rounded-xl ${
              isDark ? 'bg-zinc-900' : 'bg-white'
            }`}
          >
            <View
              className="w-10 h-10 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: item.color + '15' }}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.label}
              </Text>
              {item.value ? (
                <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{item.value}</Text>
              ) : null}
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#52525b' : '#d1d5db'}
            />
          </Pressable>
        ))}
      </View>

      {/* Bottom Actions */}
      <View className="px-4 mt-4 mb-8">
        <Pressable
          onPress={handleResetOnboarding}
          className={`flex-row items-center p-4 mb-2 rounded-xl ${
            isDark ? 'bg-zinc-900' : 'bg-white'
          }`}
        >
          <View className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 items-center justify-center mr-3">
            <Ionicons name="refresh" size={20} color={colors.gray} />
          </View>
          <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reset Onboarding
          </Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          className="flex-row items-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20"
        >
          <View className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 items-center justify-center mr-3">
            <Ionicons name="log-out" size={20} color={colors.danger} />
          </View>
          <Text className="text-base font-medium text-red-600 dark:text-red-400">
            Sign Out
          </Text>
        </Pressable>
      </View>

      {/* Version */}
      <View className="items-center pb-8">
        <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
          BuildTrack v1.1.0
        </Text>
      </View>
    </ScrollView>
  );
}
