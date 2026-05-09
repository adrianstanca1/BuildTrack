/**
 * Offline Sync Engine for BuildTrack
 * Queues mutations when offline, auto-syncs when connection returns.
 * Conflict resolution: last-write-wins (server timestamp).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export type MutationType = 'insert' | 'update' | 'delete';

export interface SyncMutation {
  id: string;
  table: string;
  type: MutationType;
  payload: Record<string, unknown>;
  timestamp: number; // local timestamp for conflict resolution
  retryCount: number;
}

export interface SyncResult {
  success: boolean;
  mutationId: string;
  error?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

// ─── Constants ───────────────────────────────────────────────────────────────

const OFFLINE_QUEUE_KEY = '@buildtrack/offline-queue';
const LAST_SYNC_KEY = '@buildtrack/last-sync';
const SYNC_INTERVAL_MS = 15_000; // 15 seconds
const MAX_RETRIES = 3;

// ─── Network Detection ───────────────────────────────────────────────────────

let isOnlineCache = true;

/**
 * Detect network status using a lightweight fetch to the Supabase health endpoint.
 * Falls back to navigator.onLine on web if available.
 */
export async function checkNetwork(): Promise<boolean> {
  try {
    // Use a tiny HEAD request to Supabase URL with a short timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const supabaseUrl = (supabase as any).supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
    const response = await fetch(supabaseUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    isOnlineCache = response.ok || response.status === 404; // 404 = reachable but no HEAD handler
    return isOnlineCache;
  } catch {
    // Fallback for web
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      isOnlineCache = navigator.onLine;
      return isOnlineCache;
    }
    isOnlineCache = false;
    return false;
  }
}

export function isNetworkOnline(): boolean {
  return isOnlineCache;
}

// ─── Queue Management ──────────────────────────────────────────────────────────

export async function loadQueue(): Promise<SyncMutation[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveQueue(queue: SyncMutation[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueMutation(
  table: string,
  type: MutationType,
  payload: Record<string, unknown>
): Promise<SyncMutation> {
  const mutation: SyncMutation = {
    id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    table,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };
  const queue = await loadQueue();
  queue.push(mutation);
  await saveQueue(queue);
  return mutation;
}

export async function removeMutation(id: string): Promise<void> {
  const queue = await loadQueue();
  await saveQueue(queue.filter((m) => m.id !== id));
}

export async function incrementRetry(id: string): Promise<void> {
  const queue = await loadQueue();
  const idx = queue.findIndex((m) => m.id === id);
  if (idx !== -1) {
    queue[idx].retryCount += 1;
    await saveQueue(queue);
  }
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export async function getPendingCount(): Promise<number> {
  const queue = await loadQueue();
  return queue.filter((m) => m.retryCount < MAX_RETRIES).length;
}

// ─── Sync Engine ─────────────────────────────────────────────────────────────

/**
 * Apply a single mutation against Supabase.
 * For conflict resolution we rely on server-side timestamps (last-write-wins).
 */
async function applyMutation(mutation: SyncMutation): Promise<SyncResult> {
  const { table, type, payload } = mutation;

  try {
    switch (type) {
      case 'insert': {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
        break;
      }
      case 'update': {
        const id = payload.id as string | number;
        if (!id) throw new Error('Update payload missing id');
        const { error } = await supabase.from(table).update(payload).eq('id', id);
        if (error) throw error;
        break;
      }
      case 'delete': {
        const id = payload.id as string | number;
        if (!id) throw new Error('Delete payload missing id');
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        break;
      }
      default:
        throw new Error(`Unknown mutation type: ${type}`);
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

/**
 * Process the offline queue. Returns results for each attempted mutation.
 * Retries failed items up to MAX_RETRIES; drops permanently failed items.
 */
export async function processQueue(): Promise<SyncResult[]> {
  const queue = await loadQueue();
  const eligible = queue.filter((m) => m.retryCount < MAX_RETRIES);

  if (eligible.length === 0) {
    // Clean out dead items
    if (queue.length > 0) await saveQueue([]);
    return [];
  }

  const results: SyncResult[] = [];
  const remaining: SyncMutation[] = [];

  for (const mutation of eligible) {
    const result = await applyMutation(mutation);
    results.push(result);

    if (result.success) {
      // Remove from queue on success
      continue;
    }

    if (mutation.retryCount + 1 >= MAX_RETRIES) {
      // Drop permanently failed items
      continue;
    }

    // Keep for retry with incremented count
    remaining.push({
      ...mutation,
      retryCount: mutation.retryCount + 1,
    });
  }

  await saveQueue(remaining);
  return results;
}

/**
 * Full sync routine: check network, push queued mutations, update last-sync timestamp.
 */
export async function sync(): Promise<{
  success: boolean;
  results: SyncResult[];
  online: boolean;
}> {
  const online = await checkNetwork();

  if (!online) {
    return { success: false, results: [], online: false };
  }

  const results = await processQueue();
  const allOk = results.length === 0 || results.every((r) => r.success);

  if (allOk) {
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  }

  return { success: allOk, results, online: true };
}

export async function getLastSyncTime(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(LAST_SYNC_KEY);
  return raw ? parseInt(raw, 10) : null;
}

// ─── Background Polling ──────────────────────────────────────────────────────

let syncIntervalId: ReturnType<typeof setInterval> | null = null;
let syncListeners: Array<(status: SyncStatus) => void> = [];

export function onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
  syncListeners.push(listener);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== listener);
  };
}

function emitStatus(status: SyncStatus) {
  syncListeners.forEach((l) => l(status));
}

/**
 * Start background sync polling. Safe to call multiple times (idempotent).
 */
export function startBackgroundSync(): void {
  if (syncIntervalId) return; // already running

  emitStatus('idle');
  syncIntervalId = setInterval(async () => {
    const online = await checkNetwork();
    if (!online) {
      emitStatus('offline');
      return;
    }

    const pending = await getPendingCount();
    if (pending === 0) {
      emitStatus('idle');
      return;
    }

    emitStatus('syncing');
    const { success } = await sync();
    emitStatus(success ? 'idle' : 'error');
  }, SYNC_INTERVAL_MS);
}

/**
 * Stop background sync polling.
 */
export function stopBackgroundSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

// ─── Data-Fetch Helpers ──────────────────────────────────────────────────────

/**
 * Fetch from Supabase with automatic offline fallback.
 * If offline, returns previously cached data from AsyncStorage (if any).
 */
export async function fetchWithOfflineFallback<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options?: { ttlMs?: number }
): Promise<T> {
  const online = await checkNetwork();

  if (online) {
    try {
      const data = await fetcher();
      // Cache fresh data
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({ data, cachedAt: Date.now() })
      );
      return data;
    } catch (err) {
      // On fetch failure, try cache fallback
    }
  }

  // Offline or fetch failed — attempt cache
  const raw = await AsyncStorage.getItem(cacheKey);
  if (raw) {
    const parsed = JSON.parse(raw);
    const ttl = options?.ttlMs ?? 86400_000; // default 24h
    if (Date.now() - parsed.cachedAt < ttl) {
      return parsed.data as T;
    }
  }

  throw new Error('No network and no valid cache available');
}

// ─── Cleanup ───────────────────────────────────────────────────────────────────

export async function resetOfflineState(): Promise<void> {
  await AsyncStorage.multiRemove([OFFLINE_QUEUE_KEY, LAST_SYNC_KEY]);
}
