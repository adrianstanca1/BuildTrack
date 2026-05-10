import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubmittalsStore } from '../../stores/submittalsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function SubmittalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { submittals, fetchSubmittals, loading } = useSubmittalsStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredSubmittals = filterStatus === 'all'
    ? submittals
    : submittals.filter((s) => s.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubmittals();
    setRefreshing(false);
  }, [fetchSubmittals]);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'material': return 'cube';
      case 'shop-drawing': return 'construct';
      case 'product-data': return 'document-text';
      case 'sample': return 'color-palette';
      case 'mockup': return 'layers';
      default: return 'document';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'rejected': return colors.danger;
      case 'under-review': return colors.warning;
      case 'submitted': return colors.info;
      case 'draft': return colors.gray;
      default: return colors.gray;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Submittals</Text>
            <Pressable
              onPress={() => router.push('/submittals/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="flex-row mb-4 flex-wrap">
            {(['all', 'draft', 'submitted', 'under-review', 'approved', 'rejected'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {s === 'under-review' ? 'Under Review' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredSubmittals}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/submittals/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row flex-1">
                      <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
                        <Ionicons name={typeIcon(item.type) as any} size={18} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.projectName}</Text>
                        {item.specSection && (
                          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">Spec: {item.specSection}</Text>
                        )}
                      </View>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: statusColor(item.status) + '20' }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: statusColor(item.status) }}
                      >
                        {item.status === 'under-review' ? 'Review' : item.status}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2" numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center">
                      <Ionicons name="person-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">{item.submittedBy}</Text>
                    </View>
                    {item.reviewDate && (
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-done-outline" size={14} color={colors.gray} />
                        <Text className="text-xs text-gray-500 ml-1">
                          {new Date(item.reviewDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="document-text-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus} submittals`
                    : 'No submittals yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
