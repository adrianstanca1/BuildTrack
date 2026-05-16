import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from '../constants/storage';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CompanyProvider } from '../contexts/CompanyContext';
import {
  registerForPushNotificationsAsync,
  addPushNotificationListener,
  addNotificationResponseListener,
  unregisterPushTokenAsync,
} from '../lib/pushNotifications';
import { Toast } from '../components/ui/Toast';
import { handleAuthCallback } from '../lib/auth';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasOnboarded(!!value);
    });
  }, []);

  // Handle deep-link OAuth callbacks
  useEffect(() => {
    const processUrl = async (url: string | null) => {
      if (!url) return;
      if (!url.includes('auth/callback')) return;
      try {
        await handleAuthCallback(url);
      } catch (err) {
        console.error('[DeepLink] Auth callback error:', err);
      }
    };

    // Process the URL that launched the app
    Linking.getInitialURL().then(processUrl);

    // Listen for incoming deep links while app is open
    const sub = Linking.addEventListener('url', ({ url }) => processUrl(url));
    return () => {
      sub.remove();
    };
  }, []);

  // Register push notifications when authenticated; unregister on logout
  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().catch(console.error);

      const unsubForeground = addPushNotificationListener((notification) => {
        const { title, body } = notification.request.content;
        setToast({
          visible: true,
          message: `${title ?? ''}${title && body ? ' • ' : ''}${body ?? ''}` || 'New notification',
        });
      });

      const unsubResponse = addNotificationResponseListener((response) => {
        const data = response.notification.request.content.data as any;
        if (data?.relatedId) {
          if (data.type === 'project') {
            router.push(`/(modals)/project-details?id=${data.relatedId}` as any);
          } else if (data.type === 'task') {
            router.push(`/(modals)/task-details?id=${data.relatedId}` as any);
          } else if (data.type === 'safety') {
            router.push(`/(modals)/safety-report?id=${data.relatedId}` as any);
          }
        }
      });

      return () => {
        unsubForeground();
        unsubResponse();
      };
    } else {
      unregisterPushTokenAsync().catch(console.error);
    }
  }, [user]);

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

  return (
    <>
      <Toast
        message={toast.message}
        type="info"
        visible={toast.visible}
        onDismiss={() => setToast({ visible: false, message: '' })}
        duration={4000}
      />
      {children}
    </>
  );
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
          <CompanyProvider>
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
              <Stack.Screen name="materials" />
              <Stack.Screen name="punch-items" />
              <Stack.Screen name="site-photos" />
              <Stack.Screen name="delay-notes" />
              <Stack.Screen name="drawings" />
              <Stack.Screen name="invoices" />
              <Stack.Screen name="team" />
              <Stack.Screen name="change-orders" />
            </Stack>
          </AuthGuard>
        </CompanyProvider>
      </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
