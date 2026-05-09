/**
 * useOfflineSync hook
 * Provides components with sync status, queue operations, and auto-sync lifecycle.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useSyncStore, selectSyncStatus, selectIsOnline, selectPendingCount, selectLastSyncRelative, selectHasErrors } from '../stores/syncStore';
import type { MutationType } from '../lib/offlineSync';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UseOfflineSyncReturn {
  /** Current sync engine status */
  status: string;
  /** Is the device currently online? */
  isOnline: boolean;
  /** Number of pending mutations in the offline queue */
  pendingCount: number;
  /** Human-readable last sync time */
  lastSyncRelative: string;
  /** Whether the last sync encountered errors */
  hasErrors: boolean;
  /** Queue a mutation for sync */
  queueMutation: (table: string, type: MutationType, payload: Record<string, any>) => Promise<void>;
  /** Manually trigger a sync cycle */
  triggerSync: () => Promise<boolean>;
  /** Check current network state */
  checkConnection: () => Promise<boolean>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOfflineSync(): UseOfflineSyncReturn {
  const status = useSyncStore(selectSyncStatus);
  const isOnline = useSyncStore(selectIsOnline);
  const pendingCount = useSyncStore(selectPendingCount);
  const lastSyncRelative = useSyncStore(selectLastSyncRelative);
  const hasErrors = useSyncStore(selectHasErrors);

  const store = useSyncStore();
  const startedRef = useRef(false);

  /**
   * On mount: hydrate state from storage and start background sync.
   * On unmount: stop background sync.
   */
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    store.hydrate().then(() => {
      store.startAutoSync();
    });

    return () => {
      store.stopAutoSync();
      startedRef.current = false;
    };
  }, [store]);

  const queueMutation = useCallback(
    async (table: string, type: MutationType, payload: Record<string, any>) => {
      await store.queueMutation(table, type, payload);
    },
    [store]
  );

  const triggerSync = useCallback(async () => {
    return store.triggerSync();
  }, [store]);

  const checkConnection = useCallback(async () => {
    return store.checkConnection();
  }, [store]);

  return {
    status,
    isOnline,
    pendingCount,
    lastSyncRelative,
    hasErrors,
    queueMutation,
    triggerSync,
    checkConnection,
  };
}

// ─── Convenience: useIsOnline ────────────────────────────────────────────────

export function useIsOnline(): boolean {
  return useSyncStore(selectIsOnline);
}

// ─── Convenience: usePendingCount ──────────────────────────────────────────────

export function usePendingCount(): number {
  return useSyncStore(selectPendingCount);
}

// ─── Convenience: useSyncStatusBadge ────────────────────────────────────────────

export interface SyncBadgeInfo {
  label: string;
  color: string;
  visible: boolean;
}

export function useSyncStatusBadge(): SyncBadgeInfo {
  const status = useSyncStore(selectSyncStatus);
  const pending = useSyncStore(selectPendingCount);

  switch (status) {
    case 'syncing':
      return { label: `Syncing ${pending > 0 ? `(${pending})` : ''}`.trim(), color: '#f59e0b', visible: true };
    case 'offline':
      return { label: 'Offline', color: '#ef4444', visible: true };
    case 'error':
      return { label: 'Sync error', color: '#dc2626', visible: true };
    case 'idle':
    default:
      return { label: 'Synced', color: '#10b981', visible: false }; // hide when idle
  }
}
