import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDelayNotesStore } from '../../stores/delayNotesStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function DelayNotesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { delayNotes, fetchDelayNotes, loading } = useDelayNotesStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved' | 'closed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotes = filterStatus === 'all'
    ? delayNotes
    : delayNotes.filter((n) => n.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDelayNotes();
    setRefreshing(false);
  }, [fetchDelayNotes]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'open': return colors.danger;
      case 'resolved': return colors.success;
      case 'closed': return colors.gray;
      default: return colors.gray;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Delay Notes</Text>
            <Pressable
              onPress={() => router.push('/quick-actions/delay')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="flex-row mb-4 flex-wrap">
            {(['all', 'open', 'resolved', 'closed'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
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
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/delay-notes/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.reason}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.projectName}</Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: statusColor(item.status) + '20' }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: statusColor(item.status) }}
                      >
                        {statusLabel(item.status)}
                      </Text>
                    </View>
                  </View>

                  {item.description && (
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2" numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {item.linkedRfiId && (
                      <View className="flex-row items-center">
                        <Ionicons name="link-outline" size={14} color={colors.info} />
                        <Text className="text-xs text-blue-500 ml-1">Linked RFI</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="timer-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus} delay notes`
                    : 'No delay notes yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
