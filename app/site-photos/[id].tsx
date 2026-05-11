import { View, Text, ScrollView, Pressable, Alert, useColorScheme, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSitePhotosStore } from '../../stores/sitePhotosStore';
import { Card } from '../../components/ui/Card';

export default function SitePhotoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { sitePhotos, deleteSitePhoto } = useSitePhotosStore();
  const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('en-GB') : 'N/A';

  const item = sitePhotos.find((e) => e.id === id);

  if (!item) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="camera-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-400 mt-4">SitePhoto not found</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete SitePhoto',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSitePhoto(item.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1" numberOfLines={1}>
            {item.caption || 'Site Photo'}
          </Text>
          <Pressable onPress={() => router.push(`/site-photos/edit?id=${item.id}`)} className="p-2 mr-2">
            <Ionicons name="create-outline" size={20} color={isDark ? '#60a5fa' : '#2563eb'} />
          </Pressable>
          <Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>

        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: '#111827', height: 260 }}>
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="image-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 mt-2">No photo</Text>
            </View>
          )}
        </View>

        <Card className="mt-4">
          <View className="flex-row items-center py-2">
            <Ionicons name="text-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Title</Text>
              <Text className="text-sm font-medium text-gray-900">{item.caption || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="location-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Location</Text>
              <Text className="text-sm font-medium text-gray-900">{item.location || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="person-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Taken By</Text>
              <Text className="text-sm font-medium text-gray-900">{item.uploadedBy || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="calendar-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Taken At</Text>
              <Text className="text-sm font-medium text-gray-900">{item.createdAt || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="briefcase-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Project</Text>
              <Text className="text-sm font-medium text-gray-900">{item.projectName || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="pricetag-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Tags</Text>
              <Text className="text-sm font-medium text-gray-900">{item.tags?.join(", ") || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="calendar-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Created</Text>
              <Text className="text-sm font-medium text-gray-900">{fmtDate(item.createdAt)}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
