import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from '../../constants/storage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  color: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const { user, signOut, isBiometricAvailable, isBiometricEnabled, enableBiometric, disableBiometric } = useAuth();
  const [bioLoading, setBioLoading] = useState(false);

  const handleBiometricToggle = async (val: boolean) => {
    if (val) {
      // Enable biometric - need password confirmation
      setBioLoading(true);
      try {
        // Prompt for password to verify before storing credentials
        // For now, we'll just enable it (user will need to re-login to store credentials)
        Alert.prompt(
          'Enable Biometric Login',
          'Please enter your password to confirm',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setBioLoading(false) },
            {
              text: 'Enable',
              onPress: (password?: string) => {
                if (!password || !user?.email) {
                  setBioLoading(false);
                  Alert.alert('Error', 'Password is required');
                  return;
                }
                setBioLoading(true);
                enableBiometric(user.email, password).then((result) => {
                  setBioLoading(false);
                  if (!result.success) {
                    Alert.alert('Error', result.error || 'Failed to enable biometric login');
                  }
                }).catch((e: Error) => {
                  setBioLoading(false);
                  Alert.alert('Error', e.message || 'Failed to enable biometric login');
                });
              },
            },
          ],
          'secure-text'
        );
      } catch (e) {
        setBioLoading(false);
      }
    } else {
      await disableBiometric();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again on next launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            Alert.alert('Done', 'Onboarding will be shown on next app launch.');
          },
        },
      ]
    );
  };

  const overviewItems: MenuItem[] = [
    { icon: 'construct-outline' as const, label: 'My Projects', value: '0', color: COLORS.primary[500], onPress: () => router.push('/(tabs)/projects') },
    { icon: 'list-outline' as const, label: 'My Tasks', value: '0', color: '#22c55e', onPress: () => router.push('/(tabs)/tasks') },
    { icon: 'people-outline' as const, label: 'Team Members', value: '0', color: '#3b82f6', onPress: () => router.push('/(tabs)/team') },
    { icon: 'notifications-outline' as const, label: 'Notifications', value: '0 unread', color: '#f59e0b', onPress: () => router.push('/(tabs)/notifications') },
  ];

  const securityItems: MenuItem[] = [
    { icon: 'shield-checkmark-outline' as const, label: 'Admin Dashboard', color: '#7c3aed', onPress: () => router.push('/(admin)' as any) },
    { icon: 'settings-outline' as const, label: 'Settings', color: '#6b7280', onPress: () => router.push('/settings') },
  ];

  const renderMenuItem = (item: MenuItem, index: number, total: number) => {
    const isLast = index === total - 1;
    return (
      <Pressable
        key={item.label}
        onPress={item.onPress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          opacity: pressed ? 0.7 : 1,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: c.border,
        })}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: RADIUS.md,
            backgroundColor: item.color + '12',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: TYPOGRAPHY.body.size, fontWeight: TYPOGRAPHY.bodyMedium.weight, color: c.text }}>
            {item.label}
          </Text>
          {item.value && (
            <Text style={{ fontSize: TYPOGRAPHY.caption.size, color: c.textMuted, marginTop: 2 }}>
              {item.value}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
            backgroundColor: c.cardBg,
            borderRadius: RADIUS.xl,
            padding: 24,
            borderWidth: 1,
            borderColor: c.border,
            ...SHADOWS.md,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: COLORS.primary[600],
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                ...SHADOWS.md,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.h2.size,
                  fontWeight: TYPOGRAPHY.h2.weight,
                  color: 'white',
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={{ fontSize: TYPOGRAPHY.h3.size, fontWeight: TYPOGRAPHY.h3.weight, color: c.text }}>
              {user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.caption.size, color: c.textMuted, marginTop: 4 }}>
              {user?.email || 'Not signed in'}
            </Text>
          </View>
        </View>

        {/* Biometric Toggle */}
        {isBiometricAvailable && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              backgroundColor: c.cardBg,
              borderRadius: RADIUS.xl,
              padding: 16,
              borderWidth: 1,
              borderColor: c.border,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.md,
                backgroundColor: '#8b5cf6' + '12',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="finger-print-outline" size={20} color="#8b5cf6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: TYPOGRAPHY.body.size, fontWeight: TYPOGRAPHY.bodyMedium.weight, color: c.text }}>
                Biometric Login
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.caption.size, color: c.textMuted, marginTop: 2 }}>
                {isBiometricEnabled ? 'Enabled' : 'Not enabled'}
              </Text>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={bioLoading}
              trackColor={{ false: c.border, true: COLORS.primary[500] }}
              thumbColor="#fff"
            />
          </View>
        )}

        {/* Overview Section */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.overline.size,
              fontWeight: TYPOGRAPHY.overline.weight,
              color: c.textMuted,
              textTransform: 'uppercase',
              letterSpacing: TYPOGRAPHY.overline.letterSpacing,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            Overview
          </Text>
          <View
            style={{
              backgroundColor: c.cardBg,
              borderRadius: RADIUS.xl,
              borderWidth: 1,
              borderColor: c.border,
              overflow: 'hidden',
            }}
          >
            {overviewItems.map((item, i) => renderMenuItem(item, i, overviewItems.length))}
          </View>
        </View>

        {/* Security Section */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.overline.size,
              fontWeight: TYPOGRAPHY.overline.weight,
              color: c.textMuted,
              textTransform: 'uppercase',
              letterSpacing: TYPOGRAPHY.overline.letterSpacing,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            Security
          </Text>
          <View
            style={{
              backgroundColor: c.cardBg,
              borderRadius: RADIUS.xl,
              borderWidth: 1,
              borderColor: c.border,
              overflow: 'hidden',
            }}
          >
            {securityItems.map((item, i) => renderMenuItem(item, i, securityItems.length))}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <Pressable
            onPress={handleResetOnboarding}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: RADIUS.xl,
              backgroundColor: c.cardBg,
              borderWidth: 1,
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
              marginBottom: 12,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.md,
                backgroundColor: '#6b7280' + '12',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="refresh" size={20} color="#6b7280" />
            </View>
            <Text style={{ fontSize: TYPOGRAPHY.body.size, fontWeight: TYPOGRAPHY.bodyMedium.weight, color: c.text, flex: 1 }}>
              Reset Onboarding
            </Text>
            <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: RADIUS.xl,
              backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(239,68,68,0.2)' : '#fecaca',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.md,
                backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="log-out" size={20} color={COLORS.danger} />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.body.size,
                fontWeight: TYPOGRAPHY.bodyMedium.weight,
                color: COLORS.danger,
                flex: 1,
              }}
            >
              Sign Out
            </Text>
          </Pressable>
        </View>

        {/* Version */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 12, color: c.textMuted }}>
            BuildTrack v1.1.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
