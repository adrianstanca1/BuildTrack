import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMaterialsStore } from '../../stores/materialsStore';
import { COLORS, SPACING } from '@/constants/theme';

const CATEGORIES = [
  'concrete', 'steel', 'timber', 'brick', 'block',
  'insulation', 'roofing', 'electrical', 'plumbing',
  'paint', 'hardware', 'aggregate', 'other',
];

const categoryColors: Record<string, string> = {
  concrete: '#A8A29E',
  steel: '#64748B',
  timber: '#D97706',
  brick: '#EA580C',
  block: '#6B7280',
  insulation: '#06B6D4',
  roofing: '#EF4444',
  electrical: '#EAB308',
  plumbing: '#3B82F6',
  paint: '#EC4899',
  hardware: '#10B981',
  aggregate: '#78716C',
  other: '#9CA3AF',
};

export default function MaterialsListScreen() {
  const { materials, loading, fetchMaterials } = useMaterialsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMaterials();
    setRefreshing(false);
  }, [fetchMaterials]);

  const filtered = materials.filter((m) => {
    if (categoryFilter && m.category !== categoryFilter) return false;
    if (lowStockOnly && m.reorderLevel > 0 && m.quantityOnHand > m.reorderLevel) return false;
    return true;
  });

  const isLowStock = (m: any) => m.reorderLevel > 0 && m.quantityOnHand <= m.reorderLevel;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Materials</Text>
        <TouchableOpacity onPress={() => router.push('/materials/create')}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center">
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-medium ml-1">New</Text>
        </TouchableOpacity>
      </View>

      <View className="px-4 pb-2 flex-row items-center gap-2">
        <TouchableOpacity onPress={() => setLowStockOnly(!lowStockOnly)}
          className={`px-3 py-1.5 rounded-full ${lowStockOnly ? 'bg-red-100' : 'bg-gray-200 dark:bg-gray-700'}`}>
          <Text className={`text-xs font-medium ${lowStockOnly ? 'text-red-700' : 'text-gray-600 dark:text-gray-300'}`}>
            Low Stock
          </Text>
        </TouchableOpacity>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(c) => c}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setCategoryFilter(categoryFilter === item ? null : item)}
              className={`px-3 py-1.5 rounded-full mr-2 ${categoryFilter === item ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Text className={`text-xs font-medium ${categoryFilter === item ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View className={`mx-4 mt-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${isLowStock(item) ? 'border border-red-200' : ''}`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: categoryColors[item.category] || '#9CA3AF' }} />
                <Text className="font-semibold text-gray-900 dark:text-white">{item.name}</Text>
              </View>
              {isLowStock(item) && (
                <View className="bg-red-100 px-2 py-0.5 rounded-full">
                  <Text className="text-xs text-red-700 font-medium">Low</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center mt-2 flex-wrap gap-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">{item.quantityOnHand?.toLocaleString()} {item.unit}</Text>
              {item.quantityOrdered > 0 && <Text className="text-xs text-blue-600">+{item.quantityOrdered} ordered</Text>}
              {item.unitCost > 0 && <Text className="text-xs text-gray-400">£{item.unitCost}/{item.unit}</Text>}
            </View>

            {item.reorderLevel > 0 && (
              <Text className={`text-xs mt-1 ${isLowStock(item) ? 'text-red-500' : 'text-gray-400'}`}>
                Reorder at {item.reorderLevel} {item.unit}
              </Text>
            )}

            {item.supplierName && <Text className="text-xs text-gray-400 mt-1">Supplier: {item.supplierName}</Text>}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="cube-outline" size={48} color={COLORS.dark?.textSecondary || '#9CA3AF'} />
            <Text className="text-gray-500 mt-4 text-center">
              {categoryFilter || lowStockOnly
                ? 'No matching materials'
                : 'No materials yet.\nTap "New" to create one.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
