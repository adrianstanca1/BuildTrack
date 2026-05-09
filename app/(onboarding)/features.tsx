import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'building' as const,
    title: 'Project Management',
    description: 'Create and manage construction projects with budgets, timelines, and team assignments.',
    color: '#3B82F6',
  },
  {
    icon: 'tasks' as const,
    title: 'Task Tracking',
    description: 'Assign tasks with priorities, track progress, and never miss a deadline.',
    color: '#10B981',
  },
  {
    icon: 'shield' as const,
    title: 'Safety First',
    description: 'Report incidents, conduct inspections, and keep your team safe on site.',
    color: '#EF4444',
  },
];

export default function FeaturesScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderItem = ({ item }: { item: typeof FEATURES[0] }) => (
    <View className="flex-1 items-center justify-center px-8" style={{ width }}>
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${item.color}20` }}
      >
        <FontAwesome name={item.icon} size={40} color={item.color} />
      </View>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        {item.title}
      </Text>
      <Text className="text-base text-gray-600 dark:text-gray-300 text-center leading-relaxed">
        {item.description}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <FlatList
        data={FEATURES}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View className="flex-row justify-center pb-8 gap-2">
        {FEATURES.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-blue-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </View>

      <View className="px-8 pb-12">
        {currentIndex === FEATURES.length - 1 ? (
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/auth')}
            className="w-full bg-blue-500 py-4 rounded-2xl items-center shadow-lg active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/auth')}
            className="w-full py-4 items-center"
          >
            <Text className="text-gray-500 dark:text-gray-400 text-base font-medium">Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
