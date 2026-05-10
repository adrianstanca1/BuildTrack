import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import type { EquipmentStatus, EquipmentType } from '../../types/field';

export default function EquipmentScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { equipment, fetchEquipment, loading } = useEquipmentStore();
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<EquipmentType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const filteredEquipment = equipment.filter((e) => {
    const statusMatch = filterStatus === 'all' || e.status === filterStatus;
    const typeMatch = filterType === 'all' || e.type === filterType;
    return statusMatch && typeMatch;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEquipment();
    setRefreshing(false);
  }, [fetchEquipment]);

  const statusColor = (status: EquipmentStatus) => {
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

  const typeIcon = (type: EquipmentType) => {
    switch (type) {
      case 'excavator': return 'construct-outline';
      case 'bulldozer': return 'bus-outline';
      case 'crane': return 'git-merge-outline';
      case 'loader': return 'cube-outline';
      case 'dump_truck': return 'car-outline';
      case 'mixer': return 'beaker-outline';
      case 'generator': return 'flash-outline';
      case 'scaffold': return 'layers-outline';
      case 'scissor_lift': return 'arrow-up-outline';
      case 'forklift': return 'arrow-up-circle-outline';
      case 'compactor': return 'barbell-outline';
      default: return 'cog-outline';
    }
  };

  const typeLabel = (type: EquipmentType) =>
    type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const statusLabel = (status: EquipmentStatus) =>
    status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const EQUIPMENT_TYPES: (EquipmentType | 'all')[] = [
    'all',
    'excavator',
    'bulldozer',
    'crane',
    'loader',
    'dump_truck',
    'mixer',
    'generator',
    'scaffold',
    'scissor_lift',
    'forklift',
    'compactor',
    'other',
  ];

  const EQUIPMENT_STATUSES: (EquipmentStatus | 'all')[] = [
    'all',
    'available',
    'rented',
    'on_site',
    'under_maintenance',
    'out_of_service',
    'retired',
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Equipment</Text>
            <Pressable
              onPress={() => router.push('/equipment/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Type Filters */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</Text>
          <View className="flex-row mb-3 flex-wrap">
            {EQUIPMENT_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setFilterType(t)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterType === t ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterType === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {t === 'all' ? 'All' : typeLabel(t)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Status Filters */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</Text>
          <View className="flex-row mb-4 flex-wrap">
            {EQUIPMENT_STATUSES.map((s) => (
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
            data={filteredEquipment}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/equipment/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row flex-1 items-center">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: statusColor(item.status) + '20' }}
                      >
                        <Ionicons name={typeIcon(item.type)} size={20} color={statusColor(item.status)} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.name}</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.projectName}</Text>
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
                        {statusLabel(item.status)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-2 ml-13">
                    <Ionicons name="business-outline" size={14} color={colors.gray} />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {typeLabel(item.type)}
                    </Text>
                  </View>

                  {(item.make || item.model) && (
                    <View className="flex-row items-center mt-1 ml-13">
                      <Ionicons name="cog-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {[item.make, item.model].filter(Boolean).join(' ')}
                      </Text>
                    </View>
                  )}

                  {item.location && (
                    <View className="flex-row items-center mt-1 ml-13">
                      <Ionicons name="location-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{item.location}</Text>
                    </View>
                  )}

                  {item.dailyRate && item.dailyRate > 0 && (
                    <View className="flex-row items-center mt-1 ml-13">
                      <Ionicons name="cash-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        £{item.dailyRate.toFixed(2)} / day
                      </Text>
                    </View>
                  )}

                  {item.year && (
                    <View className="flex-row items-center mt-1 ml-13">
                      <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">Year: {item.year}</Text>
                    </View>
                  )}

                  {item.serialNumber && (
                    <View className="flex-row items-center mt-1 ml-13">
                      <Ionicons name="barcode-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">S/N: {item.serialNumber}</Text>
                    </View>
                  )}

                  {(item.insuranceExpiry || item.motExpiry) && (
                    <View className="flex-row flex-wrap mt-2 ml-13">
                      {item.insuranceExpiry && (
                        <View className="flex-row items-center mr-3">
                          <Ionicons name="shield-checkmark-outline" size={12} color={colors.info} />
                          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            Insurance: {new Date(item.insuranceExpiry).toLocaleDateString('en-GB')}
                          </Text>
                        </View>
                      )}
                      {item.motExpiry && (
                        <View className="flex-row items-center">
                          <Ionicons name="document-text-outline" size={12} color={colors.warning} />
                          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            MOT: {new Date(item.motExpiry).toLocaleDateString('en-GB')}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {item.notes && (
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-13" numberOfLines={2}>
                      {item.notes}
                    </Text>
                  )}
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="construct-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all' || filterType !== 'all'
                    ? 'No equipment matches your filters'
                    : 'No equipment yet.\nTap "New" to add one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
