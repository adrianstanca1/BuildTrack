/**
 * Zustand store for sync status and offline queue visibility.
 * Integrates with the offline sync engine (lib/offlineSync.ts) and
 * the API offline sync engine (lib/offlineApiSync.ts).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkNetwork,
  enqueueMutation,
  processQueue,
  getPendingCount,
  getLastSyncTime,
  startBackgroundSync,
  stopBackgroundSync,
  onSyncStatusChange,
  type SyncStatus,
  type MutationType,
} from '../lib/offlineSync';
import {
  syncApiQueue,
  getApiPendingCount,
  getLastApiSyncTime,
  isNetworkReachable,
} from '../lib/offlineApiSync';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SyncState {
  status: SyncStatus;
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  apiPendingCount: number;
  errorMessage: string | null;
  lastSyncRelative: string;

  setStatus: (status: SyncStatus) => void;
  setOnline: (online: boolean) => void;
  setLastSyncTime: (time: number) => void;
  setPendingCount: (count: number) => void;
  setApiPendingCount: (count: number) => void;
  setError: (msg: string | null) => void;

  queueMutation: (table: string, type: MutationType, payload: Record<string, any>) => Promise<void>;
  queueApiMutation: (endpoint: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body: Record<string, any>) => Promise<void>;
  triggerSync: () => Promise<boolean>;
  triggerApiSync: () => Promise<boolean>;
  triggerFullSync: () => Promise<boolean>;
  checkConnection: () => Promise<boolean>;
  startAutoSync: () => void;
  stopAutoSync: () => void;
  hydrate: () => Promise<void>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(ts: number | null): string {
  if (!ts) return 'Never';
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      isOnline: true,
      lastSyncTime: null,
      pendingCount: 0,
      apiPendingCount: 0,
      errorMessage: null,
      lastSyncRelative: 'Never',

      setStatus: (status) => set({ status }),
      setOnline: (isOnline) => set({ isOnline }),
      setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
      setPendingCount: (pendingCount) => set({ pendingCount }),
      setApiPendingCount: (apiPendingCount) => set({ apiPendingCount }),
      setError: (errorMessage) => set({ errorMessage }),

      queueMutation: async (table, type, payload) => {
        await enqueueMutation(table, type, payload);
        const count = await getPendingCount();
        set({ pendingCount: count });
        const online = await checkNetwork();
        if (online) {
          await get().triggerSync();
        }
      },

      queueApiMutation: async (endpoint, method, body) => {
        const { enqueueApiMutation } = await import('../lib/offlineApiSync');
        await enqueueApiMutation(endpoint, method, body);
        const count = await getApiPendingCount();
        set({ apiPendingCount: count });
        const online = await isNetworkReachable();
        if (online) {
          await get().triggerApiSync();
        }
      },

      triggerSync: async () => {
        set({ status: 'syncing', errorMessage: null });
        try {
          const results = await processQueue();
          const allOk = results.every((r) => r.success);
          const lastSync = await getLastSyncTime();
          set({
            status: allOk ? 'idle' : 'error',
            lastSyncTime: lastSync,
            pendingCount: await getPendingCount(),
            errorMessage: allOk
              ? null
              : results.find((r) => !r.success)?.error || 'Sync failed',
          });
          return allOk;
        } catch (err: any) {
          set({ status: 'error', errorMessage: err?.message || 'Sync error' });
          return false;
        }
      },

      triggerApiSync: async () => {
        set({ status: 'syncing', errorMessage: null });
        try {
          const { success, results } = await syncApiQueue();
          const lastSync = await getLastApiSyncTime();
          set({
            status: success ? 'idle' : 'error',
            lastSyncTime: lastSync,
            apiPendingCount: await getApiPendingCount(),
            errorMessage: success
              ? null
              : results.find((r: any) => !r.success)?.error || 'API sync failed',
          });
          return success;
        } catch (err: any) {
          set({ status: 'error', errorMessage: err?.message || 'API sync error' });
          return false;
        }
      },

      triggerFullSync: async () => {
        set({ status: 'syncing', errorMessage: null });
        try {
          const [supaResults, apiResults] = await Promise.all([
            processQueue(),
            syncApiQueue().then((r) => r.results),
          ]);
          const allOk =
            supaResults.every((r: any) => r.success) &&
            apiResults.every((r: any) => r.success);
          const lastSync = await getLastSyncTime();
          set({
            status: allOk ? 'idle' : 'error',
            lastSyncTime: lastSync,
            pendingCount: await getPendingCount(),
            apiPendingCount: await getApiPendingCount(),
            errorMessage: allOk ? null : 'Some sync items failed',
          });
          return allOk;
        } catch (err: any) {
          set({ status: 'error', errorMessage: err?.message || 'Full sync error' });
          return false;
        }
      },

      checkConnection: async () => {
        const [supaOnline, apiOnline] = await Promise.all([
          checkNetwork(),
          isNetworkReachable(),
        ]);
        const online = supaOnline || apiOnline;
        set({ isOnline: online, status: online ? 'idle' : 'offline' });
        return online;
      },

      startAutoSync: () => {
        startBackgroundSync();
        const unsub = onSyncStatusChange((status) => {
          set({ status });
        });
        (useSyncStore as any).__syncUnsub = unsub;
      },

      stopAutoSync: () => {
        stopBackgroundSync();
        const unsub = (useSyncStore as any).__syncUnsub;
        if (typeof unsub === 'function') {
          unsub();
          (useSyncStore as any).__syncUnsub = undefined;
        }
      },

      hydrate: async () => {
        const [online, pending, apiPending, lastSync] = await Promise.all([
          checkNetwork(),
          getPendingCount(),
          getApiPendingCount(),
          getLastSyncTime(),
        ]);
        set({
          isOnline: online,
          pendingCount: pending,
          apiPendingCount: apiPending,
          lastSyncTime: lastSync,
          lastSyncRelative: formatRelativeTime(lastSync),
          status: online ? (pending > 0 || apiPending > 0 ? 'syncing' : 'idle') : 'offline',
        });
      },
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// ─── Selectors ─────────────────────────────────────────────────────────────────

export function selectSyncStatus(state: SyncState): SyncStatus {
  return state.status;
}

export function selectIsOnline(state: SyncState): boolean {
  return state.isOnline;
}

export function selectPendingCount(state: SyncState): number {
  return state.pendingCount + state.apiPendingCount;
}

export function selectLastSyncRelative(state: SyncState): string {
  return formatRelativeTime(state.lastSyncTime);
}

export function selectHasErrors(state: SyncState): boolean {
  return state.status === 'error';
}
