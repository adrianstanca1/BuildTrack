import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { PunchItem, PunchItemStatus, PunchItemSeverity } from '../types/field';

interface PunchItemsState {
  punchItems: PunchItem[];
  loading: boolean;
  error: string | null;

  setPunchItems: (items: PunchItem[]) => void;
  addPunchItem: (item: PunchItem) => void;
  updatePunchItem: (id: string, updates: Partial<PunchItem>) => Promise<void>;
  removePunchItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getPunchItemsByProject: (projectId: string) => PunchItem[];
  getPunchItemsByStatus: (status: PunchItemStatus) => PunchItem[];

  fetchPunchItems: () => Promise<void>;
  createPunchItem: (item: Omit<PunchItem, 'id' | 'createdAt'>) => Promise<PunchItem | null>;
  deletePunchItem: (id: string) => Promise<void>;
}

export const usePunchItemsStore = create<PunchItemsState>()(
  persist(
    (set, get) => ({
      punchItems: [],
      loading: false,
      error: null,

      setPunchItems: (items) => set({ punchItems: items }),
      addPunchItem: (item) => set((state) => ({ punchItems: [item, ...state.punchItems] })),
      updatePunchItem: async (id, updates) => {
        set((state) => ({
          punchItems: state.punchItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
        const { error } = await supabase.from('punch_items').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('punch_items', 'update', { id, ...updates });
        }
      },
      removePunchItem: (id) => set((state) => ({
        punchItems: state.punchItems.filter((i) => i.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getPunchItemsByProject: (projectId) => get().punchItems.filter((i) => i.projectId === projectId),
      getPunchItemsByStatus: (status) => get().punchItems.filter((i) => i.status === status),

      fetchPunchItems: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from('punch_items').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          set({ punchItems: data || [], loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch punch items', loading: false });
        }
      },

      createPunchItem: async (item) => {
        try {
          const { data, error } = await supabase.from('punch_items').insert(item).select().single();
          if (error) {
            useSyncStore.getState().queueMutation('punch_items', 'insert', item);
            return null;
          }
          if (data) set((state) => ({ punchItems: [data, ...state.punchItems] }));
          return data;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create punch item' });
          return null;
        }
      },

      deletePunchItem: async (id) => {
        try {
          const { error } = await supabase.from('punch_items').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('punch_items', 'delete', { id });
            return;
          }
          set((state) => ({ punchItems: state.punchItems.filter((i) => i.id !== id) }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete punch item' });
        }
      },
    }),
    {
      name: 'punch-items-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ punchItems: state.punchItems }),
    }
  )
);
