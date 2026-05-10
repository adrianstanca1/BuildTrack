import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChangeOrdersStore } from '../../stores/changeOrdersStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import type { ChangeOrderStatus, ChangeOrderType } from '../../types/field';

const ALL_STATUSES: (ChangeOrderStatus | 'all')[] = [
  'all',
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'withdrawn',
];

const ALL_TYPES: (ChangeOrderType | 'all')[] = [
  'all',
  'scope',
  'price',
  'time',
  'design',
  'other',
];

export default function ChangeOrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { changeOrders, fetchChangeOrders, loading } = useChangeOrdersStore();
  const [filterStatus, setFilterStatus] = useState<ChangeOrderStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<ChangeOrderType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChangeOrders();
  }, [fetchChangeOrders]);

  const filteredChangeOrders = changeOrders.filter((co) => {
    const matchesStatus = filterStatus === 'all' || co.status === filterStatus;
    const matchesType = filterType === 'all' || co.type === filterType;
    const matchesSearch =
      !searchQuery ||
      co.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      co.coNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      co.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChangeOrders();
    setRefreshing(false);
  }, [fetchChangeOrders]);

  const statusColor = (status: ChangeOrderStatus) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'submitted': return colors.primary;
      case 'under_review': return colors.info;
      case 'rejected': return colors.danger;
      case 'withdrawn': return colors.gray;
      case 'draft': return colors.warning;
      default: return colors.gray;
    }
  };

  const typeColor = (type: ChangeOrderType) => {
    switch (type) {
      case 'scope': return '#7c3aed';
      case 'price': return '#059669';
      case 'time': return '#d97706';
      case 'design': return '#dc2626';
      case 'other': return colors.gray;
      default: return colors.gray;
    }
  };

  const formatCurrency = (amount: number) => {
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

  const formatDate = (iso: string) => {
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

  const statusLabel = (status: ChangeOrderStatus) =>
    status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const typeLabel = (type: ChangeOrderType) =>
    type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Change Orders</Text>
            <Pressable
              onPress={() => router.push('/change-orders/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 mb-4">
            <Ionicons name="search-outline" size={18} color={colors.gray} />
            <TextInput
              className="flex-1 p-3 text-gray-900 dark:text-white"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by title, CO number, or project..."
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.gray} />
              </Pressable>
            )}
          </View>

          {/* Status Filters */}
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Status
          </Text>
          <View className="flex-row mb-3 flex-wrap">
            {ALL_STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-sm ${
                    filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {s === 'all' ? 'All' : statusLabel(s)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Type Filters */}
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Type
          </Text>
          <View className="flex-row mb-4 flex-wrap">
            {ALL_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setFilterType(t)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterType === t ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-sm ${
                    filterType === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t === 'all' ? 'All' : typeLabel(t)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredChangeOrders}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/change-orders/${item.id}` as any)}
                  className="p-4"
                >
                  {/* Top row: CO number badge + status badge */}
                  <View className="flex-row justify-between items-start mb-2">
                    <View
                      className="px-2 py-1 rounded-md"
                      style={{ backgroundColor: colors.primary + '15' }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: colors.primary }}
                      >
                        {item.coNumber}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: statusColor(item.status) + '20' }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: statusColor(item.status) }}
                      >
                        {statusLabel(item.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </Text>

                  {/* Project */}
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {item.projectName}
                  </Text>

                  {/* Type badge */}
                  <View className="flex-row items-center mb-2">
                    <View
                      className="px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: typeColor(item.type) + '15' }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: typeColor(item.type) }}
                      >
                        {typeLabel(item.type)}
                      </Text>
                    </View>
                  </View>

                  {/* Impact row */}
                  <View className="flex-row items-center mt-1">
                    {(item.impactCost ?? 0) !== 0 && (
                      <View className="flex-row items-center mr-4">
                        <Ionicons
                          name="cash-outline"
                          size={14}
                          color={(item.impactCost ?? 0) > 0 ? colors.danger : colors.success}
                        />
                        <Text
                          className="text-xs ml-1"
                          style={{
                            color: (item.impactCost ?? 0) > 0 ? colors.danger : colors.success,
                          }}
                        >
                          {(item.impactCost ?? 0) > 0 ? '+' : ''}
                          {formatCurrency(item.impactCost ?? 0)}
                        </Text>
                      </View>
                    )}
                    {(item.impactDays ?? 0) !== 0 && (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={(item.impactDays ?? 0) > 0 ? colors.warning : colors.success}
                        />
                        <Text
                          className="text-xs ml-1"
                          style={{
                            color: (item.impactDays ?? 0) > 0 ? colors.warning : colors.success,
                          }}
                        >
                          {(item.impactDays ?? 0) > 0 ? '+' : ''}
                          {item.impactDays} days
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Requested by / date */}
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="person-outline" size={12} color={colors.grayLight} />
                    <Text className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                      {item.requestedBy || 'Unknown'} · {formatDate(item.requestedDate || '')}
                    </Text>
                  </View>
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="document-text-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all' || filterType !== 'all' || searchQuery
                    ? 'No change orders match your filters.'
                    : 'No change orders yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
