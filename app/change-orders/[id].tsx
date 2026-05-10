import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChangeOrdersStore } from '../../stores/changeOrdersStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function ChangeOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { changeOrders } = useChangeOrdersStore();

  const changeOrder = changeOrders.find((co) => co.id === id);

  useEffect(() => {
    if (!changeOrder) {
      // Could fetch here if not in store
    }
  }, [changeOrder]);

  const statusColor = (status: string) => {
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

  const typeColor = (type: string) => {
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

  const formatDate = (iso?: string) => {
    if (!iso) return 'N/A';
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

  if (!changeOrder) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
        <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
          <Ionicons name="document-text-outline" size={48} color={colors.gray} />
          <Text className="text-gray-500 mt-4">Change order not found</Text>
          <Pressable onPress={() => router.back()} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const statusLabel = changeOrder.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  const typeLabel = changeOrder.type.replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="p-4 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">{changeOrder.coNumber}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>{changeOrder.title}</Text>
          </View>
        </View>

        <ScrollView className="p-4">
          {/* Status and Type */}
          <View className="flex-row mb-4">
            <View
              className="px-3 py-1.5 rounded-full mr-2"
              style={{ backgroundColor: statusColor(changeOrder.status) + '20' }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: statusColor(changeOrder.status) }}
              >
                {statusLabel}
              </Text>
            </View>
            <View
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: typeColor(changeOrder.type) + '20' }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: typeColor(changeOrder.type) }}
              >
                {typeLabel}
              </Text>
            </View>
          </View>

          {/* Project */}
          <Card className="p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="construct-outline" size={16} color={colors.primary} />
              <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Project</Text>
            </View>
            <Text className="text-base text-gray-700 dark:text-gray-300">{changeOrder.projectName}</Text>
          </Card>

          {/* Description */}
          {changeOrder.description && (
            <Card className="p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <Ionicons name="document-text-outline" size={16} color={colors.gray} />
                <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Description</Text>
              </View>
              <Text className="text-base text-gray-700 dark:text-gray-300">{changeOrder.description}</Text>
            </Card>
          )}

          {/* Reason */}
          {changeOrder.reason && (
            <Card className="p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <Ionicons name="help-circle-outline" size={16} color={colors.gray} />
                <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Reason</Text>
              </View>
              <Text className="text-base text-gray-700 dark:text-gray-300">{changeOrder.reason}</Text>
            </Card>
          )}

          {/* Cost Impact */}
          <Card className="p-4 mb-3">
            <View className="flex-row items-center mb-3">
              <Ionicons name="cash-outline" size={16} color={colors.gray} />
              <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Cost Impact</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Original Cost</Text>
              <Text className="text-sm text-gray-900 dark:text-white">{formatCurrency(changeOrder.originalCost)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Proposed Cost</Text>
              <Text className="text-sm text-gray-900 dark:text-white">{formatCurrency(changeOrder.proposedCost)}</Text>
            </View>
            <View className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1 flex-row justify-between">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">Impact</Text>
              <Text
                className="text-sm font-semibold"
                style={{
                  color: changeOrder.impactCost > 0 ? colors.danger : changeOrder.impactCost < 0 ? colors.success : colors.gray,
                }}
              >
                {changeOrder.impactCost > 0 ? '+' : ''}{formatCurrency(changeOrder.impactCost)}
              </Text>
            </View>
          </Card>

          {/* Schedule Impact */}
          <Card className="p-4 mb-3">
            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={16} color={colors.gray} />
              <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Schedule Impact</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Original Schedule</Text>
              <Text className="text-sm text-gray-900 dark:text-white">{changeOrder.originalScheduleDays} days</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Proposed Schedule</Text>
              <Text className="text-sm text-gray-900 dark:text-white">{changeOrder.proposedScheduleDays} days</Text>
            </View>
            <View className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1 flex-row justify-between">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">Impact</Text>
              <Text
                className="text-sm font-semibold"
                style={{
                  color: changeOrder.impactDays > 0 ? colors.warning : changeOrder.impactDays < 0 ? colors.success : colors.gray,
                }}
              >
                {changeOrder.impactDays > 0 ? '+' : ''}{changeOrder.impactDays} days
              </Text>
            </View>
          </Card>

          {/* Request Details */}
          <Card className="p-4 mb-3">
            <View className="flex-row items-center mb-3">
              <Ionicons name="person-outline" size={16} color={colors.gray} />
              <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Request Details</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Requested By</Text>
              <Text className="text-sm text-gray-900 dark:text-white">{changeOrder.requestedBy}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Requested Date</Text>
              <Text className="text-sm text-gray-900 dark:text-white">{formatDate(changeOrder.requestedDate)}</Text>
            </View>
            {changeOrder.reviewedBy && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400">Reviewed By</Text>
                <Text className="text-sm text-gray-900 dark:text-white">{changeOrder.reviewedBy}</Text>
              </View>
            )}
            {changeOrder.reviewedDate && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400">Reviewed Date</Text>
                <Text className="text-sm text-gray-900 dark:text-white">{formatDate(changeOrder.reviewedDate)}</Text>
              </View>
            )}
            {changeOrder.approvedBy && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400">Approved By</Text>
                <Text className="text-sm text-gray-900 dark:text-white">{changeOrder.approvedBy}</Text>
              </View>
            )}
            {changeOrder.approvedDate && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500 dark:text-gray-400">Approved Date</Text>
                <Text className="text-sm text-gray-900 dark:text-white">{formatDate(changeOrder.approvedDate)}</Text>
              </View>
            )}
          </Card>

          {/* Notes */}
          {changeOrder.notes && (
            <Card className="p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <Ionicons name="chatbubble-outline" size={16} color={colors.gray} />
                <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">Notes</Text>
              </View>
              <Text className="text-base text-gray-700 dark:text-gray-300">{changeOrder.notes}</Text>
            </Card>
          )}

          {/* Metadata */}
          <View className="flex-row justify-between px-2 py-4">
            <Text className="text-xs text-gray-400">Created: {formatDate(changeOrder.createdAt)}</Text>
            <Text className="text-xs text-gray-400">ID: {changeOrder.id.slice(0, 8)}...</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
