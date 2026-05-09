import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEPS = [
  {
    icon: 'cloud-done' as const,
    title: 'Sync Ready',
    description: 'Your data syncs automatically with the cloud. Work offline, update when connected.',
    color: '#2563eb',
  },
  {
    icon: 'moon' as const,
    title: 'Dark Mode',
    description: 'Easy on the eyes at the job site. Toggle between light and dark themes.',
    color: '#7c3aed',
  },
  {
    icon: 'lock-closed' as const,
    title: 'Secure Access',
    description: 'Your data is protected with enterprise-grade encryption and role-based access.',
    color: '#16a34a',
  },
];

export default function OnboardingSetup() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const completeOnboarding = async () => {
    setLoading(true);
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    setTimeout(() => {
      router.replace('/auth/login' as any);
      setLoading(false);
    }, 600);
  };

  const bgColor = isDark ? 'bg-zinc-950' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-zinc-400' : 'text-gray-500';

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="flex-1 px-8 pt-10"
      >
        {/* Header */}
        <View className="items-center mb-10">
          <View
            className={`w-20 h-20 rounded-2xl ${
              isDark ? 'bg-green-600' : 'bg-green-500'
            } items-center justify-center mb-5`}
          >
            <Ionicons name="checkmark-done" size={40} color="white" />
          </View>
          <Text className={`text-3xl font-bold ${textColor} mb-2`}>You're All Set</Text>
          <Text className={`text-base ${mutedColor} text-center`}>
            Here's what to expect from BuildTrack
          </Text>
        </View>

        {/* Steps */}
        <View className="flex-1 justify-center">
          {STEPS.map((step, index) => (
            <View key={index} className="flex-row items-start mb-8">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: step.color + '15' }}
              >
                <Ionicons name={step.icon} size={24} color={step.color} />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-bold ${textColor} mb-1`}>{step.title}</Text>
                <Text className={`text-sm ${mutedColor} leading-5`}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom CTA */}
        <View className="pb-8">
          <TouchableOpacity
            onPress={completeOnboarding}
            disabled={loading}
            className={`${isDark ? 'bg-blue-600' : 'bg-blue-500'} rounded-2xl py-4 items-center justify-center flex-row ${
              loading ? 'opacity-80' : ''
            }`}
          >
            {loading ? (
              <Text className="text-white font-bold text-lg">Setting Up...</Text>
            ) : (
              <>
                <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
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
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
