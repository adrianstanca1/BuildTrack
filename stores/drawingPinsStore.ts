import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { DrawingPin, DrawingPinStatus } from '../types/field';

interface DrawingPinSupabase {
  id: string;
  drawing_id: string;
  x: number;
  y: number;
  type: string;
  title?: string;
  description?: string;
  label?: string;
  status: DrawingPinStatus;
  related_id?: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

interface DrawingPinsState {
  pins: DrawingPin[];
  countsByDrawing: Record<string, number>;
  loading: boolean;
  error: string | null;

  setPins: (pins: DrawingPin[]) => void;
  addPin: (pin: DrawingPin) => void;
  updatePin: (id: string, updates: Partial<DrawingPin>) => Promise<void>;
  removePin: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getPinsByDrawing: (drawingId: string) => DrawingPin[];

  fetchPins: (drawingId?: string) => Promise<void>;
  fetchCounts: () => Promise<void>;
  createPin: (pin: Omit<DrawingPin, 'id' | 'createdAt'>) => Promise<DrawingPin | null>;
  deletePin: (id: string) => Promise<void>;
}

function fromSupabase(row: DrawingPinSupabase): DrawingPin {
  return {
    id: row.id,
    drawingId: row.drawing_id ?? '',
    x: row.x ?? 0,
    y: row.y ?? 0,
    type: (row.type as any) ?? 'note',
    title: row.title ?? row.label ?? undefined,
    label: row.label ?? undefined,
    description: row.description ?? undefined,
    relatedId: row.related_id ?? undefined,
    createdBy: row.created_by ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    status: row.status ?? 'open',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export const useDrawingPinsStore = create<DrawingPinsState>()(
  persist(
    (set, get) => ({
      pins: [],
      countsByDrawing: {},
      loading: false,
      error: null,

      setPins: (pins) => set({ pins }),
      addPin: (pin) => set((state) => ({ pins: [pin, ...state.pins] })),
      updatePin: async (id, updates) => {
        set((state) => ({
          pins: state.pins.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
        const { error } = await supabase.from('drawing_pins').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('drawing_pins', 'update', { id, ...updates });
        }
      },
      removePin: (id) => set((state) => ({
        pins: state.pins.filter((p) => p.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getPinsByDrawing: (drawingId) => get().pins.filter((p) => p.drawingId === drawingId),

      fetchPins: async (drawingId) => {
        set({ loading: true, error: null });
        try {
          let query = supabase.from('drawing_pins').select('*').order('created_at', { ascending: false });
          if (drawingId) query = query.eq('drawing_id', drawingId);

          const { data, error } = await query;

          if (error) throw error;

          const pins: DrawingPin[] = (data || []).map((item: any) => fromSupabase(item));

          set({ pins, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch pins', loading: false });
        }
      },

      fetchCounts: async () => {
        try {
          // Fetch all pin id+drawing_id rows (lightweight)
          const { data, error } = await supabase
            .from('drawing_pins')
            .select('drawing_id');
          if (error) throw error;
          const counts: Record<string, number> = {};
          (data || []).forEach((row: any) => {
            if (row.drawing_id) {
              counts[row.drawing_id] = (counts[row.drawing_id] || 0) + 1;
            }
          });
          set({ countsByDrawing: counts });
        } catch (err) {
          console.error('Failed to fetch pin counts', err);
        }
      },

      createPin: async (pinData) => {
        set({ loading: true, error: null });
        try {
          const payload = {
            drawing_id: pinData.drawingId,
            x: pinData.x,
            y: pinData.y,
            type: pinData.type,
            title: pinData.title,
            label: pinData.label,
            description: pinData.description,
            related_id: pinData.relatedId,
          };
          const { data, error } = await supabase
            .from('drawing_pins')
            .insert(payload)
            .select()
            .single();

          if (error) {
            useSyncStore.getState().queueMutation('drawing_pins', 'insert', payload);
            set({ loading: false });
            return null;
          }

          const pin: DrawingPin = fromSupabase(data);

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
