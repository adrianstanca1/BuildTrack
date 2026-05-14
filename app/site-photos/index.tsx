import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme, Image, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const numColumns = 2;
const gap = 12;
const itemSize = (width - 32 - gap * (numColumns - 1)) / numColumns;

type SitePhoto = {
  id: string;
  project_id: string;
  project_name: string;
  caption: string;
  photo_url: string;
  uploaded_by: string;
  created_at: string;
  location?: string;
  tags?: string[] | string;
};

export default function SitePhotosScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const fetchPhotos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPhotos((data as SitePhoto[]) || []);
    } catch (err) {
      console.error('Failed to fetch site photos', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('projects').select('id, name').order('name');
      if (error) throw error;
      setProjects((data as { id: string; name: string }[]) || []);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    fetchProjects();
  }, [fetchPhotos, fetchProjects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPhotos();
  }, [fetchPhotos]);

  const filteredPhotos = projectFilter === 'All'
    ? photos
    : photos.filter((p) => p.project_id === projectFilter || p.project_name === projectFilter);

  const getTags = (item: SitePhoto): string[] => {
    if (Array.isArray(item.tags)) return item.tags;
    if (typeof item.tags === 'string') return item.tags.split(',').map((t) => t.trim()).filter(Boolean);
    return [];
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View className="flex-1" style={{ backgroundColor: theme.bg }}>
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>Site Photos</Text>
            <Pressable
              onPress={() => router.push('/site-photos/create')}
              className="px-4 py-2 rounded-lg flex-row items-center"
              style={{ backgroundColor: COLORS.primary[600] }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Project filter */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="filter" size={16} color={theme.textSecondary} />
            <Text className="text-sm ml-1 mr-3" style={{ color: theme.textSecondary }}>Project:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setProjectFilter('All')}
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: projectFilter === 'All' ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: projectFilter === 'All' ? '#fff' : theme.textSecondary }}
                  >
                    All
                  </Text>
                </Pressable>
                {projects.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setProjectFilter(p.id)}
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: projectFilter === p.id ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: projectFilter === p.id ? '#fff' : theme.textSecondary }}
                    >
                      {p.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator className="mt-8" color={COLORS.primary[600]} />
          ) : (
            <FlatList
              data={filteredPhotos}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
              }
              renderItem={({ item }) => {
                const tags = getTags(item);
                return (
                  <Pressable
                    onPress={() => router.push(`/site-photos/${item.id}`)}
                    className="rounded-xl overflow-hidden"
                    style={{ width: itemSize, marginBottom: gap, marginRight: gap, backgroundColor: theme.surface }}
                  >
                    <View style={{ width: itemSize, height: itemSize, backgroundColor: isDark ? '#1e293b' : '#e5e7eb' }}>
                      {item.photo_url ? (
                        <Image
                          source={{ uri: item.photo_url }}
                          style={{ width: itemSize, height: itemSize }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons name="image-outline" size={32} color={theme.textMuted} />
                        </View>
                      )}
                    </View>
                    <View className="p-2">
                      <Text className="text-xs font-medium" numberOfLines={1} style={{ color: theme.text }}>
                        {item.caption || 'Untitled'}
                      </Text>
                      {item.location ? (
                        <View className="flex-row items-center mt-0.5">
                          <Ionicons name="location-outline" size={10} color={theme.textMuted} />
                          <Text className="text-[10px] ml-0.5" numberOfLines={1} style={{ color: theme.textMuted }}>
                            {item.location}
                          </Text>
                        </View>
                      ) : null}
                      <Text className="text-[10px] mt-0.5" numberOfLines={1} style={{ color: theme.textSecondary }}>
                        {item.project_name}
                      </Text>
                      {tags.length > 0 && (
                        <View className="flex-row flex-wrap mt-1">
                          {tags.slice(0, 2).map((tag) => (
                            <View key={tag} className="px-1.5 py-0.5 rounded mr-1" style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }}>
                              <Text className="text-[10px]" style={{ color: isDark ? '#93c5fd' : '#1d4ed8' }}>{tag}</Text>
                            </View>
                          ))}
                          {tags.length > 2 && (
                            <Text className="text-[10px]" style={{ color: theme.textMuted }}>+{tags.length - 2}</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View className="items-center py-12" style={{ width: width - 32 }}>
                  <Ionicons name="images-outline" size={48} color={theme.textMuted} />
                  <Text className="mt-4 text-center" style={{ color: theme.textSecondary }}>
                    {projectFilter !== 'All'
                      ? 'No photos for this project.'
                      : 'No site photos yet.\nTap "New" to add one.'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
