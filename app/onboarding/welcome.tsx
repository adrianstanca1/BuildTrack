import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OnboardingWelcome() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bgColor = isDark ? 'bg-zinc-950' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-zinc-400' : 'text-gray-500';

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View className="flex-1 px-8 justify-center">
        {/* Logo */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center mb-10"
        >
          <View
            className={`w-28 h-28 rounded-3xl ${
              isDark ? 'bg-blue-600' : 'bg-blue-500'
            } items-center justify-center shadow-lg`}
            style={{
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <Ionicons name="construct" size={56} color="white" />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="items-center"
        >
          <Text className={`text-4xl font-extrabold ${textColor} mb-3`}>
            BuildTrack
          </Text>
          <Text className={`text-lg ${mutedColor} text-center leading-6`}>
            Construction management{'\n'}made simple
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="mt-8 items-center"
        >
          <Text className={`text-sm ${mutedColor} text-center max-w-xs`}>
            Track projects, manage teams, log safety reports, and stay on schedule — all in one place.
          </Text>
        </Animated.View>

        {/* Stats Preview */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="mt-10"
        >
          <View
            className={`${
              isDark ? 'bg-zinc-900' : 'bg-gray-50'
            } rounded-2xl p-5`}
          >
            <View className="flex-row justify-around">
              <PreviewItem icon="construct" label="Projects" value="∞" color="#2563eb" />
              <PreviewItem icon="people" label="Workers" value="∞" color="#16a34a" />
              <PreviewItem icon="shield-checkmark" label="Safe" value="∞" color="#dc2626" />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="px-8 pb-8"
      >
        <TouchableOpacity
          onPress={() => router.push('/onboarding/features' as any)}
          className={`${isDark ? 'bg-blue-600' : 'bg-blue-500'} rounded-2xl py-4 items-center justify-center flex-row`}
        >
          <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/auth/login' as any)}
          className="mt-4 py-2 items-center"
        >
          <Text className={`text-sm ${mutedColor} font-medium`}>
            Already have an account?{' '}
            <Text className="text-blue-500 font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function PreviewItem({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="items-center">
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: color + '15' }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-lg font-bold text-gray-900 dark:text-white">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}
