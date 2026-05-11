import { View, Text, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMaterialsStore } from '../../stores/materialsStore';
import { Card } from '../../components/ui/Card';

export default function MaterialDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { materials, deleteMaterial } = useMaterialsStore();
  const fmtCurrency = (v?: number) => v != null ? '£' + v.toFixed(2) : 'N/A';
  const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('en-GB') : 'N/A';

  const item = materials.find((e) => e.id === id);

  if (!item) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="cube-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-400 mt-4">Material not found</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Material',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMaterial(item.id);
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
            {item.name || 'Material'}
          </Text>
          <Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>

        <Card className="mt-4">
          <View className="flex-row items-center py-2">
            <Ionicons name="cube-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Name</Text>
              <Text className="text-sm font-medium text-gray-900">{item.name || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="list-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Category</Text>
              <Text className="text-sm font-medium text-gray-900">{item.category || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="scale-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Quantity</Text>
              <Text className="text-sm font-medium text-gray-900">{item.quantity || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="resize-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Unit</Text>
              <Text className="text-sm font-medium text-gray-900">{item.unit || "N/A"}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="cash-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Unit Price</Text>
              <Text className="text-sm font-medium text-gray-900">{fmtCurrency(item.unitPrice)}</Text>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="business-outline" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Supplier</Text>
              <Text className="text-sm font-medium text-gray-900">{item.supplier || "N/A"}</Text>
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
