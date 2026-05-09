import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface NavItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: 'stats-chart', label: 'Overview', path: '/admin' },
  { icon: 'people', label: 'Users', path: '/admin/users' },
  { icon: 'construct', label: 'Projects', path: '/admin/projects' },
  { icon: 'shield-checkmark', label: 'Team', path: '/admin/teams' },
  { icon: 'card', label: 'Billing', path: '/admin/billing' },
];

export function AdminSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="bg-gray-900 h-full py-4">
      <View className="px-4 mb-6">
        <Text className="text-white font-bold text-lg">BuildTrack</Text>
        {!collapsed && (
          <Text className="text-gray-400 text-xs mt-1">Admin Panel</Text>
        )}
      </View>

      <ScrollView>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path as any)}
              className={`flex-row items-center px-4 py-3 mx-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'bg-transparent'
              }`}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? '#ffffff' : '#9ca3af'}
              />
              {!collapsed && (
                <Text
                  className={`ml-3 text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
