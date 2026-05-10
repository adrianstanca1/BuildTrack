import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePurchaseOrdersStore } from '../../stores/purchaseOrdersStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

const STATUS_OPTIONS: Array<'all' | 'draft' | 'sent' | 'acknowledged' | 'partially_delivered' | 'delivered' | 'invoiced' | 'paid' | 'cancelled'> = [
  'all', 'draft', 'sent', 'acknowledged', 'partially_delivered', 'delivered', 'invoiced', 'paid', 'cancelled'
];

export default function PurchaseOrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { purchaseOrders, fetchPurchaseOrders, loading } = usePurchaseOrdersStore();
  const [filterStatus, setFilterStatus] = useState<typeof STATUS_OPTIONS[number]>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredOrders = filterStatus === 'all'
    ? purchaseOrders
    : purchaseOrders.filter((o) => o.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPurchaseOrders();
    setRefreshing(false);
  }, [fetchPurchaseOrders]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'invoiced': return colors.info;
      case 'delivered': return colors.primary;
      case 'partially_delivered': return '#8b5cf6';
      case 'acknowledged': return '#10b981';
      case 'sent': return colors.warning;
      case 'draft': return colors.gray;
      case 'cancelled': return colors.danger;
      default: return colors.gray;
    }
  };

  const formatCurrency = (value: number) => {
    return `£${value.toFixed(2)}`;
  };

  const formatStatusLabel = (s: string) => {
    if (s === 'partially_delivered') return 'Part. Delivered';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Orders</Text>
            <Pressable
              onPress={() => router.push('/purchase-orders/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="flex-row mb-4 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {s === 'all' ? 'All' : formatStatusLabel(s)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/purchase-orders/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.poNumber} · {item.projectName}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: statusColor(item.status) + '20' }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: statusColor(item.status) }}
                      >
                        {formatStatusLabel(item.status)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center">
                      <Ionicons name="business-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">{item.vendorName}</Text>
                    </View>
                    <Text className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.total)}</Text>
                  </View>

                  {item.deliveryDate && (
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">
                        Delivery {new Date(item.deliveryDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {item.items.length > 0 && (
                    <Text className="text-xs text-gray-500 mt-2">
                      {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                    </Text>
                  )}
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="receipt-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${formatStatusLabel(filterStatus)} purchase orders`
                    : 'No purchase orders yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
