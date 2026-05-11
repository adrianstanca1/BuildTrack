import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Drawing, DrawingStatus } from '../types/field';

interface DrawingsState {
  drawings: Drawing[];
  loading: boolean;
  error: string | null;

  setDrawings: (drawings: Drawing[]) => void;
  addDrawing: (drawing: Drawing) => void;
  updateDrawing: (id: string, updates: Partial<Drawing>) => void;
  removeDrawing: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getDrawingsByProject: (projectId: string) => Drawing[];
  getDrawingsByStatus: (status: DrawingStatus) => Drawing[];

  fetchDrawings: () => Promise<void>;
  createDrawing: (drawing: Omit<Drawing, 'id' | 'createdAt'>) => Promise<Drawing | null>;
  deleteDrawing: (id: string) => Promise<void>;
}

export const useDrawingsStore = create<DrawingsState>()(
  persist(
    (set, get) => ({
      drawings: [],
      loading: false,
      error: null,

      setDrawings: (drawings) => set({ drawings }),
      addDrawing: (drawing) => set((state) => ({ drawings: [drawing, ...state.drawings] })),
      updateDrawing: (id, updates) => set((state) => ({
        drawings: state.drawings.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      })),
      removeDrawing: (id) => set((state) => ({
        drawings: state.drawings.filter((d) => d.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getDrawingsByProject: (projectId) => get().drawings.filter((d) => d.projectId === projectId),
      getDrawingsByStatus: (status) => get().drawings.filter((d) => d.status === status),

      fetchDrawings: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('drawings')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const drawings = (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            projectId: item.project_id,
            projectName: item.project_name,
            status: item.status,
            revision: item.revision,
            discipline: item.discipline,
            uploadedBy: item.uploaded_by,
            fileUrl: item.file_url,
            createdAt: item.created_at,
          }));

          set({ drawings, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch drawings', loading: false });
        }
      },

      createDrawing: async (drawing) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('drawings')
            .insert({
              title: drawing.title,
              project_id: drawing.projectId,
              project_name: drawing.projectName,
              status: drawing.status,
              revision: drawing.revision,
              discipline: drawing.discipline,
              uploaded_by: drawing.uploadedBy,
              file_url: drawing.fileUrl,
            })
            .select()
            .single();

          if (error) throw error;

          const newDrawing: Drawing = {
            id: data.id,
            title: data.title,
            projectId: data.project_id,
            projectName: data.project_name,
            status: data.status,
            revision: data.revision,
            discipline: data.discipline,
            uploadedBy: data.uploaded_by,
            fileUrl: data.file_url,
            createdAt: data.created_at,
          };

          set((state) => ({ drawings: [newDrawing, ...state.drawings], loading: false }));
          return newDrawing;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create drawing', loading: false });
          return null;
        }
      },

      deleteDrawing: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('drawings').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('drawings', 'delete', { id });
            return;
          }
          set((state) => ({
            drawings: state.drawings.filter((d) => d.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete drawing', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-drawings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ drawings: state.drawings }),
    }
  )
);
