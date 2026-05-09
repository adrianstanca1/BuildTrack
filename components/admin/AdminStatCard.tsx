import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  change?: string;
  color: string;
}

export function AdminStatCard({ icon, label, value, change, color }: AdminStatCardProps) {
  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 min-w-[140px]">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
      </View>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">{value}</Text>
      <Text className="text-xs text-gray-500 mt-1">{label}</Text>
      {change && (
        <Text className="text-xs text-green-600 mt-1 font-medium">{change}</Text>
      )}
    </View>
  );
}
