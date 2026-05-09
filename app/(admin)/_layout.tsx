import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useBillingStore } from '../../stores/billingStore';
import { Redirect } from 'expo-router';
import { useColorScheme, View, Text } from 'react-native';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { user } = useAuth();
  const isAdmin = useBillingStore((s) => s.isAdmin);
  const checkAdminRole = useBillingStore((s) => s.checkAdminRole);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user, checkAdminRole]);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900"
      >
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2"
        >Access Denied</Text>
        <Text className="text-sm text-gray-500"
        >You need admin privileges to view this page.</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: isDark ? '#18181b' : '#ffffff' },
        headerTintColor: isDark ? '#ffffff' : '#111827',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin Dashboard', headerBackVisible: false }} />
      <Stack.Screen name="users" options={{ title: 'Users' }} />
      <Stack.Screen name="projects" options={{ title: 'Projects' }} />
      <Stack.Screen name="teams" options={{ title: 'Teams' }} />
      <Stack.Screen name="billing" options={{ title: 'Billing' }} />
    </Stack>
  );
}
