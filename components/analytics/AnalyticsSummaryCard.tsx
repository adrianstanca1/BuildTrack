import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnalyticsSummary {
  onTimePercent: number;
  totalTasks: number;
  budgetVariance: number;
  totalIncidents: number;
  avgResponseHours: number;
  scheduleProgress: number;
}

export function AnalyticsSummaryCard({ metrics }: { metrics?: AnalyticsSummary }) {
  if (!metrics) {
    return (
      <View className="mx-4 mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <View className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </View>
    );
  }

  const items = [
    {
      label: 'On-Time',
      value: `${metrics.onTimePercent}%`,
      icon: 'checkmark-circle' as const,
      color: metrics.onTimePercent >= 80 ? '#10b981' : '#f59e0b',
    },
    {
      label: 'Budget',
      value: `${metrics.budgetVariance > 0 ? '+' : ''}${metrics.budgetVariance}%`,
      icon: 'cash' as const,
      color: metrics.budgetVariance <= 10 ? '#3b82f6' : '#ef4444',
    },
    {
      label: 'Safety',
      value: String(metrics.totalIncidents),
      icon: 'shield' as const,
      color: metrics.totalIncidents === 0 ? '#10b981' : '#ef4444',
    },
    {
      label: 'RFI Time',
      value: `${metrics.avgResponseHours}h`,
      icon: 'chatbubble' as const,
      color: metrics.avgResponseHours <= 48 ? '#10b981' : '#f59e0b',
    },
  ];

  return (
    <View className="mx-4 mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Project Analytics
      </Text>
      <View className="flex-row justify-between">
        {items.map((item) => (
          <View key={item.label} className="items-center">
            <Ionicons name={item.icon} size={20} color={item.color} />
            <Text className="mt-1 text-base font-bold text-gray-900 dark:text-white">{item.value}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
