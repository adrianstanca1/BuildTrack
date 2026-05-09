import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Redirect href="/(onboarding)/auth" />;
  }

  // Optional: restrict to admin role
  // if (!isAdmin) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1F2937' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="users"
        options={{ title: 'User Management' }}
      />
      <Stack.Screen
        name="projects"
        options={{ title: 'All Projects' }}
      />
    </Stack>
  );
}
