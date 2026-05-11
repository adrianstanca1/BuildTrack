import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Defect, DefectStatus, DefectSeverity } from '../types/field';

interface DefectsState {
  defects: Defect[];
  loading: boolean;
  error: string | null;

  setDefects: (defects: Defect[]) => void;
  addDefect: (defect: Defect) => void;
  updateDefect: (id: string, updates: Partial<Defect>) => Promise<void>;
  removeDefect: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getDefectsByProject: (projectId: string) => Defect[];
  getDefectsByStatus: (status: DefectStatus) => Defect[];
  getDefectsBySeverity: (severity: DefectSeverity) => Defect[];

  fetchDefects: () => Promise<void>;
  createDefect: (defect: Omit<Defect, 'id' | 'createdAt'>) => Promise<Defect | null>;
  deleteDefect: (id: string) => Promise<void>;
}

export const useDefectsStore = create<DefectsState>()(
  persist(
    (set, get) => ({
      defects: [],
      loading: false,
      error: null,

      setDefects: (defects) => set({ defects }),
      addDefect: (defect) => set((state) => ({ defects: [defect, ...state.defects] })),
      updateDefect: async (id, updates) => {
        set((state) => ({
          defects: state.defects.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
        const { error } = await supabase.from('defects').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('defects', 'update', { id, ...updates });
        }
      },
      removeDefect: (id) => set((state) => ({
        defects: state.defects.filter((d) => d.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getDefectsByProject: (projectId) => get().defects.filter((d) => d.projectId === projectId),
      getDefectsByStatus: (status) => get().defects.filter((d) => d.status === status),
      getDefectsBySeverity: (severity) => get().defects.filter((d) => d.severity === severity),

      fetchDefects: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('defects')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const defects = (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            projectId: item.project_id,
            projectName: item.project_name,
            status: item.status,
            severity: item.severity,
            location: item.location,
            reportedBy: item.reported_by,
            assignedTo: item.assigned_to,
            createdAt: item.created_at,
            resolvedAt: item.resolved_at,
            photos: item.photos,
          }));

          set({ defects, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch defects', loading: false });
        }
      },

      createDefect: async (defectData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('defects')
            .insert({
              title: defectData.title,
              description: defectData.description,
              project_id: defectData.projectId,
              project_name: defectData.projectName,
              status: defectData.status,
              severity: defectData.severity,
              location: defectData.location,
              reported_by: defectData.reportedBy,
              assigned_to: defectData.assignedTo,
              resolved_at: defectData.resolvedAt,
              photos: defectData.photos,
            })
            .select()
            .single();

          if (error) throw error;

          const defect: Defect = {
            id: data.id,
            title: data.title,
            description: data.description,
            projectId: data.project_id,
            projectName: data.project_name,
            status: data.status,
            severity: data.severity,
            location: data.location,
            reportedBy: data.reported_by,
            assignedTo: data.assigned_to,
            createdAt: data.created_at,
            resolvedAt: data.resolved_at,
            photos: data.photos,
          };

          set((state) => ({ defects: [defect, ...state.defects], loading: false }));
          return defect;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create defect', loading: false });
          return null;
        }
      },

      deleteDefect: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('defects').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('defects', 'delete', { id });
            return;
          }
          set((state) => ({ defects: state.defects.filter((d) => d.id !== id), loading: false }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete defect', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-defects',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ defects: state.defects }),
    }
  )
);
