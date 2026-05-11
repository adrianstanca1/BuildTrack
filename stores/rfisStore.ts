import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Rfi, RfiStatus } from '../types/field';

interface RfisState {
  rfis: Rfi[];
  loading: boolean;
  error: string | null;

  setRfis: (rfis: Rfi[]) => void;
  addRfi: (rfi: Rfi) => void;
  updateRfi: (id: string, updates: Partial<Rfi>) => void;
  removeRfi: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getRfisByProject: (projectId: string) => Rfi[];
  getRfisByStatus: (status: RfiStatus) => Rfi[];

  fetchRfis: () => Promise<void>;
  createRfi: (rfi: Omit<Rfi, 'id' | 'createdAt'>) => Promise<Rfi | null>;
  deleteRfi: (id: string) => Promise<void>;
}

export const useRfisStore = create<RfisState>()(
  persist(
    (set, get) => ({
      rfis: [],
      loading: false,
      error: null,

      setRfis: (rfis) => set({ rfis }),
      addRfi: (rfi) => set((state) => ({ rfis: [rfi, ...state.rfis] })),
      updateRfi: (id, updates) => set((state) => ({
        rfis: state.rfis.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),
      removeRfi: (id) => set((state) => ({
        rfis: state.rfis.filter((r) => r.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getRfisByProject: (projectId) => get().rfis.filter((r) => r.projectId === projectId),
      getRfisByStatus: (status) => get().rfis.filter((r) => r.status === status),

      fetchRfis: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('rfis')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const rfis = (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            projectId: item.project_id,
            projectName: item.project_name,
            status: item.status,
            priority: item.priority,
            question: item.question,
            answer: item.answer,
            assignedTo: item.assigned_to,
            dueDate: item.due_date,
            submittedBy: item.submitted_by,
            createdAt: item.created_at,
            answeredAt: item.answered_at,
          }));

          set({ rfis, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch RFIs', loading: false });
        }
      },

      createRfi: async (rfi) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('rfis')
            .insert({
              title: rfi.title,
              project_id: rfi.projectId,
              project_name: rfi.projectName,
              status: rfi.status,
              priority: rfi.priority,
              question: rfi.question,
              answer: rfi.answer,
              assigned_to: rfi.assignedTo,
              due_date: rfi.dueDate,
              submitted_by: rfi.submittedBy,
            })
            .select()
            .single();

          if (error) throw error;

          const newRfi: Rfi = {
            id: data.id,
            title: data.title,
            projectId: data.project_id,
            projectName: data.project_name,
            status: data.status,
            priority: data.priority,
            question: data.question,
            answer: data.answer,
            assignedTo: data.assigned_to,
            dueDate: data.due_date,
            submittedBy: data.submitted_by,
            createdAt: data.created_at,
            answeredAt: data.answered_at,
          };

          set((state) => ({ rfis: [newRfi, ...state.rfis], loading: false }));
          return newRfi;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create RFI', loading: false });
          return null;
        }
      },

      deleteRfi: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('rfis').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('rfis', 'delete', { id });
            return;
          }
          set((state) => ({
            rfis: state.rfis.filter((r) => r.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete RFI', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-rfis-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ rfis: state.rfis }),
    }
  )
);
