import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';

interface CostEntry {
  id: string;
  projectId?: string;
  budgetCategoryId?: string;
  entryType: string;
  description?: string;
  amount: number;
  quantity: number;
  unit?: string;
  vendor?: string;
  costCode?: string;
  date?: string;
  notes?: string;
  createdAt: string;
}

interface BudgetState {
  entries: CostEntry[];
  loading: boolean;
  error: string | null;

  fetchEntries: () => Promise<void>;
  createEntry: (data: Omit<CostEntry, 'id' | 'createdAt'>) => Promise<CostEntry | null>;
  updateEntry: (id: string, updates: Partial<CostEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      entries: [],
      loading: false,
      error: null,

      fetchEntries: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('cost_entries' as any)
            .select('*')
            .order('date', { ascending: false })
            .limit(100);

          if (error) throw error;

          const entries: CostEntry[] = ((data as any[]) || []).map((item: any) => ({
            id: item.id,
            projectId: item.project_id,
            budgetCategoryId: item.budget_category_id,
            entryType: item.entry_type,
            description: item.description,
            amount: item.amount || 0,
            quantity: item.quantity || 1,
            unit: item.unit,
            vendor: item.vendor,
            costCode: item.cost_code,
            date: item.date,
            notes: item.notes,
            createdAt: item.created_at,
          }));

          set({ entries, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch', loading: false });
        }
      },

      createEntry: async (entryData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('cost_entries' as any)
            .insert({
              project_id: entryData.projectId,
              budget_category_id: entryData.budgetCategoryId,
              entry_type: entryData.entryType,
              description: entryData.description,
              amount: entryData.amount,
              quantity: entryData.quantity,
              unit: entryData.unit,
              vendor: entryData.vendor,
              cost_code: entryData.costCode,
              date: entryData.date,
              notes: entryData.notes,
            })
            .select()
            .single();

          if (error) throw error;

          const entry: CostEntry = {
            id: (data as any).id,
            projectId: (data as any).project_id,
            budgetCategoryId: (data as any).budget_category_id,
            entryType: (data as any).entry_type,
            description: (data as any).description,
            amount: (data as any).amount || 0,
            quantity: (data as any).quantity || 1,
            unit: (data as any).unit,
            vendor: (data as any).vendor,
            costCode: (data as any).cost_code,
            date: (data as any).date,
            notes: (data as any).notes,
            createdAt: (data as any).created_at,
          };

          set((state) => ({ entries: [entry, ...state.entries], loading: false }));
          return entry;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create', loading: false });
          return null;
        }
      },

      deleteEntry: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('cost_entries').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('cost_entries', 'delete', { id });
            return;
          }
          set((state) => ({ entries: state.entries.filter((e) => e.id !== id), loading: false }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete', loading: false });
        }
      },

      updateEntry: async (id, updates) => {
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
        const { error } = await supabase.from('cost_entries').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('cost_entries', 'update', { id, ...updates });
        }
      },
    }),
    {
      name: 'buildtrack-budget',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
