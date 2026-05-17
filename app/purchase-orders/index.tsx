import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePurchaseOrdersStore } from '../../stores/purchaseOrdersStore';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../constants/theme';

const STATUS_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'paid', label: 'Paid' },
];

export default function PurchaseOrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const { purchaseOrders, fetchPurchaseOrders, loading: _loading } = usePurchaseOrdersStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPurchaseOrders();
    setRefreshing(false);
  }, [fetchPurchaseOrders]);

  const filtered = filterStatus === 'all'
    ? purchaseOrders
    : purchaseOrders.filter((o) => o.status === filterStatus);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return COLORS.success;
      case 'delivered': return COLORS.success;
      case 'partially_delivered': return COLORS.warning;
      case 'acknowledged': return COLORS.info;
      case 'sent': return COLORS.info;
      case 'draft': return theme.textMuted;
      case 'cancelled': return COLORS.danger;
      default: return theme.textMuted;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View className="flex-1" style={{ backgroundColor: theme.bg }}>
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>Purchase Orders</Text>
            <Pressable
              onPress={() => router.push('/purchase-orders/create')}
              className="px-4 py-2 rounded-lg flex-row items-center"
              style={{ backgroundColor: COLORS.primary[600] }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          <View className="flex-row mb-4 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setFilterStatus(s.key)}
                className="mr-2 mb-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: filterStatus === s.key ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: filterStatus === s.key ? '#fff' : theme.textSecondary }}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/purchase-orders/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold" style={{ color: theme.text }}>
                        {item.poNumber} — {item.title}
                      </Text>
                      <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                        {item.projectName}
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
                        {item.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-xs" style={{ color: theme.textMuted }}>
                      {item.vendorName}
                    </Text>
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      £{item.total?.toLocaleString() || '0'}
                    </Text>
                  </View>

                  {item.deliveryDate ? (
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
                      <Text className="text-xs ml-1" style={{ color: theme.textMuted }}>
                        Delivery: {item.deliveryDate}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
                <Text className="mt-4 text-center" style={{ color: theme.textSecondary }}>
                  {filterStatus !== 'all'
                    ? `No ${filterStatus.replace(/_/g, ' ')} purchase orders`
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
