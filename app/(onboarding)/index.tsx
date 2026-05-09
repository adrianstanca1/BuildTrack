import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeenOnboarding === 'true') {
        router.replace('/(tabs)');
      }
    } catch (e) {
      console.error('Error checking onboarding status:', e);
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/(onboarding)/features');
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-8">
      <View className="w-32 h-32 bg-blue-500 rounded-3xl items-center justify-center mb-8 shadow-lg">
        <Text className="text-white text-5xl font-bold">B</Text>
      </View>

      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        BuildTrack
      </Text>

      <Text className="text-lg text-gray-600 dark:text-gray-300 mb-2 text-center">
        Construction Management
      </Text>

      <Text className="text-base text-gray-500 dark:text-gray-400 mb-12 text-center leading-relaxed">
        Manage projects, track tasks, and ensure safety — all from one powerful mobile app.
      </Text>

      <TouchableOpacity
        onPress={handleGetStarted}
        className="w-full bg-blue-500 py-4 rounded-2xl items-center shadow-lg active:opacity-80"
      >
        <Text className="text-white text-lg font-semibold">Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(onboarding)/auth')}
        className="mt-4 py-2"
      >
        <Text className="text-blue-500 text-base font-medium">Skip to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
