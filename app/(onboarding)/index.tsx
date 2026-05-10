import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  FlatList,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { ONBOARDING_KEY } from '../../constants/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS, SCREEN_WIDTH } from '../../constants/theme';

const slides = [
  {
    id: '1',
    icon: 'construct',
    title: 'Manage Projects',
    description: 'Create and track construction projects with real-time updates, timelines, and budgets all in one place.',
    color: COLORS.primary[500],
    bgGradient: ['#2563eb', '#1d4ed8'],
  },
  {
    id: '2',
    icon: 'people',
    title: 'Team Management',
    description: 'Organize your workforce, assign tasks, and track worker attendance and performance effortlessly.',
    color: '#16a34a',
    bgGradient: ['#22c55e', '#16a34a'],
  },
  {
    id: '3',
    icon: 'shield-checkmark',
    title: 'Safety First',
    description: 'Log safety incidents, inspections, and compliance reports to keep your sites secure and compliant.',
    color: '#dc2626',
    bgGradient: ['#ef4444', '#dc2626'],
  },
  {
    id: '4',
    icon: 'map',
    title: 'Interactive Maps',
    description: 'View all your project sites on an interactive map with geolocation tracking and route planning.',
    color: '#9333ea',
    bgGradient: ['#a855f7', '#9333ea'],
  },
  {
    id: '5',
    icon: 'notifications',
    title: 'Stay Updated',
    description: 'Get real-time notifications for task assignments, safety alerts, and project milestones.',
    color: '#ea580c',
    bgGradient: ['#f97316', '#ea580c'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/auth/login');
  };

  const handleSkip = () => {
    handleFinish();
  };

  const progressWidth = useAnimatedStyle(() => ({
    width: withSpring(`${((currentIndex + 1) / slides.length) * 100}%`, { damping: 20, stiffness: 100 }),
  }));

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View
      style={{
        width: SCREEN_WIDTH,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: RADIUS['2xl'],
          backgroundColor: item.color + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: RADIUS.xl,
            backgroundColor: item.color,
            alignItems: 'center',
            justifyContent: 'center',
            ...SHADOWS.md,
          }}
        >
          <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={40} color="white" />
        </View>
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: TYPOGRAPHY.h1.size,
          fontWeight: TYPOGRAPHY.h1.weight,
          color: c.text,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        {item.title}
      </Text>

      {/* Description */}
      <Text
        style={{
          fontSize: TYPOGRAPHY.body.size,
          color: c.textMuted,
          textAlign: 'center',
          lineHeight: 24,
          maxWidth: 320,
        }}
      >
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Skip Button */}
      <TouchableOpacity
        onPress={handleSkip}
        style={{ alignSelf: 'flex-end', marginHorizontal: 24, marginTop: 8, padding: 8 }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            fontSize: TYPOGRAPHY.captionMedium.size,
            fontWeight: TYPOGRAPHY.captionMedium.weight,
            color: c.textMuted,
          }}
        >
          Skip
        </Text>
      </TouchableOpacity>

      {/* Slides */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          scrollEnabled={true}
          bounces={false}
        />
      </View>

      {/* Progress Indicators */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        {/* Progress Bar */}
        <View
          style={{
            height: 4,
            backgroundColor: c.border,
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          <Animated.View
            style={[
              {
                height: '100%',
                borderRadius: 2,
                backgroundColor: COLORS.primary[500],
              },
              progressWidth,
            ]}
          />
        </View>

        {/* Pagination Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? COLORS.primary[500] : c.border,
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: COLORS.primary[600],
            borderRadius: RADIUS.xl,
            paddingVertical: 16,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            ...SHADOWS.md,
          }}
          activeOpacity={0.9}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.bodyMedium.size,
              fontWeight: TYPOGRAPHY.bodyMedium.weight,
              color: 'white',
              marginRight: 8,
            }}
          >
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Ionicons
            name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
