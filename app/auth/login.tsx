import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await signIn(email.trim(), password);
      // Auth state listener will handle navigation
    } catch (err: any) {
      setErrors({ general: err.message || 'Invalid email or password' });
    }
  };

  const bgClass = isDark ? 'bg-zinc-950' : 'bg-white';
  const cardBgClass = isDark ? 'bg-zinc-900' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-zinc-400' : 'text-gray-500';
  const inputBgClass = isDark ? 'bg-zinc-800' : 'bg-white';
  const inputBorderClass = isDark ? 'border-zinc-700' : 'border-gray-300';
  const placeholderColor = isDark ? '#71717a' : '#9ca3af';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={`flex-1 ${bgClass}`}
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo & Header */}
        <View className="items-center mb-10">
          <View className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-blue-600' : 'bg-blue-500'} items-center justify-center mb-4`}>
            <Ionicons name="construct" size={40} color="white" />
          </View>
          <Text className={`text-3xl font-bold ${textClass}`}>BuildTrack</Text>
          <Text className={`text-base ${mutedTextClass} mt-1`}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View className={`${cardBgClass} rounded-2xl p-6`}>
          {/* General Error */}
          {errors.general && (
            <View className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mb-4 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="text-red-600 dark:text-red-400 ml-2 text-sm flex-1">{errors.general}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text className={`text-sm font-medium ${textClass} mb-1.5`}>Email</Text>
            <View className={`flex-row items-center ${inputBgClass} ${inputBorderClass} border rounded-xl px-4`}>
              <Ionicons name="mail-outline" size={20} color={isDark ? '#71717a' : '#9ca3af'} />
              <TextInput
                className={`flex-1 py-3 px-3 text-base ${textClass}`}
                placeholder="you@example.com"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '', general: '' }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className={`text-sm font-medium ${textClass} mb-1.5`}>Password</Text>
            <View className={`flex-row items-center ${inputBgClass} ${inputBorderClass} border rounded-xl px-4`}>
              <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#71717a' : '#9ca3af'} />
              <TextInput
                className={`flex-1 py-3 px-3 text-base ${textClass}`}
                placeholder="Enter your password"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '', general: '' }));
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={isDark ? '#71717a' : '#9ca3af'}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`${isDark ? 'bg-blue-600' : 'bg-blue-500'} rounded-xl py-4 items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View className="flex-row justify-center mt-6">
          <Text className={mutedTextClass}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register' as any)} disabled={isLoading}>
            <Text className="text-blue-500 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
