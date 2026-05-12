/**
 * Offline-aware API client wrapper for BuildTrack.
 * Wraps the REST API client (services/api.ts) with an offline queue.
 * When offline, POST/PUT/PATCH/DELETE requests are queued in AsyncStorage
 * and replayed when the connection returns. Conflict resolution: last-write-wins.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';

let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  // Fallback: NetInfo not installed, use fetch-based check
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiMutation {
  id: string;
  endpoint: string;
  method: HttpMethod;
  body: Record<string, unknown> | null;
  timestamp: number;
  retryCount: number;
  headers?: Record<string, string>;
}

export interface ApiSyncResult {
  success: boolean;
  mutationId: string;
  error?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_QUEUE_KEY = '@buildtrack/api-offline-queue';
const LAST_API_SYNC_KEY = '@buildtrack/api-last-sync';
const MAX_RETRIES = 3;

// ─── Queue Management ─────────────────────────────────────────────────────────

export async function loadApiQueue(): Promise<ApiMutation[]> {
  const raw = await AsyncStorage.getItem(API_QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveApiQueue(queue: ApiMutation[]): Promise<void> {
  await AsyncStorage.setItem(API_QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueApiMutation(
  endpoint: string,
  method: HttpMethod,
  body: Record<string, unknown> | null,
  headers?: Record<string, string>
): Promise<ApiMutation> {
  const mutation: ApiMutation = {
    id: `api-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    endpoint,
    method,
    body,
    timestamp: Date.now(),
    retryCount: 0,
    headers,
  };
  const queue = await loadApiQueue();
  queue.push(mutation);
  await saveApiQueue(queue);
  return mutation;
}

export async function removeApiMutation(id: string): Promise<void> {
  const queue = await loadApiQueue();
  await saveApiQueue(queue.filter((m) => m.id !== id));
}

export async function getApiPendingCount(): Promise<number> {
  const queue = await loadApiQueue();
  return queue.filter((m) => m.retryCount < MAX_RETRIES).length;
}

// ─── Network ─────────────────────────────────────────────────────────────────

export async function isNetworkReachable(): Promise<boolean> {
  if (NetInfo) {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const base = (apiClient as any).baseUrl || process.env.EXPO_PUBLIC_API_URL || 'https://api.buildtrack.app';
    const response = await fetch(base, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}

// ─── Sync Engine ─────────────────────────────────────────────────────────────

async function applyApiMutation(mutation: ApiMutation): Promise<ApiSyncResult> {
  try {
    const { endpoint, method, body, headers } = mutation;
    const url = `${apiClient['baseUrl']}/api${endpoint}`;
    const token = (apiClient as any).token;

    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': mutation.id,
      ...(headers || {}),
    };
    if (token) fetchHeaders['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }

    return { success: true, mutationId: mutation.id };
  } catch (err: any) {
    return {
      success: false,
      mutationId: mutation.id,
      error: err?.message || String(err),
    };
  }
}

export async function processApiQueue(): Promise<ApiSyncResult[]> {
  const queue = await loadApiQueue();
  const eligible = queue.filter((m) => m.retryCount < MAX_RETRIES);

  if (eligible.length === 0) {
    if (queue.length > 0) await saveApiQueue([]);
    return [];
  }

  const results: ApiSyncResult[] = [];
  const remaining: ApiMutation[] = [];

  for (const mutation of eligible) {
    const result = await applyApiMutation(mutation);
    results.push(result);

    if (result.success) continue;
    if (mutation.retryCount + 1 >= MAX_RETRIES) continue;

    remaining.push({ ...mutation, retryCount: mutation.retryCount + 1 });
  }

  await saveApiQueue(remaining);
  return results;
}

export async function syncApiQueue(): Promise<{
  success: boolean;
  results: ApiSyncResult[];
  online: boolean;
}> {
  const online = await isNetworkReachable();
  if (!online) return { success: false, results: [], online: false };

  const results = await processApiQueue();
  const allOk = results.length === 0 || results.every((r) => r.success);

  if (allOk) {
    await AsyncStorage.setItem(LAST_API_SYNC_KEY, Date.now().toString());
  }

  return { success: allOk, results, online: true };
}

export async function getLastApiSyncTime(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(LAST_API_SYNC_KEY);
  return raw ? parseInt(raw, 10) : null;
}

// ─── Offline-aware request helper ──────────────────────────────────────────────

export async function offlineRequest(
  endpoint: string,
  method: HttpMethod,
  body?: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<any> {
  const online = await isNetworkReachable();

  if (online) {
    // Online: execute directly
    const url = `${(apiClient as any).baseUrl}/api${endpoint}`;
    const token = (apiClient as any).token;
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers || {}),
    };
    if (token) fetchHeaders['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
    return data;
  }

  // Offline: queue for later
  await enqueueApiMutation(endpoint, method, body || null, headers);
  return { queued: true, mutationId: `api-${Date.now()}` };
}

// ─── Cache helpers for GET requests ──────────────────────────────────────────

export async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs = 300_000
): Promise<T> {
  const online = await isNetworkReachable();

  if (online) {
    try {
      const data = await fetcher();
      await AsyncStorage.setItem(cacheKey, JSON.stringify({ data, cachedAt: Date.now() }));
      return data;
    } catch (err) {
      // fall through to cache
    }
  }

  const raw = await AsyncStorage.getItem(cacheKey);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.cachedAt < ttlMs) {
      return parsed.data as T;
    }
  }

  throw new Error('Offline and no valid cache');
}
