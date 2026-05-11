import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { DrawingPin, DrawingPinType } from '../types/field';

interface DrawingPinsState {
  pins: DrawingPin[];
  loading: boolean;
  error: string | null;

  setPins: (pins: DrawingPin[]) => void;
  addPin: (pin: DrawingPin) => void;
  updatePin: (id: string, updates: Partial<DrawingPin>) => void;
  removePin: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getPinsByDrawing: (drawingId: string) => DrawingPin[];
  getPinsByType: (type: DrawingPinType) => DrawingPin[];

  fetchPins: (drawingId?: string) => Promise<void>;
  createPin: (pin: Omit<DrawingPin, 'id' | 'createdAt'>) => Promise<DrawingPin | null>;
  deletePin: (id: string) => Promise<void>;
}

export const useDrawingPinsStore = create<DrawingPinsState>()(
  persist(
    (set, get) => ({
      pins: [],
      loading: false,
      error: null,

      setPins: (pins) => set({ pins }),
      addPin: (pin) => set((state) => ({ pins: [pin, ...state.pins] })),
      updatePin: (id, updates) => set((state) => ({
        pins: state.pins.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      removePin: (id) => set((state) => ({
        pins: state.pins.filter((p) => p.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getPinsByDrawing: (drawingId) => get().pins.filter((p) => p.drawingId === drawingId),
      getPinsByType: (type) => get().pins.filter((p) => p.type === type),

      fetchPins: async (drawingId) => {
        set({ loading: true, error: null });
        try {
          let query = supabase.from('drawing_pins').select('*').order('created_at', { ascending: false });
          if (drawingId) query = query.eq('drawing_id', drawingId);

          const { data, error } = await query;

          if (error) throw error;

          const pins: DrawingPin[] = (data || []).map((item: any) => ({
            id: item.id,
            drawingId: item.drawing_id ?? '',
            x: item.x ?? 0,
            y: item.y ?? 0,
            type: item.type ?? 'note',
            title: item.title ?? undefined,
            description: item.description ?? undefined,
            relatedId: item.related_id ?? undefined,
            createdBy: item.created_by ?? undefined,
            createdAt: item.created_at ?? new Date().toISOString(),
          }));

          set({ pins, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch pins', loading: false });
        }
      },

      createPin: async (pinData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('drawing_pins')
            .insert({
              drawing_id: pinData.drawingId,
              x: pinData.x,
              y: pinData.y,
              type: pinData.type,
              title: pinData.title,
              description: pinData.description,
              related_id: pinData.relatedId,
            })
            .select()
            .single();

          if (error) throw error;

          const pin: DrawingPin = {
            id: data.id,
            drawingId: data.drawing_id ?? '',
            x: data.x ?? 0,
            y: data.y ?? 0,
            type: data.type ?? 'note',
            title: data.title ?? undefined,
            description: data.description ?? undefined,
            relatedId: data.related_id ?? undefined,
            createdBy: data.created_by ?? undefined,
            createdAt: data.created_at ?? new Date().toISOString(),
          };

          set((state) => ({ pins: [pin, ...state.pins], loading: false }));
          return pin;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create pin', loading: false });
          return null;
        }
      },

      deletePin: async (id) => {
        set((state) => ({ pins: state.pins.filter((p) => p.id !== id) }));
        await supabase.from('drawing_pins').delete().eq('id', id);
      },
    }),
    {
      name: 'drawing-pins-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
