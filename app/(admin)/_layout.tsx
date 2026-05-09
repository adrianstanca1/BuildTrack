import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(onboarding)/auth" />;
  }

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
