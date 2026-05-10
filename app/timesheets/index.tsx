import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimesheetsStore } from '../../stores/timesheetsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function TimesheetsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { timesheets, fetchTimesheets, loading, getTotalHoursForDate } = useTimesheetsStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'approved'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredTimesheets = filterStatus === 'all'
    ? timesheets
    : timesheets.filter((t) => t.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTimesheets();
    setRefreshing(false);
  }, [fetchTimesheets]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'submitted': return colors.info;
      case 'rejected': return colors.danger;
      case 'draft': return colors.warning;
      default: return colors.gray;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayHours = getTotalHoursForDate(today);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Timesheets</Text>
            <Pressable
              onPress={() => router.push('/timesheets/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Today Summary */}
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-gray-500 dark:text-gray-400">Today</Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">{todayHours.toFixed(1)}h</Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                <Ionicons name="time-outline" size={24} color={colors.primary} />
              </View>
            </View>
          </Card>

          {/* Filters */}
          <View className="flex-row mb-4">
            {(['all', 'draft', 'submitted', 'approved'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredTimesheets}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <View className="p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.workerName}</Text>
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
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={14} color={colors.primary} />
                      <Text className="text-xs text-gray-500 ml-1">
                        {item.hoursWorked}h
                        {item.overtime > 0 && <Text className="text-orange-500"> +{item.overtime}h OT</Text>}
                      </Text>
                    </View>
                  </View>

                  {item.notes && (
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2" numberOfLines={2}>
                      {item.notes}
                    </Text>
                  )}
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="time-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus} timesheets`
                    : 'No timesheets yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
