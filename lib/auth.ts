import { supabase } from './supabase';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_PROVIDER_KEY = '@buildtrack/auth_provider';

export type AuthProvider = 'email' | 'google' | 'microsoft';

function mapProviderToSupabase(provider: AuthProvider | string): string {
  if (provider === 'microsoft') return 'azure';
  return provider;
}

function mapSupabaseProvider(provider: string | undefined): AuthProvider | null {
  if (provider === 'google') return 'google';
  if (provider === 'azure' || provider === 'microsoft') return 'microsoft';
  if (!provider) return 'email';
  return null;
}

export async function getAuthProvider(): Promise<AuthProvider | null> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_PROVIDER_KEY);
    if (stored === 'email' || stored === 'google' || stored === 'microsoft') {
      return stored;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const sbProvider = user?.app_metadata?.provider as string | undefined;
    if (sbProvider) {
      return mapSupabaseProvider(sbProvider);
    }
    if (user?.email) return 'email';
    return null;
  } catch {
    return null;
  }
}

export async function setAuthProvider(provider: AuthProvider | null) {
  try {
    if (provider) {
      await AsyncStorage.setItem(AUTH_PROVIDER_KEY, provider);
    } else {
      await AsyncStorage.removeItem(AUTH_PROVIDER_KEY);
    }
  } catch {
    // noop
  }
}

export async function signInWithOAuth(provider: Exclude<AuthProvider, 'email'>) {
  const sbProvider = mapProviderToSupabase(provider);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: sbProvider as any,
    options: {
      redirectTo: 'buildtrack://auth/callback',
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (data?.url) {
    const canOpen = await Linking.canOpenURL(data.url);
    if (canOpen) {
      await Linking.openURL(data.url);
    }
  }
  await setAuthProvider(provider);
}

export async function handleAuthCallback(url: string) {
  try {
    const parsed = Linking.parse(url);

    // PKCE code flow (preferred for mobile)
    const code = parsed.queryParams?.code as string | undefined;
    if (code) {
      const exchange = (supabase.auth as any).exchangeCodeForSession;
      if (typeof exchange === 'function') {
        const { error } = await exchange(code);
        if (error) throw error;
      } else {
        await supabase.auth.refreshSession();
      }
      return;
    }

    // Implicit / token-in-fragment flow
    let access_token: string | null = null;
    let refresh_token: string | null = null;

    const fragmentMatch = url.match(/#(.*)$/);
    if (fragmentMatch) {
      const params = new URLSearchParams(fragmentMatch[1]);
      access_token = params.get('access_token');
      refresh_token = params.get('refresh_token');
    }

    if (!access_token && parsed.queryParams) {
      access_token = (parsed.queryParams.access_token as string) || null;
      refresh_token = (parsed.queryParams.refresh_token as string) || null;
    }

    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
    } else {
      await supabase.auth.refreshSession();
    }
  } catch (err: any) {
    console.error('[AuthCallback] Error handling deep link:', err);
    throw err;
  }
}

export async function signInWithSSO(domain: string) {
  const sb = supabase.auth as any;
  if (typeof sb.signInWithSSO === 'function') {
    const { error } = await sb.signInWithSSO({
      domain,
      options: {
        redirectTo: 'buildtrack://auth/callback',
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    const { data } = await sb.signInWithSSO({
      domain,
      options: { redirectTo: 'buildtrack://auth/callback', skipBrowserRedirect: true },
    });
    if (data?.url) {
      const canOpen = await Linking.canOpenURL(data.url);
      if (canOpen) {
        await Linking.openURL(data.url);
      }
    }
  } else {
    const ssoUrl = `https://buildtrack.cortexbuildpro.com/auth/v1/sso?domain=${encodeURIComponent(
      domain
    )}&redirect_to=${encodeURIComponent('buildtrack://auth/callback')}`;
    const canOpen = await Linking.canOpenURL(ssoUrl);
    if (canOpen) {
      await Linking.openURL(ssoUrl);
    } else {
      throw new Error('Unable to open SSO URL');
    }
  }
  await setAuthProvider('microsoft');
}
