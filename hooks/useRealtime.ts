import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useRealtime(
  table: string,
  onChange: (payload: any) => void
) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`${table}_realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          onChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, user, onChange]);
}

export function useRealtimeProject(projectId: string, onChange: (payload: any) => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !projectId) return;

    const tables = ['tasks', 'incidents', 'inspections'] as const;
    const channels = tables.map((tableName) =>
      supabase
        .channel(`project_${projectId}_${tableName}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: `project_id=eq.${projectId}`,
          },
          (payload: any) => {
            onChange({ tableName: tableName, ...payload });
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [projectId, user, onChange]);
}
