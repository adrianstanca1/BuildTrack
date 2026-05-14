import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type Drawing = {
  id: string;
  title: string;
  project_id: string;
  project_name: string;
  status: string;
  revision: string;
  discipline: string;
  uploaded_by: string;
  file_url: string;
  created_at: string;
};

const DISCIPLINES = ['Architectural', 'Structural', 'Mechanical', 'Electrical', 'Plumbing', 'Civil'];
const STATUSES = ['active', 'superseded', 'archived'];

export default function DrawingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const fetchDrawings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDrawings((data as Drawing[]) || []);
    } catch (err) {
      console.error('Failed to fetch drawings', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDrawings();
  }, [fetchDrawings]);

  const disciplineIcon = (discipline: string) => {
    switch (discipline?.toLowerCase()) {
      case 'architectural': return 'business';
      case 'structural': return 'construct';
      case 'mechanical': return 'settings';
      case 'electrical': return 'flash';
      case 'plumbing': return 'water';
      case 'civil': return 'earth';
      default: return 'document';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'superseded': return COLORS.warning;
      case 'archived': return theme.textMuted;
      default: return theme.textMuted;
    }
  };

  const filteredDrawings = drawings.filter((d) => {
    const matchesSearch =
      !search ||
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.uploaded_by?.toLowerCase().includes(search.toLowerCase());
    const matchesDiscipline = filterDiscipline === 'All' || d.discipline === filterDiscipline;
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
    return matchesSearch && matchesDiscipline && matchesStatus;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View className="flex-1" style={{ backgroundColor: theme.bg }}>
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>Drawings</Text>
            <Pressable
              onPress={() => router.push('/drawings/create')}
              className="px-4 py-2 rounded-lg flex-row items-center"
              style={{ backgroundColor: COLORS.primary[600] }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View
            className="flex-row items-center px-3 py-2 rounded-lg border mb-4"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
          >
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              className="flex-1 ml-2 text-base"
              style={{ color: theme.text }}
              placeholder="Search title, project, uploader..."
              placeholderTextColor={theme.placeholder}
              value={search}
              onChangeText={setSearch}
            />
            {search !== '' && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Discipline filters */}
          <View className="flex-row flex-wrap mb-2">
            {(['All', ...DISCIPLINES] as const).map((d) => (
              <Pressable
                key={d}
                onPress={() => setFilterDiscipline(d)}
                className="mr-2 mb-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: filterDiscipline === d ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: filterDiscipline === d ? '#fff' : theme.textSecondary }}
                >
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Status filters */}
          <View className="flex-row flex-wrap mb-2">
            {(['All', ...STATUSES] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className="mr-2 mb-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: filterStatus === s ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <Text
                  className="text-sm capitalize"
                  style={{ color: filterStatus === s ? '#fff' : theme.textSecondary }}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator className="mt-8" color={COLORS.primary[600]} />
          ) : (
            <FlatList
              data={filteredDrawings}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
              }
              renderItem={({ item }) => (
                <Card className="mb-3">
                  <Pressable
                    onPress={() => router.push(`/drawings/${item.id}`)}
                    className="p-4"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row flex-1">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }}
                        >
                          <Ionicons name={disciplineIcon(item.discipline) as any} size={18} color={COLORS.primary[600]} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold" style={{ color: theme.text }}>{item.title}</Text>
                          <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>{item.project_name}</Text>
                          <Text className="text-xs mt-1" style={{ color: theme.textMuted }}>Rev: {item.revision}</Text>
                        </View>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: statusColor(item.status) + '22' }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: statusColor(item.status) }}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center mt-3">
                      <View className="flex-row items-center">
                        <Ionicons name="person-outline" size={14} color={theme.textMuted} />
                        <Text className="text-xs ml-1" style={{ color: theme.textSecondary }}>{item.uploaded_by}</Text>
                      </View>
                      {item.file_url ? (
                        <View className="flex-row items-center">
                          <Ionicons name="attach-outline" size={14} color={theme.textMuted} />
                          <Text className="text-xs ml-1" style={{ color: theme.textSecondary }}>Attachment</Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                </Card>
              )}
              ListEmptyComponent={
                <View className="items-center py-12">
                  <Ionicons name="map-outline" size={48} color={theme.textMuted} />
                  <Text className="mt-4 text-center" style={{ color: theme.textSecondary }}>
                    {filterDiscipline !== 'All' || filterStatus !== 'All' || search
                      ? 'No drawings match your filters.'
                      : 'No drawings yet.\nTap "New" to create one.'}
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
