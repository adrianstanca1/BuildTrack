import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = colorScheme === 'dark' ? '#60a5fa' : '#2563eb';
  const inactiveColor = colorScheme === 'dark' ? '#9ca3af' : '#6b7280';

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: focused ? 'home' : 'home-outline',
            projects: focused ? 'construct' : 'construct-outline',
            tasks: focused ? 'list' : 'list-outline',
            safety: focused ? 'shield-checkmark' : 'shield-checkmark-outline',
            team: focused ? 'people' : 'people-outline',
          };
          return <Ionicons name={icons[route.name] || 'help'} size={size} color={focused ? tintColor : inactiveColor} />;
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
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="safety" options={{ title: 'Safety' }} />
      <Tabs.Screen name="team" options={{ title: 'Team' }} />
    </Tabs>
  );
}
