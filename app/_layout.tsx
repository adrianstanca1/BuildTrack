import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
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
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
