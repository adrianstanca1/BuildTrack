import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AdminLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#18181b' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#111827',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="ml-2 p-2">
            <Ionicons
              name="chevron-back"
              size={24}
              color={colorScheme === 'dark' ? '#ffffff' : '#111827'}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: 'Admin Dashboard' }}
      />
    </Stack>
  );
}
