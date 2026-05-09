import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, View, Text } from 'react-native';
import { useNotificationsStore } from '../../stores/notificationsStore';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = colorScheme === 'dark' ? '#60a5fa' : '#2563eb';
  const inactiveColor = colorScheme === 'dark' ? '#9ca3af' : '#6b7280';
  const unreadCount = useNotificationsStore((state) => state.unreadCount);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: focused ? 'home' : 'home-outline',
            map: focused ? 'map' : 'map-outline',
            projects: focused ? 'construct' : 'construct-outline',
            tasks: focused ? 'list' : 'list-outline',
            safety: focused ? 'shield-checkmark' : 'shield-checkmark-outline',
            team: focused ? 'people' : 'people-outline',
            profile: focused ? 'person' : 'person-outline',
          };
          
          const iconName = icons[route.name] || 'help';
          
          // Show badge for notifications tab
          if (route.name === 'notifications') {
            return (
              <View>
                <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={focused ? tintColor : inactiveColor} />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                )}
              </View>
            );
          }
          
          return <Ionicons name={iconName} size={size} color={focused ? tintColor : inactiveColor} />;
        },
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="safety" options={{ title: 'Safety' }} />
      <Tabs.Screen name="team" options={{ title: 'Team' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
