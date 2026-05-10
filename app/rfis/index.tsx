import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRfisStore } from '../../stores/rfisStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function RfisScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { rfis, fetchRfis, loading } = useRfisStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'open' | 'answered' | 'closed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredRfis = filterStatus === 'all'
    ? rfis
    : rfis.filter((r) => r.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRfis();
    setRefreshing(false);
  }, [fetchRfis]);

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.danger;
      case 'high': return '#f97316';
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.gray;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'answered': return colors.success;
      case 'open': return colors.info;
      case 'submitted': return colors.primary;
      case 'closed': return colors.gray;
      case 'draft': return colors.warning;
      default: return colors.gray;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate).getTime() < Date.now();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">RFIs</Text>
            <Pressable
              onPress={() => router.push('/rfis/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="flex-row mb-4 flex-wrap">
            {(['all', 'draft', 'submitted', 'open', 'answered', 'closed'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredRfis}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/rfis/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.projectName}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View
                        className="px-2 py-1 rounded-full mr-2"
                        style={{ backgroundColor: priorityColor(item.priority) + '20' }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: priorityColor(item.priority) }}
                        >
                          {item.priority}
                        </Text>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: statusColor(item.status) + '20' }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: statusColor(item.status) }}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2" numberOfLines={2}>
                    {item.question}
                  </Text>

                  {item.answer && (
                    <View className="mt-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                      <Text className="text-xs text-green-700 dark:text-green-400 font-medium">Answer: {item.answer}</Text>
                    </View>
                  )}

                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center">
                      <Ionicons name="person-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">{item.submittedBy}</Text>
                    </View>
                    {item.dueDate && (
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={14} color={isOverdue(item.dueDate) ? colors.danger : colors.gray} />
                        <Text className={`text-xs ml-1 ${isOverdue(item.dueDate) ? 'text-red-500' : 'text-gray-500'}`}>
                          Due {new Date(item.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="help-circle-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus} RFIs`
                    : 'No RFIs yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
