import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermitsStore } from '../../stores/permitsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function PermitsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { permits, fetchPermits, loading } = usePermitsStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'expired'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredPermits = filterStatus === 'all'
    ? permits
    : permits.filter((p) => p.status === filterStatus);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPermits();
    setRefreshing(false);
  }, [fetchPermits]);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'building': return 'business';
      case 'electrical': return 'flash';
      case 'plumbing': return 'water';
      case 'demolition': return 'hammer';
      case 'scaffolding': return 'construct';
      default: return 'document';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'submitted': return colors.info;
      case 'rejected': return colors.danger;
      case 'expired': return colors.gray;
      case 'draft': return colors.warning;
      default: return colors.gray;
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const daysUntil = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate).getTime() < Date.now();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Permits</Text>
            <Pressable
              onPress={() => router.push('/permits/create')}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="flex-row mb-4">
            {(['all', 'draft', 'submitted', 'approved', 'expired'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilterStatus(s)}
                className={`mr-2 px-3 py-1.5 rounded-full ${
                  filterStatus === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm ${filterStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredPermits}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <View className="p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row flex-1">
                      <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
                        <Ionicons name={typeIcon(item.type) as any} size={18} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.projectName}</Text>
                        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">Ref: {item.referenceNumber}</Text>
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
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {item.expiryDate && (
                    <View className="flex-row items-center mt-3">
                      <Ionicons name="calendar-outline" size={14} color={isExpired(item.expiryDate) ? colors.danger : isExpiringSoon(item.expiryDate) ? colors.warning : colors.gray} />
                      <Text className={`text-xs ml-1 ${isExpired(item.expiryDate) ? 'text-red-500' : isExpiringSoon(item.expiryDate) ? 'text-yellow-500' : 'text-gray-500'}`}>
                        {isExpired(item.expiryDate)
                          ? `Expired ${new Date(item.expiryDate).toLocaleDateString()}`
                          : `Expires ${new Date(item.expiryDate).toLocaleDateString()}`}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="document-outline" size={48} color={colors.gray} />
                <Text className="text-gray-500 mt-4 text-center">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus} permits`
                    : 'No permits yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
