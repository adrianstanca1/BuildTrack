import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChangeOrdersStore } from '../../stores/changeOrdersStore';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../constants/theme';

const STATUS_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function ChangeOrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const { changeOrders, fetchChangeOrders, loading } = useChangeOrdersStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChangeOrders();
  }, [fetchChangeOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChangeOrders();
    setRefreshing(false);
  }, [fetchChangeOrders]);

  const filtered = filterStatus === 'all'
    ? changeOrders
    : changeOrders.filter((c) => c.status === filterStatus);

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return COLORS.success;
      case 'rejected': return COLORS.danger;
      case 'submitted': return COLORS.info;
      case 'under_review': return COLORS.warning;
      default: return theme.textMuted;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View className="flex-1" style={{ backgroundColor: theme.bg }}>
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>Change Orders</Text>
            <Pressable
              onPress={() => router.push('/change-orders/create')}
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
                  onPress={() => router.push(`/change-orders/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold" style={{ color: theme.text }}>
                        {item.coNumber} — {item.title}
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

                  {item.description ? (
                    <Text className="text-sm mt-2" numberOfLines={2} style={{ color: theme.textSecondary }}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-xs" style={{ color: theme.textMuted }}>
                      Type: <Text style={{ color: theme.textSecondary }}>{item.type}</Text>
                    </Text>
                    {(item.impactCost !== undefined && item.impactCost !== 0) ? (
                      <Text className="text-xs font-semibold" style={{ color: COLORS.danger }}>
                        £{item.impactCost.toLocaleString()}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
                <Text className="mt-4 text-center" style={{ color: theme.textSecondary }}>
                  {filterStatus !== 'all'
                    ? `No ${filterStatus.replace(/_/g, ' ')} change orders`
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
