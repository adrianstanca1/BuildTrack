import { View, Text, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function EquipmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { equipment, deleteEquipment, updateEquipment } = useEquipmentStore();

  const item = equipment.find((e) => e.id === id);

  const statusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success;
      case 'rented': return colors.info;
      case 'on_site': return colors.primary;
      case 'under_maintenance': return colors.warning;
      case 'out_of_service': return colors.danger;
      case 'retired': return colors.gray;
      default: return colors.gray;
    }
  };

  const typeLabel = (type: string) =>
    type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

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

  const handleDelete = () => {
    Alert.alert(
      'Delete Equipment',
      'Are you sure you want to delete this equipment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEquipment(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="construct-outline" size={48} color={colors.gray} />
          <Text className="text-gray-500 mt-4 text-center">Equipment not found</Text>
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
        <View className="flex-row items-center flex-1">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 dark:text-white" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {typeLabel(item.type)}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleDelete} className="ml-2">
          <Ionicons name="trash-outline" size={24} color={colors.danger} />
        </Pressable>
      </View>

      <ScrollView className="px-4 pb-6">
        {/* Status Badge */}
        <View className="mb-4">
          <View
            className="self-start px-3 py-1.5 rounded-full"
            style={{ backgroundColor: statusColor(item.status) + '20' }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: statusColor(item.status) }}
            >
              {typeLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* Project */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center mb-2">
            <Ionicons name="business-outline" size={16} color={colors.primary} />
            <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Project</Text>
          </View>
          <Text className="text-base text-gray-700 dark:text-gray-300">
            {item.projectName || 'No Project'}
          </Text>
        </Card>

        {/* Details */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center mb-3">
            <Ionicons name="list-outline" size={16} color={colors.gray} />
            <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Details</Text>
          </View>
          <InfoRow icon="construct-outline" label="Make" value={item.make || 'N/A'} />
          <InfoRow icon="cube-outline" label="Model" value={item.model || 'N/A'} />
          <InfoRow icon="barcode-outline" label="Serial" value={item.serialNumber || 'N/A'} />
          <InfoRow icon="calendar-outline" label="Year" value={item.year ? String(item.year) : 'N/A'} />
          <InfoRow icon="location-outline" label="Location" value={item.location || 'N/A'} />
        </Card>

        {/* Financial */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center mb-3">
            <Ionicons name="cash-outline" size={16} color={colors.gray} />
            <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Financial</Text>
          </View>
          <InfoRow icon="cash-outline" label="Daily Rate" value={formatCurrency(item.dailyRate)} />
          <InfoRow icon="card-outline" label="Purchase Price" value={formatCurrency(item.purchasePrice)} />
          <InfoRow icon="calendar-outline" label="Purchase Date" value={formatDate(item.purchaseDate)} />
        </Card>

        {/* Compliance */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center mb-3">
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.gray} />
            <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Compliance</Text>
          </View>
          <InfoRow icon="shield-outline" label="Insurance Exp." value={formatDate(item.insuranceExpiry)} />
          <InfoRow icon="document-text-outline" label="MOT Exp." value={formatDate(item.motExpiry)} />
        </Card>

        {/* Notes */}
        {item.notes && (
          <Card className="p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="chatbubble-outline" size={16} color={colors.gray} />
              <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Notes</Text>
            </View>
            <Text className="text-base text-gray-700 dark:text-gray-300">{item.notes}</Text>
          </Card>
        )}

        {/* Actions */}
        <View className="flex-row gap-3 mt-2">
          <Pressable
            onPress={() => router.push(`/equipment/${id}/edit`)}
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
          <Text className="text-xs text-gray-400">Created: {formatDate(item.createdAt)}</Text>
          <Text className="text-xs text-gray-400">ID: {item.id.slice(0, 8)}...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-2">
      <Ionicons name={icon} size={16} color="#9ca3af" />
      <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2 w-28">{label}</Text>
      <Text className="flex-1 text-sm text-gray-900 dark:text-white font-medium">{value}</Text>
    </View>
  );
}
