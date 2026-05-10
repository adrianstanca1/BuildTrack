import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSitePhotosStore } from '../../stores/sitePhotosStore';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const numColumns = 2;
const gap = 12;
const itemSize = (width - 32 - gap * (numColumns - 1)) / numColumns;

export default function SitePhotosScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { sitePhotos, fetchSitePhotos, loading } = useSitePhotosStore();
  const [filterTag, setFilterTag] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const allTags = Array.from(new Set(sitePhotos.flatMap((p) => p.tags)));

  const filteredPhotos = filterTag === 'all'
    ? sitePhotos
    : sitePhotos.filter((p) => p.tags.includes(filterTag));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSitePhotos();
    setRefreshing(false);
  }, [fetchSitePhotos]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Site Photos</Text>
            <Pressable
              onPress={() => router.push('/quick-actions/photo')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <View className="flex-row mb-4 flex-wrap">
              <Pressable
                onPress={() => setFilterTag('all')}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterTag === 'all' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterTag === 'all' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  All
                </Text>
              </Pressable>
              {allTags.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => setFilterTag(tag)}
                  className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                    filterTag === tag ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${filterTag === tag ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <FlatList
            data={filteredPhotos}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/site-photos/${item.id}`)}
                style={{ width: itemSize, marginBottom: gap, marginRight: gap }}
                className="rounded-xl overflow-hidden bg-white dark:bg-gray-800"
              >
                <View style={{ width: itemSize, height: itemSize, backgroundColor: isDark ? '#1f2937' : '#e5e7eb' }}>
                  {item.photoUrl && item.photoUrl !== 'placeholder' ? (
                    <Image
                      source={{ uri: item.photoUrl }}
                      style={{ width: itemSize, height: itemSize }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons name="image-outline" size={32} color={colors.gray} />
                    </View>
                  )}
                </View>
                <View className="p-2">
                  <Text className="text-xs font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                    {item.caption || 'Untitled'}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                    {item.projectName}
                  </Text>
                  {item.tags.length > 0 && (
                    <View className="flex-row flex-wrap mt-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <View key={tag} className="bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded mr-1">
                          <Text className="text-[10px] text-blue-700 dark:text-blue-400">{tag}</Text>
                        </View>
                      ))}
                      {item.tags.length > 2 && (
                        <Text className="text-[10px] text-gray-500">+{item.tags.length - 2}</Text>
                      )}
                    </View>
                  )}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="items-center py-12" style={{ width: width - 32 }}>
                <Ionicons name="images-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterTag !== 'all'
                    ? `No photos tagged "${filterTag}"`
                    : 'No site photos yet.\nTap "New" to add one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
