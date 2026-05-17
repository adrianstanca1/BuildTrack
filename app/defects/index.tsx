import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDefectsStore } from '../../stores/defectsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { COLORS } from '../../constants/theme';

export default function DefectsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { defects, fetchDefects, loading: _loading } = useDefectsStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredDefects = filterStatus === 'all'
    ? defects
    : defects.filter((d) => d.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDefects();
    setRefreshing(false);
  }, [fetchDefects]);

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.danger;
      case 'major': return '#f97316';
      case 'minor': return colors.warning;
      case 'cosmetic': return colors.success;
      default: return colors.gray;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Defects</Text>
            <Pressable
              onPress={() => router.push('/defects/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="flex-row mb-4">
            {(['all', 'open', 'in-progress', 'resolved'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {s === 'all' ? 'All' : statusLabel(s)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredDefects}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/defects/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.projectName}</Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: severityColor(item.severity) + '20' }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: severityColor(item.severity) }}
                      >
                        {item.severity}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2" numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center">
                      <Ionicons name="location-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">{item.location}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{
                          backgroundColor:
                            item.status === 'open'
                              ? colors.danger
                              : item.status === 'in-progress'
                              ? colors.warning
                              : colors.success,
                        }}
                      />
                      <Text className="text-xs text-gray-500">{statusLabel(item.status)}</Text>
                    </View>
                  </View>
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="bug-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus} defects`
                    : 'No defects yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
