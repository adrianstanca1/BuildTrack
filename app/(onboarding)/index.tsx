import { View, Text, Image, TouchableOpacity, useColorScheme, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { ONBOARDING_KEY } from '../../constants/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const check = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (hasSeen === 'true') {
          router.replace('/auth/login');
        }
      } catch {}
    };
    check();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/auth/login');
  };

  const bg = isDark ? 'bg-zinc-950' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-400' : 'text-gray-500';

  return (
    <SafeAreaView className={`flex-1 ${bg}`}>
      <View className="flex-1 px-8 justify-center">
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
          className="items-center mb-10"
        >
          <View
            className={`w-28 h-28 rounded-3xl ${isDark ? 'bg-blue-600' : 'bg-blue-500'} items-center justify-center shadow-lg`}
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

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="items-center">
          <Text className={`text-4xl font-extrabold ${text} mb-3`}>BuildTrack</Text>
          <Text className={`text-lg ${muted} text-center leading-6`}>
            Construction management{'\n'}made simple
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="mt-8 items-center">
          <Text className={`text-sm ${muted} text-center max-w-xs`}>
            Track projects, manage teams, log safety reports, and stay on schedule — all in one place.
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="mt-10">
          <View className={`${isDark ? 'bg-zinc-900' : 'bg-gray-50'} rounded-2xl p-5`}>
            <View className="flex-row justify-around">
              <PreviewItem icon="construct" label="Projects" color="#2563eb" />
              <PreviewItem icon="people" label="Workers" color="#16a34a" />
              <PreviewItem icon="shield-checkmark" label="Safe" color="#dc2626" />
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="px-8 pb-8">
        <TouchableOpacity
          onPress={handleGetStarted}
          className={`${isDark ? 'bg-blue-600' : 'bg-blue-500'} rounded-2xl py-4 items-center justify-center flex-row`}
        >
          <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/auth/login')} className="mt-4 py-2 items-center">
          <Text className={`text-sm ${muted} font-medium`}>
            Already have an account? <Text className="text-blue-500 font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function PreviewItem({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }) {
  return (
    <View className="items-center">
      <View className="w-12 h-12 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: color + '15' }}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-lg font-bold text-gray-900 dark:text-white">∞</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}
