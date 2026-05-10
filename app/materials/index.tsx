import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMaterialsStore } from '../../stores/materialsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import type { MaterialCategory } from '../../types/field';

const CATEGORIES: (MaterialCategory | 'all')[] = [
  'all',
  'concrete',
  'steel',
  'timber',
  'brick',
  'block',
  'insulation',
  'roofing',
  'electrical',
  'plumbing',
  'paint',
  'hardware',
  'aggregate',
  'other',
];

function categoryLabel(c: MaterialCategory | 'all') {
  if (c === 'all') return 'All';
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function categoryIcon(c: MaterialCategory) {
  switch (c) {
    case 'concrete': return 'cube-outline';
    case 'steel': return 'fitness-outline';
    case 'timber': return 'leaf-outline';
    case 'brick': return 'layers-outline';
    case 'block': return 'apps-outline';
    case 'insulation': return 'thermometer-outline';
    case 'roofing': return 'home-outline';
    case 'electrical': return 'flash-outline';
    case 'plumbing': return 'water-outline';
    case 'paint': return 'color-palette-outline';
    case 'hardware': return 'build-outline';
    case 'aggregate': return 'ellipse-outline';
    default: return 'construct-outline';
  }
}

export default function MaterialsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { materials, fetchMaterials, loading } = useMaterialsStore();
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | 'all'>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const lowStockCount = materials.filter((m) => m.quantityOnHand <= m.reorderLevel).length;

  const filteredMaterials = materials.filter((m) => {
    const categoryMatch = filterCategory === 'all' || m.category === filterCategory;
    const stockMatch = !showLowStockOnly || m.quantityOnHand <= m.reorderLevel;
    return categoryMatch && stockMatch;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMaterials();
    setRefreshing(false);
  }, [fetchMaterials]);

  const isLowStock = (m: typeof materials[number]) => m.quantityOnHand <= m.reorderLevel;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Materials</Text>
            <Pressable
              onPress={() => router.push('/materials/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Low Stock Alert Banner */}
          {lowStockCount > 0 && (
            <Pressable
              onPress={() => setShowLowStockOnly((v) => !v)}
              className={`rounded-lg p-3 mb-4 flex-row items-center ${
                showLowStockOnly ? 'bg-red-600' : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <Ionicons
                name="warning-outline"
                size={18}
                color={showLowStockOnly ? '#fff' : colors.danger}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  showLowStockOnly ? 'text-white' : 'text-red-700 dark:text-red-400'
                }`}
              >
                {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} below reorder level
              </Text>
              <View className="flex-1" />
              <Text
                className={`text-xs font-medium ${
                  showLowStockOnly ? 'text-white' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {showLowStockOnly ? 'Show All' : 'Filter'}
              </Text>
            </Pressable>
          )}

          {/* Category Filters */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</Text>
          <View className="flex-row mb-4 flex-wrap">
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setFilterCategory(c)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterCategory === c ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-sm ${
                    filterCategory === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {categoryLabel(c)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredMaterials}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => {
              const low = isLowStock(item);
              return (
                <Card className="mb-3">
                  <Pressable
                    onPress={() => router.push(`/materials/${item.id}`)}
                    className="p-4"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row flex-1 items-center">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{
                            backgroundColor: low
                              ? colors.danger + '20'
                              : colors.primary + '20',
                          }}
                        >
                          <Ionicons
                            name={categoryIcon(item.category)}
                            size={20}
                            color={low ? colors.danger : colors.primary}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text className="text-base font-semibold text-gray-900 dark:text-white">
                              {item.name}
                            </Text>
                            {low && (
                              <View
                                className="ml-2 px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: colors.danger + '20' }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: colors.danger }}
                                >
                                  Low Stock
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.projectName}
                          </Text>
                        </View>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: colors.gray + '20' }}
                      >
                        <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">
                          {item.category}
                        </Text>
                      </View>
                    </View>

                    {/* Quantity Row */}
                    <View className="flex-row mt-3 ml-13">
                      <View className="flex-1 flex-row items-center">
                        <Ionicons name="cube-outline" size={14} color={colors.gray} />
                        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          On Hand:{' '}
                          <Text className={`font-semibold ${low ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {item.quantityOnHand} {item.unit}
                          </Text>
                        </Text>
                      </View>
                      <View className="flex-1 flex-row items-center">
                        <Ionicons name="cart-outline" size={14} color={colors.gray} />
                        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          Ordered:{' '}
                          <Text className="font-semibold text-gray-700 dark:text-gray-300">
                            {item.quantityOrdered} {item.unit}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    {/* Reorder Info */}
                    <View className="flex-row mt-1 ml-13">
                      <View className="flex-row items-center">
                        <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
                        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          Reorder at: {item.reorderLevel} {item.unit}
                        </Text>
                      </View>
                      {item.reorderQuantity > 0 && (
                        <View className="flex-row items-center ml-4">
                          <Ionicons name="repeat-outline" size={14} color={colors.info} />
                          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            Qty: {item.reorderQuantity} {item.unit}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Unit Cost */}
                    {item.unitCost > 0 && (
                      <View className="flex-row items-center mt-1 ml-13">
                        <Ionicons name="cash-outline" size={14} color={colors.gray} />
                        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          £{item.unitCost.toFixed(2)} / {item.unit}
                        </Text>
                        <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                          (Total: £{(item.unitCost * item.quantityOnHand).toFixed(2)})
                        </Text>
                      </View>
                    )}

                    {/* Supplier / Location */}
                    {(item.supplierName || item.location) && (
                      <View className="flex-row flex-wrap mt-2 ml-13">
                        {item.supplierName && (
                          <View className="flex-row items-center mr-4">
                            <Ionicons name="business-outline" size={12} color={colors.info} />
                            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                              {item.supplierName}
                            </Text>
                          </View>
                        )}
                        {item.location && (
                          <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={12} color={colors.warning} />
                            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                              {item.location}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-13" numberOfLines={2}>
                        {item.notes}
                      </Text>
                    )}
                  </Pressable>
                </Card>
              );
            }}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="cube-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterCategory !== 'all' || showLowStockOnly
                    ? 'No materials match your filters'
                    : 'No materials yet.\nTap "New" to add one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
