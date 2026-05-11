import { View, Text, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudgetStore } from '../../stores/budgetStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

const typeColors: Record<string, string> = {
  budget: '#9333EA',
  actual: '#3B82F6',
  forecast: '#D97706',
  commitment: '#6366F1',
  variance: '#EF4444',
};

export default function BudgetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { entries, deleteEntry } = useBudgetStore();

  const entry = entries.find((e) => e.id === id);

  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'N/A';
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `£${amount}`;
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this cost entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!entry) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cash-outline" size={48} color={colors.gray} />
          <Text className="text-gray-500 mt-4 text-center">Cost entry not found</Text>
          <Pressable onPress={() => router.back()} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="p-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 dark:text-white" numberOfLines={1}>
              {entry.description || 'Untitled Entry'}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleDelete} className="ml-2">
          <Ionicons name="trash-outline" size={24} color={colors.danger} />
        </Pressable>
      </View>

      <ScrollView className="px-4 pb-6">
        {/* Type Badge */}
        <View className="mb-4">
          <View
            className="self-start px-3 py-1.5 rounded-full"
            style={{ backgroundColor: (typeColors[entry.entryType] || colors.gray) + '20' }}
          >
            <Text
              className="text-sm font-semibold capitalize"
              style={{ color: typeColors[entry.entryType] || colors.gray }}
            >
              {entry.entryType}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center mb-2">
            <Ionicons name="cash-outline" size={16} color={colors.primary} />
            <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Amount</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(entry.amount)}
          </Text>
          {entry.quantity > 0 && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {entry.quantity} {entry.unit || 'units'}
            </Text>
          )}
        </Card>

        {/* Details */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center mb-3">
            <Ionicons name="list-outline" size={16} color={colors.gray} />
            <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Details</Text>
          </View>
          <InfoRow icon="grid-outline" label="Cost Code" value={entry.costCode || 'N/A'} />
          <InfoRow icon="business-outline" label="Vendor" value={entry.vendor || 'N/A'} />
          <InfoRow icon="calendar-outline" label="Date" value={formatDate(entry.date)} />
          <InfoRow icon="time-outline" label="Created" value={formatDate(entry.createdAt)} />
        </Card>

        {/* Notes */}
        {entry.notes && (
          <Card className="p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="chatbubble-outline" size={16} color={colors.gray} />
              <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Notes</Text>
            </View>
            <Text className="text-base text-gray-700 dark:text-gray-300">{entry.notes}</Text>
          </Card>
        )}

        {/* Actions */}
        <View className="flex-row gap-3 mt-2">
          <Pressable
            onPress={() => router.push(`/budget/${id}/edit`)}
            className="flex-1 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Edit</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            className="flex-1 bg-red-600 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="trash-outline" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Delete</Text>
          </Pressable>
        </View>

        {/* Metadata */}
        <View className="flex-row justify-between px-2 py-4">
          <Text className="text-xs text-gray-400">ID: {entry.id.slice(0, 8)}...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-2">
      <Ionicons name={icon} size={16} color="#9ca3af" />
      <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2 w-24">{label}</Text>
      <Text className="flex-1 text-sm text-gray-900 dark:text-white font-medium">{value}</Text>
    </View>
  );
}
