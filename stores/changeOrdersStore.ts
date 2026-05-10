import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { ChangeOrder, ChangeOrderStatus, ChangeOrderType } from '../types/field';

interface ChangeOrdersState {
  changeOrders: ChangeOrder[];
  loading: boolean;
  error: string | null;

  setChangeOrders: (changeOrders: ChangeOrder[]) => void;
  addChangeOrder: (changeOrder: ChangeOrder) => void;
  updateChangeOrder: (id: string, updates: Partial<ChangeOrder>) => void;
  removeChangeOrder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getChangeOrdersByProject: (projectId: string) => ChangeOrder[];
  getChangeOrdersByStatus: (status: ChangeOrderStatus) => ChangeOrder[];
  getChangeOrdersByType: (type: ChangeOrderType) => ChangeOrder[];

  fetchChangeOrders: () => Promise<void>;
  createChangeOrder: (changeOrder: Omit<ChangeOrder, 'id' | 'createdAt'>) => Promise<ChangeOrder | null>;
  deleteChangeOrder: (id: string) => Promise<void>;
}

export const useChangeOrdersStore = create<ChangeOrdersState>()(
  persist(
    (set, get) => ({
      changeOrders: [],
      loading: false,
      error: null,

      setChangeOrders: (changeOrders) => set({ changeOrders }),
      addChangeOrder: (changeOrder) =>
        set((state) => ({ changeOrders: [changeOrder, ...state.changeOrders] })),
      updateChangeOrder: (id, updates) =>
        set((state) => ({
          changeOrders: state.changeOrders.map((co) =>
            co.id === id ? { ...co, ...updates } : co
          ),
        })),
      removeChangeOrder: (id) =>
        set((state) => ({
          changeOrders: state.changeOrders.filter((co) => co.id !== id),
        })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getChangeOrdersByProject: (projectId) =>
        get().changeOrders.filter((co) => co.projectId === projectId),
      getChangeOrdersByStatus: (status) =>
        get().changeOrders.filter((co) => co.status === status),
      getChangeOrdersByType: (type) =>
        get().changeOrders.filter((co) => co.type === type),

      fetchChangeOrders: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('change_orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const changeOrders = (data || []).map((item) => ({
            id: item.id,
            projectId: item.project_id,
            projectName: item.project_name,
            coNumber: item.co_number,
            title: item.title,
            description: item.description,
            reason: item.reason,
            type: item.type,
            status: item.status,
            requestedBy: item.requested_by,
            requestedById: item.requested_by_id,
            requestedDate: item.requested_date,
            originalCost: item.original_cost,
            proposedCost: item.proposed_cost,
            originalScheduleDays: item.original_schedule_days,
            proposedScheduleDays: item.proposed_schedule_days,
            impactCost: item.impact_cost,
            impactDays: item.impact_days,
            reviewedBy: item.reviewed_by,
            approvedBy: item.approved_by,
            reviewedDate: item.reviewed_date,
            approvedDate: item.approved_date,
            notes: item.notes,
            createdAt: item.created_at,
          }));

          set({ changeOrders, loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch change orders',
            loading: false,
          });
        }
      },

      createChangeOrder: async (changeOrder) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('change_orders')
            .insert({
              project_id: changeOrder.projectId,
              project_name: changeOrder.projectName,
              co_number: changeOrder.coNumber,
              title: changeOrder.title,
              description: changeOrder.description,
              reason: changeOrder.reason,
              type: changeOrder.type,
              status: changeOrder.status,
              requested_by: changeOrder.requestedBy,
              requested_by_id: changeOrder.requestedById,
              requested_date: changeOrder.requestedDate,
              original_cost: changeOrder.originalCost,
              proposed_cost: changeOrder.proposedCost,
              original_schedule_days: changeOrder.originalScheduleDays,
              proposed_schedule_days: changeOrder.proposedScheduleDays,
              impact_cost: changeOrder.impactCost,
              impact_days: changeOrder.impactDays,
              reviewed_by: changeOrder.reviewedBy,
              approved_by: changeOrder.approvedBy,
              reviewed_date: changeOrder.reviewedDate,
              approved_date: changeOrder.approvedDate,
              notes: changeOrder.notes,
            })
            .select()
            .single();

          if (error) throw error;

          const newChangeOrder: ChangeOrder = {
            id: data.id,
            projectId: data.project_id,
            projectName: data.project_name,
            coNumber: data.co_number,
            title: data.title,
            description: data.description,
            reason: data.reason,
            type: data.type,
            status: data.status,
            requestedBy: data.requested_by,
            requestedById: data.requested_by_id,
            requestedDate: data.requested_date,
            originalCost: data.original_cost,
            proposedCost: data.proposed_cost,
            originalScheduleDays: data.original_schedule_days,
            proposedScheduleDays: data.proposed_schedule_days,
            impactCost: data.impact_cost,
            impactDays: data.impact_days,
            reviewedBy: data.reviewed_by,
            approvedBy: data.approved_by,
            reviewedDate: data.reviewed_date,
            approvedDate: data.approved_date,
            notes: data.notes,
            createdAt: data.created_at,
          };

          set((state) => ({
            changeOrders: [newChangeOrder, ...state.changeOrders],
            loading: false,
          }));
          return newChangeOrder;
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to create change order',
            loading: false,
          });
          return null;
        }
      },

      deleteChangeOrder: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('change_orders').delete().eq('id', id);
          if (error) throw error;
          set((state) => ({
            changeOrders: state.changeOrders.filter((co) => co.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to delete change order',
            loading: false,
          });
        }
      },
    }),
    {
      name: 'buildtrack-change-orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ changeOrders: state.changeOrders }),
    }
  )
);
