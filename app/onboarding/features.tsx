import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Dimensions,
  FlatList,
  ViewToken,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'construct' as const,
    title: 'Project Management',
    description: 'Create and manage construction projects with budgets, timelines, and progress tracking.',
    color: '#2563eb',
  },
  {
    icon: 'list' as const,
    title: 'Task Scheduling',
    description: 'Assign tasks to workers, set priorities, and never miss a deadline with overdue alerts.',
    color: '#16a34a',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'Safety First',
    description: 'Log safety incidents, schedule inspections, and keep your team protected every day.',
    color: '#dc2626',
  },
  {
    icon: 'map' as const,
    title: 'Site Map',
    description: 'View all project locations on an interactive map. Navigate to sites with one tap.',
    color: '#0891b2',
  },
  {
    icon: 'people' as const,
    title: 'Team Management',
    description: 'Organize workers by role, track hours, and manage certifications in one place.',
    color: '#7c3aed',
  },
  {
    icon: 'notifications' as const,
    title: 'Real-time Updates',
    description: 'Get instant notifications for task assignments, deadlines, and safety alerts.',
    color: '#ea580c',
  },
];

export default function OnboardingFeatures() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const bgColor = isDark ? 'bg-zinc-950' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-zinc-400' : 'text-gray-500';

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const renderFeature = ({ item }: { item: typeof FEATURES[0] }) => {
    return (
      <View style={{ width }} className="px-8 justify-center items-center">
        <View
          className="w-40 h-40 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: item.color + '15' }}
        >
          <View
            className="w-28 h-28 rounded-full items-center justify-center"
            style={{ backgroundColor: item.color + '25' }}
          >
            <Ionicons name={item.icon} size={48} color={item.color} />
          </View>
        </View>

        <Text className={`text-2xl font-bold ${textColor} text-center mb-3`}>
          {item.title}
        </Text>
        <Text className={`text-base ${mutedColor} text-center leading-6 max-w-xs`}>
          {item.description}
        </Text>
      </View>
    );
  };

  const handleNext = () => {
    if (activeIndex < FEATURES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      router.push('/onboarding/setup' as any);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/setup' as any);
  };

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-end px-6 pt-4">
          <TouchableOpacity onPress={handleSkip}>
            <Text className={`text-sm font-medium ${mutedColor}`}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Carousel */}
        <View className="flex-1 justify-center">
          <FlatList
            ref={flatListRef}
            data={FEATURES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderFeature}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            scrollEnabled={true}
          />
        </View>

        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-8">
          {FEATURES.map((_, index) => (
            <View
              key={index}
              className="mx-1 rounded-full"
              style={{
                width: activeIndex === index ? 24 : 8,
                height: 8,
                backgroundColor:
                  activeIndex === index
                    ? '#2563eb'
                    : isDark
                    ? '#3f3f46'
                    : '#d1d5db',
              }}
            />
          ))}
        </View>

        {/* Bottom CTA */}
        <View className="px-8 pb-8">
          <TouchableOpacity
            onPress={handleNext}
            className={`${isDark ? 'bg-blue-600' : 'bg-blue-500'} rounded-2xl py-4 items-center justify-center flex-row`}
          >
            <Text className="text-white font-bold text-lg mr-2">
              {activeIndex === FEATURES.length - 1 ? "Let's Go" : 'Next'}
            </Text>
            <Ionicons
              name={activeIndex === FEATURES.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
