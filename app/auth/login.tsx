import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Divider, SocialAuthButton } from '../../components/ui';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBiometric, setShowBiometric] = useState(false);

  const { signIn, signInWithProvider, signInWithBiometric, isLoading, isBiometricAvailable, isBiometricEnabled } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();

    // Show biometric option if available and enabled
    if (isBiometricAvailable && isBiometricEnabled) {
      setShowBiometric(true);
    }
  }, [isBiometricAvailable, isBiometricEnabled]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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
      setErrors({});
      await signIn(email.trim(), password);
    } catch (err: any) {
      setErrors({ general: err.message || 'Invalid email or password' });
    }
  };

  const handleBiometricLogin = async () => {
    const result = await signInWithBiometric();
    if (!result.success) {
      setErrors({ general: result.error || 'Biometric authentication failed' });
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'github') => {
    try {
      setErrors({});
      await signInWithProvider(provider);
    } catch (err: any) {
      setErrors({ general: err.message || `Failed to sign in with ${provider}` });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <Animated.View
            style={{
              alignItems: 'center',
              marginTop: 40,
              marginBottom: 32,
              opacity: fadeAnim,
              transform: [{ scale: logoScale }],
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: RADIUS.xl,
                backgroundColor: COLORS.primary[600],
                alignItems: 'center',
                justifyContent: 'center',
                ...SHADOWS.lg,
              }}
            >
              <Ionicons name="construct" size={40} color="white" />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.h1.size,
                fontWeight: TYPOGRAPHY.h1.weight,
                color: c.text,
                marginTop: 16,
              }}
            >
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: TYPOGRAPHY.body.size,
                color: c.textMuted,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              Sign in to continue managing your projects
            </Text>
          </Animated.View>

          {/* General Error */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {errors.general && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                  borderRadius: RADIUS.md,
                  padding: 14,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
                }}
              >
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={{ color: COLORS.danger, marginLeft: 10, fontSize: 14, flex: 1, fontWeight: '500' }}>
                  {errors.general}
                </Text>
              </View>
            )}

            {/* Form */}
            <View
              style={{
                backgroundColor: c.cardBg,
                borderRadius: RADIUS.xl,
                padding: 24,
                borderWidth: 1,
                borderColor: c.border,
                ...SHADOWS.md,
              }}
            >
              <Input
                label="Email Address"
                placeholder="you@example.com"
                iconLeft="mail-outline"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '', general: '' }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                editable={!isLoading}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                iconLeft="lock-closed-outline"
                isPassword
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '', general: '' }));
                }}
                error={errors.password}
                editable={!isLoading}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push('/auth/forgot-password' as any)}
                style={{ alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 }}
                activeOpacity={0.7}
              >
                <Text style={{ color: COLORS.primary[500], fontSize: 14, fontWeight: '500' }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <Button
                onPress={handleLogin}
                isLoading={isLoading}
                isDisabled={isLoading}
                variant="primary"
                size="lg"
                iconRight="arrow-forward"
              >
                Sign In
              </Button>

              {/* Biometric Login */}
              {showBiometric && (
                <Button
                  onPress={handleBiometricLogin}
                  isDisabled={isLoading}
                  variant="secondary"
                  size="md"
                  iconLeft="finger-print-outline"
                  style={{ marginTop: 12 }}
                >
                  Sign in with Biometrics
                </Button>
              )}
            </View>

            {/* Divider */}
            <Divider text="or continue with" />

            {/* Social Auth */}
            <View style={{ gap: 10 }}>
              <SocialAuthButton
                provider="google"
                onPress={() => handleSocialLogin('google')}
                disabled={isLoading}
              />
              {Platform.OS === 'ios' && (
                <SocialAuthButton
                  provider="apple"
                  onPress={() => handleSocialLogin('apple')}
                  disabled={isLoading}
                />
              )}
            </View>

            {/* Sign Up Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28, marginBottom: 24 }}>
              <Text style={{ color: c.textMuted, fontSize: 15 }}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/register' as any)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={{ color: COLORS.primary[500], fontSize: 15, fontWeight: '600' }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
