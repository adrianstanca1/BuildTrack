import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }

      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-gray-900"
    >
      <View className="flex-1 justify-center px-8">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Get Started'}
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 mb-8">
          {isLogin
            ? 'Sign in to continue managing your projects'
            : 'Create an account to start tracking'}
        </Text>

        {error ? (
          <View className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl mb-4">
            <Text className="text-red-600 dark:text-red-400 text-sm">{error}</Text>
          </View>
        ) : null}

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl text-base"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl text-base"
          />
        </View>

        <TouchableOpacity
          onPress={handleAuth}
          disabled={loading}
          className={`w-full py-4 rounded-2xl items-center shadow-lg ${
            loading ? 'bg-gray-400' : 'bg-blue-500 active:opacity-80'
          }`}
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          className="mt-6 items-center"
        >
          <Text className="text-blue-500 text-base font-medium">
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            AsyncStorage.setItem('hasSeenOnboarding', 'true');
            router.replace('/(tabs)');
          }}
          className="mt-4 items-center"
        >
          <Text className="text-gray-400 text-sm">Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
