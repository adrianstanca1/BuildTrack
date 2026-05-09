import { View, Text } from 'react-native';

type StatusType = 
  | 'active' | 'completed' | 'planning' | 'on-hold' | 'cancelled'
  | 'pending' | 'in-progress'
  | 'low' | 'medium' | 'high' | 'urgent'
  | 'passed' | 'failed'
  | 'off-duty' | 'on-leave';

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Active' },
  completed: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', label: 'Completed' },
  planning: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'Planning' },
  'on-hold': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300', label: 'On Hold' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: 'Cancelled' },
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'Pending' },
  'in-progress': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', label: 'In Progress' },
  low: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Low' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'Medium' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300', label: 'High' },
  urgent: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: 'Urgent' },
  passed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Passed' },
  failed: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: 'Failed' },
  'off-duty': { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-300', label: 'Off Duty' },
  'on-leave': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'On Leave' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>{config.label}</Text>
    </View>
  );
}
