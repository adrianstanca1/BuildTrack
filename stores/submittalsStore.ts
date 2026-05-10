import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Submittal, SubmittalStatus } from '../types/field';

interface SubmittalsState {
  submittals: Submittal[];
  loading: boolean;
  error: string | null;

  setSubmittals: (submittals: Submittal[]) => void;
  addSubmittal: (submittal: Submittal) => void;
  updateSubmittal: (id: string, updates: Partial<Submittal>) => void;
  removeSubmittal: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getSubmittalsByProject: (projectId: string) => Submittal[];
  getSubmittalsByStatus: (status: SubmittalStatus) => Submittal[];

  fetchSubmittals: () => Promise<void>;
  createSubmittal: (submittal: Omit<Submittal, 'id' | 'createdAt'>) => Promise<Submittal | null>;
  deleteSubmittal: (id: string) => Promise<void>;
}

export const useSubmittalsStore = create<SubmittalsState>()(
  persist(
    (set, get) => ({
      submittals: [],
      loading: false,
      error: null,

      setSubmittals: (submittals) => set({ submittals }),
      addSubmittal: (submittal) => set((state) => ({ submittals: [submittal, ...state.submittals] })),
      updateSubmittal: (id, updates) => set((state) => ({
        submittals: state.submittals.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      })),
      removeSubmittal: (id) => set((state) => ({
        submittals: state.submittals.filter((s) => s.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getSubmittalsByProject: (projectId) => get().submittals.filter((s) => s.projectId === projectId),
      getSubmittalsByStatus: (status) => get().submittals.filter((s) => s.status === status),

      fetchSubmittals: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('submittals')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const submittals = (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            projectId: item.project_id,
            projectName: item.project_name,
            status: item.status,
            type: item.type,
            description: item.description,
            specSection: item.spec_section,
            submittedBy: item.submitted_by,
            reviewedBy: item.reviewed_by,
            reviewDate: item.review_date,
            createdAt: item.created_at,
          }));

          set({ submittals, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch submittals', loading: false });
        }
      },

      createSubmittal: async (submittal) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('submittals')
            .insert({
              title: submittal.title,
              project_id: submittal.projectId,
              project_name: submittal.projectName,
              status: submittal.status,
              type: submittal.type,
              description: submittal.description,
              spec_section: submittal.specSection,
              submitted_by: submittal.submittedBy,
              reviewed_by: submittal.reviewedBy,
              review_date: submittal.reviewDate,
            })
            .select()
            .single();

          if (error) throw error;

          const newSubmittal: Submittal = {
            id: data.id,
            title: data.title,
            projectId: data.project_id,
            projectName: data.project_name,
            status: data.status,
            type: data.type,
            description: data.description,
            specSection: data.spec_section,
            submittedBy: data.submitted_by,
            reviewedBy: data.reviewed_by,
            reviewDate: data.review_date,
            createdAt: data.created_at,
          };

          set((state) => ({ submittals: [newSubmittal, ...state.submittals], loading: false }));
          return newSubmittal;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create submittal', loading: false });
          return null;
        }
      },

      deleteSubmittal: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('submittals').delete().eq('id', id);
          if (error) throw error;
          set((state) => ({
            submittals: state.submittals.filter((s) => s.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete submittal', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-submittals-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ submittals: state.submittals }),
    }
  )
);
