import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Redirect } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AdminLayout() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!user) {
    return <Redirect href="/auth/login" />;
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
    </Stack>
  );
}
