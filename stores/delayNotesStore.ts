import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { DelayNote, DelayNoteStatus } from '../types/field';

interface DelayNotesState {
  delayNotes: DelayNote[];
  loading: boolean;
  error: string | null;

  setDelayNotes: (notes: DelayNote[]) => void;
  addDelayNote: (note: DelayNote) => void;
  updateDelayNote: (id: string, updates: Partial<DelayNote>) => Promise<void>;
  removeDelayNote: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getDelayNotesByProject: (projectId: string) => DelayNote[];
  getDelayNotesByStatus: (status: DelayNoteStatus) => DelayNote[];

  fetchDelayNotes: () => Promise<void>;
  createDelayNote: (note: Omit<DelayNote, 'id' | 'createdAt'>) => Promise<DelayNote | null>;
  deleteDelayNote: (id: string) => Promise<void>;
}

export const useDelayNotesStore = create<DelayNotesState>()(
  persist(
    (set, get) => ({
      delayNotes: [],
      loading: false,
      error: null,

      setDelayNotes: (notes) => set({ delayNotes: notes }),
      addDelayNote: (note) => set((state) => ({ delayNotes: [note, ...state.delayNotes] })),
      updateDelayNote: async (id, updates) => {
        set((state) => ({
          delayNotes: state.delayNotes.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
        const { error } = await supabase.from('delay_notes').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('delay_notes', 'update', { id, ...updates });
        }
      },
      removeDelayNote: (id) => set((state) => ({
        delayNotes: state.delayNotes.filter((n) => n.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getDelayNotesByProject: (projectId) => get().delayNotes.filter((n) => n.projectId === projectId),
      getDelayNotesByStatus: (status) => get().delayNotes.filter((n) => n.status === status),

      fetchDelayNotes: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from('delay_notes').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          set({ delayNotes: data || [], loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch delay notes', loading: false });
        }
      },

      createDelayNote: async (note) => {
        try {
          const { data, error } = await supabase.from('delay_notes').insert(note).select().single();
          if (error) {
            useSyncStore.getState().queueMutation('delay_notes', 'insert', note);
            return null;
          }
          if (data) set((state) => ({ delayNotes: [data, ...state.delayNotes] }));
          return data;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create delay note' });
          return null;
        }
      },

      deleteDelayNote: async (id) => {
        try {
          const { error } = await supabase.from('delay_notes').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('delay_notes', 'delete', { id });
            return;
          }
          set((state) => ({ delayNotes: state.delayNotes.filter((n) => n.id !== id) }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete delay note' });
        }
      },
    }),
    {
      name: 'delay-notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ delayNotes: state.delayNotes }),
    }
  )
);
