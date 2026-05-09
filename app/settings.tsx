import { View, Text, TextInput, ScrollView, Pressable, useColorScheme, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notif = await AsyncStorage.getItem('settings_notifications');
      const sync = await AsyncStorage.getItem('settings_autoSync');
      const haptic = await AsyncStorage.getItem('settings_haptic');

      if (notif !== null) setNotificationsEnabled(notif === 'true');
      if (sync !== null) setAutoSyncEnabled(sync === 'true');
      if (haptic !== null) setHapticFeedback(haptic === 'true');
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(`settings_${key}`, value.toString());
    } catch (e) {
      console.error('Failed to save setting:', e);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all local data and re-sync from the server.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const syncKeys = keys.filter(k => k.startsWith('buildtrack-') || k.startsWith('sync-'));
              await AsyncStorage.multiRemove(syncKeys);
              Alert.alert('Success', 'Cache cleared. Restart the app to re-sync.');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications' as const,
          label: 'Push Notifications',
          color: colors.primary,
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: (val: boolean) => {
            setNotificationsEnabled(val);
            saveSetting('notifications', val);
          },
        },
        {
          icon: 'sync' as const,
          label: 'Auto Sync',
          color: colors.success,
          type: 'toggle' as const,
          value: autoSyncEnabled,
          onToggle: (val: boolean) => {
            setAutoSyncEnabled(val);
            saveSetting('autoSync', val);
          },
        },
        {
          icon: 'moon' as const,
          label: 'Dark Mode',
          color: '#7c3aed',
          type: 'toggle' as const,
          value: darkModeEnabled,
          onToggle: (val: boolean) => {
            setDarkModeEnabled(val);
            saveSetting('darkMode', val);
            Alert.alert('Note', 'App restart required for theme change to take full effect.');
          },
        },
        {
          icon: 'pulse' as const,
          label: 'Haptic Feedback',
          color: colors.warning,
          type: 'toggle' as const,
          value: hapticFeedback,
          onToggle: (val: boolean) => {
            setHapticFeedback(val);
            saveSetting('haptic', val);
          },
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: 'trash' as const,
          label: 'Clear Cache',
          color: colors.danger,
          type: 'button' as const,
          onPress: handleClearCache,
        },
        {
          icon: 'cloud-download' as const,
          label: 'Export Data',
          color: colors.info,
          type: 'button' as const,
          onPress: () => Alert.alert('Coming Soon', 'Data export will be available in a future update.'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle' as const,
          label: 'Version',
          color: colors.gray,
          type: 'value' as const,
          value: '1.1.0',
        },
        {
          icon: 'document-text' as const,
          label: 'Privacy Policy',
          color: colors.gray,
          type: 'button' as const,
          onPress: () => {
            const url = 'https://buildtrack.cortexbuildpro.com/privacy';
            Alert.alert('Privacy Policy', `View at:\n${url}\n\n(Replace with your actual privacy policy URL before App Store submission)`);
          },
        },
        {
          icon: 'help-circle' as const,
          label: 'Help & Support',
          color: colors.gray,
          type: 'button' as const,
          onPress: () => Alert.alert('Support', 'Email: adrian.stanca1@gmail.com'),
        },
      ],
    },
  ];

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`px-6 pt-14 pb-4 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : '#111'} />
          </Pressable>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</Text>
        </View>
      </View>

      {/* Sections */}
      <View className="px-4 mt-4">
        {settingSections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text className={`text-xs font-semibold uppercase tracking-wider mb-2 px-2 ${
              isDark ? 'text-zinc-500' : 'text-gray-400'
            }`}>
              {section.title}
            </Text>

            <View className={`rounded-xl ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  onPress={item.type === 'button' ? item.onPress : undefined}
                  className={`flex-row items-center p-4 ${
                    index !== section.items.length - 1
                      ? `border-b ${isDark ? 'border-zinc-800' : 'border-gray-100'}`
                      : ''
                  }`}
                >
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <Ionicons name={item.icon} size={16} color={item.color} />
                  </View>

                  <Text className={`flex-1 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.label}
                  </Text>

                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                    />
                  )}

                  {item.type === 'value' && (
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{item.value}</Text>
                  )}

                  {item.type === 'button' && (
                    <Ionicons name="chevron-forward" size={20} color={isDark ? '#52525b' : '#d1d5db'} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
