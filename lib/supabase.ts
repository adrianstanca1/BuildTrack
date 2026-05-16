import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare const __DEV__: boolean;

// ─── Environment Detection ──────────────────────────────────────────────
// EXPO_PUBLIC_ vars are inlined at build time by Expo/EAS.
// Fallback chain: env var → channel detection → local dev defaults.
const isProductionChannel =
  process.env.EXPO_PUBLIC_CHANNEL === 'production' ||
  process.env.EXPO_PUBLIC_CHANNEL === 'preview';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (isProductionChannel
    ? 'https://buildtrack.cortexbuildpro.com'
    : (typeof __DEV__ !== 'undefined' && __DEV__)
      ? 'http://127.0.0.1:54321'
      : 'https://buildtrack.cortexbuildpro.com');

const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (isProductionChannel
    ? 'eyJhbG...demo'
    : 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH');

// ─── API Base URL ───────────────────────────────────────────────────────
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (isProductionChannel
    ? 'https://buildtrack.cortexbuildpro.com/api'
    : (typeof __DEV__ !== 'undefined' && __DEV__)
      ? 'http://127.0.0.1:54321/api'
      : 'https://buildtrack.cortexbuildpro.com/api');

// ─── Custom AsyncStorage Adapter ────────────────────────────────────────
const ExpoStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// ─── Supabase Client ────────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

export type SupabaseClient = typeof supabase;

// ─── Company-aware helpers ────────────────────────────────────────────────
const COMPANY_ID_KEY = '@buildtrack/company_id';

export async function getActiveCompanyId(): Promise<string | null> {
  try {
    return await ExpoStorageAdapter.getItem(COMPANY_ID_KEY);
  } catch {
    return null;
  }
}

export async function setActiveCompanyId(companyId: string | null) {
  try {
    if (companyId) {
      await ExpoStorageAdapter.setItem(COMPANY_ID_KEY, companyId);
    } else {
      await ExpoStorageAdapter.removeItem(COMPANY_ID_KEY);
    }
  } catch {
    // noop
  }
}

// Inject company_id into outgoing request headers when present
try {
  const _global = globalThis as any;
  const originalFetch = _global.fetch;
  _global.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const [url, init] = args;
    if (typeof url === 'string' && url.includes(supabaseUrl)) {
      const companyId = await getActiveCompanyId();
      if (companyId) {
        const headers = new Headers((init as RequestInit)?.headers);
        headers.set('X-Company-ID', companyId);
        return originalFetch(url, {
          ...(init || {}),
          headers,
        });
      }
    }
    return originalFetch(...args);
  };
} catch {
  // noop — fetch override is best-effort
}

// ─── Debug Helper (dev only) ────────────────────────────────────────────
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[BuildTrack] Supabase URL:', supabaseUrl);
  console.log('[BuildTrack] API URL:', API_URL);
  console.log('[BuildTrack] Channel:', process.env.EXPO_PUBLIC_CHANNEL || 'local');
}
