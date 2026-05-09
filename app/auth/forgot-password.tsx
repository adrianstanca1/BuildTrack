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
import { Button, Input } from '../../components/ui';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword, isLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    try {
      setErrors({});
      await resetPassword(email.trim());
      setIsSuccess(true);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to send reset email. Please try again.' });
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
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 8, alignSelf: 'flex-start', padding: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={c.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <Animated.View
            style={{
              alignItems: 'center',
              marginTop: 24,
              marginBottom: 32,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
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
              <Ionicons name="key-outline" size={32} color="white" />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.h1.size,
                fontWeight: TYPOGRAPHY.h1.weight,
                color: c.text,
                marginTop: 20,
              }}
            >
              {isSuccess ? 'Check Your Email' : 'Reset Password'}
            </Text>
            <Text
              style={{
                fontSize: TYPOGRAPHY.body.size,
                color: c.textMuted,
                marginTop: 8,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              {isSuccess
                ? 'We\'ve sent a password reset link to your email address.'
                : 'Enter your email address and we\'ll send you a link to reset your password.'}
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

            {isSuccess ? (
              <View
                style={{
                  backgroundColor: c.cardBg,
                  borderRadius: RADIUS.xl,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: c.border,
                  ...SHADOWS.md,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="mail-unread-outline" size={32} color={COLORS.success} />
                </View>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.bodyMedium.size,
                    fontWeight: TYPOGRAPHY.bodyMedium.weight,
                    color: c.text,
                    textAlign: 'center',
                    marginBottom: 8,
                  }}
                >
                  Password reset email sent!
                </Text>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.caption.size,
                    color: c.textMuted,
                    textAlign: 'center',
                    marginBottom: 24,
                  }}
                >
                  Click the link in your email to create a new password.
                </Text>
                <Button
                  onPress={() => router.push('/auth/login' as any)}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Back to Sign In
                </Button>
              </View>
            ) : (
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

                <Button
                  onPress={handleReset}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  variant="primary"
                  size="lg"
                  iconRight="arrow-forward"
                >
                  Send Reset Link
                </Button>
              </View>
            )}

            {/* Back to Login */}
            {!isSuccess && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28, marginBottom: 24 }}>
                <Text style={{ color: c.textMuted, fontSize: 15 }}>
                  Remember your password?{' '}
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
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
