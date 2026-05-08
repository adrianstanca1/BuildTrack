import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View className="w-1/2 px-2 mb-3">
      <View className="bg-white dark:bg-gray-800 p-4 rounded-xl">
        <View className="flex-row items-center mb-2">
          <Ionicons name={icon} size={20} color={color} />
          <Text className="text-xs text-gray-500 ml-2">{label}</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{value}</Text>
      </View>
    </View>
  );
}
