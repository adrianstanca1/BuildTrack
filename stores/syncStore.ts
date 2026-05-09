/**
 * Zustand store for sync status and offline queue visibility.
 * Integrates with the offline sync engine (lib/offlineSync.ts).
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

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SyncState {
  // Status
  status: SyncStatus;
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  errorMessage: string | null;

  // Actions
  setStatus: (status: SyncStatus) => void;
  setOnline: (online: boolean) => void;
  setLastSyncTime: (time: number) => void;
  setPendingCount: (count: number) => void;
  setError: (msg: string | null) => void;

  // Operations
  queueMutation: (table: string, type: MutationType, payload: Record<string, any>) => Promise<void>;
  triggerSync: () => Promise<boolean>;
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
      errorMessage: null,

      setStatus: (status) => set({ status }),
      setOnline: (isOnline) => set({ isOnline }),
      setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
      setPendingCount: (pendingCount) => set({ pendingCount }),
      setError: (errorMessage) => set({ errorMessage }),

      /**
       * Queue a mutation for later sync (or immediate if online).
       * Always writes to the offline queue first for durability.
       */
      queueMutation: async (table, type, payload) => {
        await enqueueMutation(table, type, payload);
        const count = await getPendingCount();
        set({ pendingCount: count });

        // Attempt immediate sync if online
        const online = await checkNetwork();
        if (online) {
          await get().triggerSync();
        }
      },

      /**
       * Manually trigger a sync cycle.
       */
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

      /**
       * Check network connectivity and update state.
       */
      checkConnection: async () => {
        const online = await checkNetwork();
        set({ isOnline: online, status: online ? 'idle' : 'offline' });
        return online;
      },

      /**
       * Start automatic background sync polling.
       * Hooks into the sync engine's status listener.
       */
      startAutoSync: () => {
        startBackgroundSync();

        // Wire engine status changes into Zustand state
        const unsub = onSyncStatusChange((status) => {
          set({ status });
        });

        // Store unsub for cleanup (via module-level ref if needed)
        // Here we attach it to the store instance for use in stopAutoSync
        (useSyncStore as any).__syncUnsub = unsub;
      },

      /**
       * Stop automatic background sync polling.
       */
      stopAutoSync: () => {
        stopBackgroundSync();
        const unsub = (useSyncStore as any).__syncUnsub;
        if (typeof unsub === 'function') {
          unsub();
          (useSyncStore as any).__syncUnsub = undefined;
        }
      },

      /**
       * Hydrate state from persisted/AsyncStorage on app startup.
       */
      hydrate: async () => {
        const [online, pending, lastSync] = await Promise.all([
          checkNetwork(),
          getPendingCount(),
          getLastSyncTime(),
        ]);
        set({
          isOnline: online,
          pendingCount: pending,
          lastSyncTime: lastSync,
          status: online ? (pending > 0 ? 'syncing' : 'idle') : 'offline',
        });
      },
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist lightweight meta-state
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
  return state.pendingCount;
}

export function selectLastSyncRelative(state: SyncState): string {
  return formatRelativeTime(state.lastSyncTime);
}

export function selectHasErrors(state: SyncState): boolean {
  return state.status === 'error';
}
