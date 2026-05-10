import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center p-6">
      <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</Text>
      <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
        The screen you&apos;re looking for doesn&apos;t exist.
      </Text>
      <Link href="/" asChild>
        <Pressable className="mt-6 bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Go Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
