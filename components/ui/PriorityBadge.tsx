import { View, Text } from 'react-native';
import { TaskPriority } from '../../stores/tasksStore';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<TaskPriority, { bg: string; text: string }> = {
  low: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300' },
  urgent: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Text>
    </View>
  );
}
