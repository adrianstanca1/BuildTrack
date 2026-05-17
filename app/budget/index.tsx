import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetStore } from '../../stores/budgetStore';
import { COLORS } from '@/constants/theme';

const TYPES = ['budget', 'actual', 'forecast', 'commitment', 'variance'];

const typeColors: Record<string, string> = {
  budget: '#9333EA',
  actual: '#3B82F6',
  forecast: '#D97706',
  commitment: '#6366F1',
  variance: '#EF4444',
};

const formatCurrency = (n: number) => `£${(n || 0).toLocaleString()}`;

export default function BudgetListScreen() {
  const { entries, loading: _loading, fetchEntries } = useBudgetStore();
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  }, [fetchEntries]);

  const filtered = typeFilter ? entries.filter((e) => e.entryType === typeFilter) : entries;

  const totals = entries.reduce((acc: Record<string, number>, e: any) => {
    acc[e.entryType] = (acc[e.entryType] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const totalBudget = totals.budget || 0;
  const totalActual = totals.actual || 0;
  const variance = totalBudget - totalActual;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Budget & Costs</Text>
        <TouchableOpacity onPress={() => router.push('/budget/create')}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center">
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-medium ml-1">New</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View className="px-4 mb-3 flex-row gap-2">
        <View className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
          <Text className="text-xs text-purple-700 dark:text-purple-300">Budget</Text>
          <Text className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(totalBudget)}</Text>
        </View>
        <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
          <Text className="text-xs text-blue-700 dark:text-blue-300">Actual</Text>
          <Text className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(totalActual)}</Text>
        </View>
        <View className={`flex-1 rounded-xl p-3 ${variance >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <Text className={`text-xs ${variance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>Variance</Text>
          <Text className={`text-base font-bold ${variance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
          </Text>
        </View>
      </View>

      {/* Type Filter */}
      <View className="px-4 pb-2">
        <FlatList
          horizontal
          data={TYPES}
          keyExtractor={(t) => t}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setTypeFilter(typeFilter === item ? null : item)}
              className={`px-3 py-1.5 rounded-full mr-2 ${typeFilter === item ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Text className={`text-xs font-medium ${typeFilter === item ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
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
          <View className="mx-4 mt-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: typeColors[item.entryType] || '#9CA3AF' }} />
                <Text className="font-semibold text-gray-900 dark:text-white">{item.description || 'Untitled'}</Text>
              </View>
              <Text className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</Text>
            </View>

            <View className="flex-row items-center mt-2 flex-wrap gap-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">{item.entryType}</Text>
              {item.quantity > 0 && <Text className="text-xs text-gray-400">{item.quantity} {item.unit}</Text>}
              {item.vendor && <Text className="text-xs text-gray-400">{item.vendor}</Text>}
              {item.costCode && <Text className="text-xs text-gray-400">{item.costCode}</Text>}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="cash-outline" size={48} color={COLORS.dark.textSecondary || '#9CA3AF'} />
            <Text className="text-gray-500 mt-4 text-center">
              {typeFilter ? 'No matching entries' : 'No cost entries yet.\nTap "New" to create one.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
