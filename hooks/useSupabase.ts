import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSupabaseQuery<T>(
  table: string,
  options?: { 
    select?: string; 
    eq?: { column: string; value: unknown };
    order?: { column: string; ascending?: boolean };
  }
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    let query = supabase
      .from(table as any)
      .select(options?.select || '*');

    if (options?.eq) {
      query = query.eq(options.eq.column, options.eq.value);
    }

    if (options?.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending ?? true 
      });
    }

    const { data: result, error: queryError } = await query;

    if (queryError) {
      setError(queryError);
    } else {
      setData(result as T[]);
    }
    setLoading(false);
  }, [table, user, options?.select, options?.eq?.column, options?.eq?.value, options?.order?.column, options?.order?.ascending]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: table as any },
        () => {
          fetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, user, fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useSupabaseMutation<T>(table: string) {
  const { user } = useAuth();

  const insert = useCallback(async (data: Partial<T>) => {
    if (!user) throw new Error('Not authenticated');
    
    const { data: result, error } = await supabase
      .from(table as any)
      .insert({ ...(data as any), user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }, [table, user]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    if (!user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from(table as any)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }, [table, user]);

  const remove = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from(table as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }, [table, user]);

  return { insert, update, remove };
}
