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
import { Button, Input, Divider, SocialAuthButton, PasswordStrengthBar } from '../../components/ui';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp, signInWithProvider, enableBiometric, isLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (password.length > 72) {
      newErrors.password = 'Password must be less than 72 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setErrors({});
      await signUp(email.trim(), password);

      // Optionally enable biometric for this account
      // This will prompt for biometric auth after successful registration
      // Note: In a real app, you might want to do this after email verification
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to create account. Please try again.' });
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'apple' | 'github') => {
    try {
      setErrors({});
      await signInWithProvider(provider);
    } catch (err: any) {
      setErrors({ general: err.message || `Failed to sign up with ${provider}` });
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
          {/* Header */}
          <Animated.View
            style={{
              alignItems: 'center',
              marginTop: 32,
              marginBottom: 28,
              opacity: fadeAnim,
              transform: [{ scale: logoScale }],
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: RADIUS.xl,
                backgroundColor: COLORS.primary[600],
                alignItems: 'center',
                justifyContent: 'center',
                ...SHADOWS.md,
              }}
            >
              <Ionicons name="person-add" size={32} color="white" />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.h1.size,
                fontWeight: TYPOGRAPHY.h1.weight,
                color: c.text,
                marginTop: 16,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontSize: TYPOGRAPHY.body.size,
                color: c.textMuted,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              Start managing your construction projects today
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* General Error */}
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
                placeholder="Create a strong password"
                iconLeft="lock-closed-outline"
                isPassword
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '', general: '' }));
                }}
                error={errors.password}
                editable={!isLoading}
                hint="Min. 8 characters with uppercase, number, and symbol"
              />

              <PasswordStrengthBar password={password} />

              <View style={{ marginTop: 12 }}>
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  iconLeft="shield-checkmark-outline"
                  isPassword
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '', general: '' }));
                  }}
                  error={errors.confirmPassword}
                  editable={!isLoading}
                />
              </View>

              {/* Terms & Conditions */}
              <TouchableOpacity
                onPress={() => {
                  setAgreedToTerms(!agreedToTerms);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginTop: 16,
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: agreedToTerms ? COLORS.primary[500] : c.border,
                    backgroundColor: agreedToTerms ? COLORS.primary[500] : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                    marginTop: 1,
                  }}
                >
                  {agreedToTerms && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text style={{ flex: 1, fontSize: 13, color: c.textSecondary, lineHeight: 20 }}>
                  I agree to the{' '}
                  <Text
                    style={{ color: COLORS.primary[500], fontWeight: '600' }}
                    onPress={() => {
                      // Open terms in browser
                    }}
                  >
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={{ color: COLORS.primary[500], fontWeight: '600' }}
                    onPress={() => {
                      // Open privacy in browser
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4, marginLeft: 32 }}>
                  {errors.terms}
                </Text>
              )}

              {/* Register Button */}
              <Button
                onPress={handleRegister}
                isLoading={isLoading}
                isDisabled={isLoading}
                variant="primary"
                size="lg"
                iconRight="arrow-forward"
                style={{ marginTop: 20 }}
              >
                Create Account
              </Button>
            </View>

            {/* Divider */}
            <Divider text="or sign up with" />

            {/* Social Auth */}
            <View style={{ gap: 10 }}>
              <SocialAuthButton
                provider="google"
                onPress={() => handleSocialRegister('google')}
                disabled={isLoading}
              />
              {Platform.OS === 'ios' && (
                <SocialAuthButton
                  provider="apple"
                  onPress={() => handleSocialRegister('apple')}
                  disabled={isLoading}
                />
              )}
            </View>

            {/* Login Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28, marginBottom: 24 }}>
              <Text style={{ color: c.textMuted, fontSize: 15 }}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/login' as any)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={{ color: COLORS.primary[500], fontSize: 15, fontWeight: '600' }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
