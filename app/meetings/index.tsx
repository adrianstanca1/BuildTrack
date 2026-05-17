import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMeetingsStore } from '../../stores/meetingsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import type { MeetingStatus } from '../../types/field';

export default function MeetingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { meetings, fetchMeetings, loading: _loading } = useMeetingsStore();
  const [filterStatus, setFilterStatus] = useState<MeetingStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const filteredMeetings = filterStatus === 'all'
    ? meetings
    : meetings.filter((m) => m.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMeetings();
    setRefreshing(false);
  }, [fetchMeetings]);

  const statusColor = (status: MeetingStatus) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.primary;
      case 'scheduled': return colors.info;
      case 'cancelled': return colors.gray;
      default: return colors.gray;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'safety_toolbox': return 'Safety Toolbox';
      case 'client_walkthrough': return 'Client Walkthrough';
      case 'change_order': return 'Change Order';
      case 'quality_review': return 'Quality Review';
      case 'progress_review': return 'Progress Review';
      default: return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</Text>
            <Pressable
              onPress={() => router.push('/meetings/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="flex-row mb-4 flex-wrap">
            {(['all', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredMeetings}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/meetings/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
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
                        {item.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <Ionicons name="business-outline" size={14} color={colors.gray} />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {typeLabel(item.meetingType)}
                    </Text>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <Ionicons name="calendar-outline" size={14} color={colors.info} />
                    <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                      {formatDateTime(item.scheduledAt)}
                    </Text>
                    {item.durationMinutes > 0 && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({item.durationMinutes} min)
                      </Text>
                    )}
                  </View>

                  {item.location && (
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="location-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{item.location}</Text>
                    </View>
                  )}

                  {item.agenda && (
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2" numberOfLines={2}>
                      {item.agenda}
                    </Text>
                  )}

                  {item.attendees && item.attendees.length > 0 && (
                    <View className="flex-row items-center mt-3">
                      <Ionicons name="people-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">
                        {item.attendees.filter((a) => a.present).length}/{item.attendees.length} present
                      </Text>
                      <Text className="text-xs text-gray-400 ml-1">
                        ({item.attendees.map((a) => a.name).join(', ')})
                      </Text>
                    </View>
                  )}
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="people-circle-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus.replace('_', ' ')} meetings`
                    : 'No meetings yet.\nTap "New" to schedule one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
