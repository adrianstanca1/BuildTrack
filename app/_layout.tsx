import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from '../constants/storage';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasOnboarded(!!value);
    });
  }, []);

  useEffect(() => {
    if (isLoading || hasOnboarded === null) return;

    const inAuthGroup = segments.length > 0 && String(segments[0] || '').startsWith('auth');
    const inOnboarding = segments.length > 0 && String(segments[0] || '').startsWith('onboarding');

    if (!hasOnboarded && !inOnboarding && !inAuthGroup) {
      router.replace('/onboarding' as any);
    } else if (!user && !inAuthGroup && !inOnboarding) {
      router.replace('/auth/login' as any);
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [user, isLoading, segments, hasOnboarded]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <AuthProvider>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen
                name="(modals)/project-details"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="(modals)/task-details"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="(modals)/safety-report"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen
                name="(modals)/worker-details"
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen name="defects" />
              <Stack.Screen name="permits" />
              <Stack.Screen name="timesheets" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="(admin)" />
              <Stack.Screen name="quick-actions" />
            </Stack>
          </AuthGuard>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
