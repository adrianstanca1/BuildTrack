import { View, Text, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePunchItemsStore } from '../../stores/punchItemsStore';
import { Card } from '../../components/ui/Card';

export default function PunchItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { punchItems, deletePunchItem } = usePunchItemsStore();
  const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('en-GB') : 'N/A';

  const item = punchItems.find((e) => e.id === id);

  const statusColor = (status: string) => {
    switch (status) {
      case 'open': return '#ef4444';
      case 'in_progress': return '#f59e0b';
      case 'resolved': return '#22c55e';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };
  if (!item) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="hammer-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-400 mt-4">PunchItem not found</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete PunchItem',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePunchItem(item.id);
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
            {item.title || 'Punch Item'}
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
            <Ionicons name="document-text-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Description</Text>
              <Text className="text-sm font-medium text-gray-900">{item.description || "N/A"}</Text>
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
            <Ionicons name="warning-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Severity</Text>
              <Text className="text-sm font-medium text-gray-900">{item.severity || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="person-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Assigned To</Text>
              <Text className="text-sm font-medium text-gray-900">{item.assignedTo || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="calendar-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Due Date</Text>
              <Text className="text-sm font-medium text-gray-900">{item.dueDate || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="briefcase-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Project</Text>
              <Text className="text-sm font-medium text-gray-900">{item.projectName || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="calendar-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Created</Text>
              <Text className="text-sm font-medium text-gray-900">{fmtDate(item.createdAt)}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
