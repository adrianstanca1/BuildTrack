import React, { useCallback } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export default function SyncStatusBar() {
  const { status, isOnline, pendingCount, lastSyncRelative, hasErrors, triggerSync } = useOfflineSync();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const border = isDark ? '#1e293b' : '#e2e8f0';

  const onPress = useCallback(() => {
    if (status === 'idle' || status === 'error' || status === 'offline') {
      triggerSync();
    }
  }, [status, triggerSync]);

  const renderContent = () => {
    if (status === 'syncing') {
      return (
        <>
          <ActivityIndicator size="small" color="#f59e0b" />
          <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '500', color: '#f59e0b' }}>
            Syncing{pendingCount > 0 ? ` (${pendingCount})` : ''}
          </Text>
        </>
      );
    }

    if (status === 'offline') {
      return (
        <>
          <Ionicons name="cloud-offline" size={14} color="#ef4444" />
          <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: '500', color: '#ef4444' }}>
            Offline{pendingCount > 0 ? ` · ${pendingCount} queued` : ''}
          </Text>
        </>
      );
    }

    if (hasErrors) {
      return (
        <>
          <Ionicons name="alert-circle" size={14} color="#dc2626" />
          <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: '500', color: '#dc2626' }}>
            Sync error{pendingCount > 0 ? ` · ${pendingCount}` : ''}
          </Text>
        </>
      );
    }

    if (pendingCount > 0) {
      return (
        <>
          <Ionicons name="cloud-upload" size={14} color="#3b82f6" />
          <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: '500', color: '#3b82f6' }}>
            {pendingCount} pending{lastSyncRelative ? ` · ${lastSyncRelative}` : ''}
          </Text>
        </>
      );
    }

    return (
      <>
        <Ionicons name="cloud-done" size={14} color="#10b981" />
        <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: '500', color: '#10b981' }}>
          {isOnline ? 'All synced' : 'Offline'} · {lastSyncRelative || 'Just now'}
        </Text>
      </>
    );
  };

  const canTap = status === 'idle' || status === 'error' || status === 'offline';

  return (
    <TouchableOpacity
      onPress={canTap ? onPress : undefined}
      activeOpacity={canTap ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: bg,
        borderBottomWidth: 1,
        borderBottomColor: border,
      }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}
