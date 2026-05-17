import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { unregisterPushTokenAsync } from '../lib/pushNotifications';
import { getAuthProvider, setAuthProvider } from '../lib/auth';
import type { Session, User, Provider } from '@supabase/supabase-js';

type TrackedAuthProvider = 'email' | 'google' | 'microsoft';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithProvider: (provider: 'google' | 'microsoft' | 'apple' | 'github') => Promise<void>;
  signInWithBiometric: () => Promise<{ success: boolean; error?: string }>;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  authProvider: TrackedAuthProvider | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enableBiometric: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  disableBiometric: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BIOMETRIC_ENABLED_KEY = '@buildtrack/biometric_enabled';
const BIOMETRIC_EMAIL_KEY = '@buildtrack/biometric_email';
// Stored in expo-secure-store (Keychain on iOS, EncryptedSharedPreferences on
// Android). SecureStore keys cannot contain `/`, so we use a different shape
// from the AsyncStorage namespace prefix used elsewhere.
const BIOMETRIC_PASSWORD_KEY = 'buildtrack_biometric_password';
// Legacy AsyncStorage key — kept only for one-time migration of returning
// users whose plaintext password was written to AsyncStorage before this
// SecureStore migration. See `migrateLegacyBiometricPassword` below.
const LEGACY_BIOMETRIC_PASSWORD_KEY = '@buildtrack/biometric_password';

// SecureStore options used for the biometric password.
// We rely on `WHEN_UNLOCKED` (the entry is readable while the device is
// unlocked) and gate access via `LocalAuthentication.authenticateAsync` at
// the JS layer — using `requireAuthentication: true` here as well would
// cause a second native biometric prompt on every read.
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

/**
 * One-time migration: if a returning user has their plaintext password
 * still sitting in AsyncStorage (pre-SecureStore), move it into SecureStore
 * and delete the AsyncStorage entry. Safe to call repeatedly — it no-ops
 * once the legacy key is gone.
 */
async function migrateLegacyBiometricPassword(): Promise<void> {
  try {
    const legacy = await AsyncStorage.getItem(LEGACY_BIOMETRIC_PASSWORD_KEY);
    if (!legacy) return;
    await SecureStore.setItemAsync(
      BIOMETRIC_PASSWORD_KEY,
      legacy,
      SECURE_STORE_OPTIONS,
    );
    await AsyncStorage.removeItem(LEGACY_BIOMETRIC_PASSWORD_KEY);
  } catch {
    // Best-effort: a failed migration leaves the legacy entry in place so we
    // can retry on the next biometric attempt. Do not throw — we don't want
    // to break the boot path if SecureStore is briefly unavailable.
  }
}

function normalizeProvider(p: Provider): TrackedAuthProvider | null {
  if (p === 'google') return 'google';
  if (p === 'azure') return 'microsoft';
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [authProvider, setAuthProviderState] = useState<TrackedAuthProvider | null>(null);

  // Check biometric availability + migrate any legacy plaintext password
  // from AsyncStorage into SecureStore on first run after upgrade.
  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(compatible && enrolled);

        const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        setIsBiometricEnabled(enabled === 'true');

        // Fire-and-forget: only relevant for upgraders, no-op otherwise.
        migrateLegacyBiometricPassword();
      } catch {
        setIsBiometricAvailable(false);
        setIsBiometricEnabled(false);
      }
    };
    checkBiometric();
  }, []);

  // Track auth provider whenever the user changes
  useEffect(() => {
    let mounted = true;
    if (!user) {
      if (mounted) setAuthProviderState(null);
      return;
    }
    getAuthProvider().then((provider) => {
      if (!mounted) return;
      if (provider) {
        setAuthProviderState(provider);
      } else if (user?.email) {
        setAuthProviderState('email');
      }
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  // Listen for auth state
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await setAuthProvider('email');
    setAuthProviderState('email');
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'buildtrack://auth/callback',
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await unregisterPushTokenAsync().catch(() => {});
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await setAuthProvider(null);
    // Don't clear biometric credentials on sign out - user might want to use them again
  }, []);

  const signInWithProvider = useCallback(async (provider: any) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'microsoft' ? 'azure' : (provider as Provider),
      options: {
        redirectTo: 'buildtrack://auth/callback',
      },
    });
    if (error) throw error;
    const mapped = normalizeProvider(provider);
    if (mapped) {
      await setAuthProvider(mapped);
      setAuthProviderState(mapped);
    }
  }, []);

  const signInWithBiometric = useCallback(async () => {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      if (enabled !== 'true') {
        return { success: false, error: 'Biometric login not enabled' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to sign in',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        return { success: false, error: result.error || 'Authentication failed' };
      }

      // Belt-and-braces: ensure any legacy plaintext password has been
      // migrated out of AsyncStorage before reading from SecureStore. This
      // handles the case where the boot-time migration was skipped or
      // raced (e.g. user opens biometric login immediately on cold start).
      await migrateLegacyBiometricPassword();

      const [email, password] = await Promise.all([
        AsyncStorage.getItem(BIOMETRIC_EMAIL_KEY),
        SecureStore.getItemAsync(BIOMETRIC_PASSWORD_KEY, SECURE_STORE_OPTIONS),
      ]);

      if (!email || !password) {
        return { success: false, error: 'No saved credentials found' };
      }

      await signIn(email, password);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Biometric authentication failed' };
    }
  }, [signIn]);

  const enableBiometric = useCallback(async (email: string, password: string) => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric login',
        fallbackLabel: 'Use password',
      });

      if (!result.success) {
        return { success: false, error: result.error || 'Authentication failed' };
      }

      await Promise.all([
        AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true'),
        AsyncStorage.setItem(BIOMETRIC_EMAIL_KEY, email),
        SecureStore.setItemAsync(
          BIOMETRIC_PASSWORD_KEY,
          password,
          SECURE_STORE_OPTIONS,
        ),
        // Defensive: if a legacy AsyncStorage entry is still around (e.g.
        // user re-enables biometrics before migration ran), wipe it.
        AsyncStorage.removeItem(LEGACY_BIOMETRIC_PASSWORD_KEY),
      ]);

      setIsBiometricEnabled(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to enable biometric login' };
    }
  }, []);

  const disableBiometric = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY),
      AsyncStorage.removeItem(BIOMETRIC_EMAIL_KEY),
      SecureStore.deleteItemAsync(BIOMETRIC_PASSWORD_KEY, SECURE_STORE_OPTIONS),
      // Also wipe any legacy AsyncStorage entry left behind by upgraders.
      AsyncStorage.removeItem(LEGACY_BIOMETRIC_PASSWORD_KEY),
    ]);
    setIsBiometricEnabled(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'buildtrack://auth/reset-password',
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isBiometricAvailable,
        isBiometricEnabled,
        authProvider,
        signIn,
        signUp,
        signOut,
        signInWithProvider,
        signInWithBiometric,
        enableBiometric,
        disableBiometric,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
