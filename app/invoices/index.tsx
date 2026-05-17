import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInvoicesStore } from '../../stores/invoicesStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function InvoicesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { invoices, fetchInvoices, loading: _loading } = useInvoicesStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'paid' | 'overdue'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredInvoices = filterStatus === 'all'
    ? invoices
    : invoices.filter((i) => i.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  }, [fetchInvoices]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'approved': return colors.info;
      case 'submitted': return colors.primary;
      case 'overdue': return colors.danger;
      case 'draft': return colors.warning;
      default: return colors.gray;
    }
  };

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'paid') return false;
    return new Date(dueDate).getTime() < Date.now();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</Text>
            <Pressable
              onPress={() => router.push('/invoices/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="flex-row mb-4 flex-wrap">
            {(['all', 'draft', 'submitted', 'approved', 'paid', 'overdue'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredInvoices}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/invoices/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.invoiceNumber}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.projectName}</Text>
                      {item.vendor && (
                        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">Vendor: {item.vendor}</Text>
                      )}
                    </View>
                    <View className="items-end">
                      <Text className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</Text>
                      <View
                        className="px-2 py-1 rounded-full mt-1"
                        style={{ backgroundColor: statusColor(item.status) + '20' }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: statusColor(item.status) }}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2" numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">
                        {new Date(item.issueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    {item.dueDate && (
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color={isOverdue(item.dueDate, item.status) ? colors.danger : colors.gray} />
                        <Text className={`text-xs ml-1 ${isOverdue(item.dueDate, item.status) ? 'text-red-500' : 'text-gray-500'}`}>
                          {isOverdue(item.dueDate, item.status) ? 'Overdue ' : 'Due '}
                          {new Date(item.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="receipt-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus} invoices`
                    : 'No invoices yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
