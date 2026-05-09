import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
    : __DEV__
      ? 'http://127.0.0.1:54321'
      : 'https://buildtrack.cortexbuildpro.com');

const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (isProductionChannel
    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1aWxkdHJhY2siLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0NjcxMzYwMCwiZXhwIjoyMDYyMjg5NjAwfQ.demo'
    : 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH');

// ─── API Base URL ───────────────────────────────────────────────────────
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (isProductionChannel
    ? 'https://buildtrack.cortexbuildpro.com/api'
    : __DEV__
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
});

export type SupabaseClient = typeof supabase;

// ─── Debug Helper (dev only) ────────────────────────────────────────────
if (__DEV__) {
  console.log('[BuildTrack] Supabase URL:', supabaseUrl);
  console.log('[BuildTrack] API URL:', API_URL);
  console.log('[BuildTrack] Channel:', process.env.EXPO_PUBLIC_CHANNEL || 'local');
}
