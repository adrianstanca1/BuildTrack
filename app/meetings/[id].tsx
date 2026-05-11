import { View, Text, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMeetingsStore } from '../../stores/meetingsStore';
import { Card } from '../../components/ui/Card';

export default function MeetingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { meetings, deleteMeeting } = useMeetingsStore();


  const item = meetings.find((e) => e.id === id);

  const statusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };
  if (!item) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="people-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-400 mt-4">Meeting not found</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Meeting',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMeeting(item.id);
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
            {item.title || 'Meeting'}
          </Text>
          <Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>
        <View className="mt-2">
          <View className="self-start rounded-full px-3 py-1" style={{ backgroundColor: statusColor(item.status) + '20' }}>
            <Text className="text-xs font-semibold uppercase" style={{ color: statusColor(item.status) }}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <Card className="mt-4">
          <View className="flex-row items-center py-2">
            <Ionicons name="text-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Title</Text>
              <Text className="text-sm font-medium text-gray-900">{item.title || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="list-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Type</Text>
              <Text className="text-sm font-medium text-gray-900">{item.type || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="calendar-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Date</Text>
              <Text className="text-sm font-medium text-gray-900">{item.date || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="time-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Time</Text>
              <Text className="text-sm font-medium text-gray-900">{item.time || "N/A"}</Text>
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
            <Ionicons name="people-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Attendees</Text>
              <Text className="text-sm font-medium text-gray-900">{item.attendees || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="document-text-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Notes</Text>
              <Text className="text-sm font-medium text-gray-900">{item.notes || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="briefcase-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Project</Text>
              <Text className="text-sm font-medium text-gray-900">{item.projectName || "N/A"}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
