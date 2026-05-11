import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types/field';

interface PurchaseOrdersState {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;

  setPurchaseOrders: (orders: PurchaseOrder[]) => void;
  addPurchaseOrder: (order: PurchaseOrder) => void;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
  removePurchaseOrder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getPurchaseOrdersByProject: (projectId: string) => PurchaseOrder[];
  getPurchaseOrdersByStatus: (status: PurchaseOrderStatus) => PurchaseOrder[];

  fetchPurchaseOrders: () => Promise<void>;
  createPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt'>) => Promise<PurchaseOrder | null>;
  deletePurchaseOrder: (id: string) => Promise<void>;
}

function calculateTotals(items: PurchaseOrder['items'], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export const usePurchaseOrdersStore = create<PurchaseOrdersState>()(
  persist(
    (set, get) => ({
      purchaseOrders: [],
      loading: false,
      error: null,

      setPurchaseOrders: (orders) => set({ purchaseOrders: orders }),
      addPurchaseOrder: (order) => set((state) => ({ purchaseOrders: [order, ...state.purchaseOrders] })),
      updatePurchaseOrder: async (id, updates) => {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
        const { error } = await supabase.from('purchase_orders').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('purchase_orders', 'update', { id, ...updates });
        }
      },
      removePurchaseOrder: (id) => set((state) => ({
        purchaseOrders: state.purchaseOrders.filter((o) => o.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getPurchaseOrdersByProject: (projectId) => get().purchaseOrders.filter((o) => o.projectId === projectId),
      getPurchaseOrdersByStatus: (status) => get().purchaseOrders.filter((o) => o.status === status),

      fetchPurchaseOrders: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('purchase_orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const orders = (data || []).map((item) => ({
            id: item.id,
            projectId: item.project_id,
            projectName: item.project_name,
            poNumber: item.po_number,
            title: item.title,
            description: item.description,
            vendorName: item.vendor_name,
            vendorEmail: item.vendor_email,
            vendorPhone: item.vendor_phone,
            status: item.status,
            items: item.items || [],
            subtotal: item.subtotal,
            taxRate: item.tax_rate,
            taxAmount: item.tax_amount,
            total: item.total,
            deliveryDate: item.delivery_date,
            expectedDelivery: item.expected_delivery,
            deliveryAddress: item.delivery_address,
            notes: item.notes,
            createdAt: item.created_at,
          }));

          set({ purchaseOrders: orders, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch purchase orders', loading: false });
        }
      },

      createPurchaseOrder: async (order) => {
        set({ loading: true, error: null });
        try {
          const { subtotal, taxAmount, total } = calculateTotals(order.items, order.taxRate);

          const { data, error } = await supabase
            .from('purchase_orders')
            .insert({
              project_id: order.projectId,
              project_name: order.projectName,
              po_number: order.poNumber,
              title: order.title,
              description: order.description,
              vendor_name: order.vendorName,
              vendor_email: order.vendorEmail,
              vendor_phone: order.vendorPhone,
              status: order.status,
              items: order.items,
              subtotal,
              tax_rate: order.taxRate,
              tax_amount: taxAmount,
              total,
              delivery_date: order.deliveryDate,
              expected_delivery: order.expectedDelivery,
              delivery_address: order.deliveryAddress,
              notes: order.notes,
            })
            .select()
            .single();

          if (error) throw error;

          const newOrder: PurchaseOrder = {
            id: data.id,
            projectId: data.project_id,
            projectName: data.project_name,
            poNumber: data.po_number,
            title: data.title,
            description: data.description,
            vendorName: data.vendor_name,
            vendorEmail: data.vendor_email,
            vendorPhone: data.vendor_phone,
            status: data.status,
            items: data.items || [],
            subtotal: data.subtotal,
            taxRate: data.tax_rate,
            taxAmount: data.tax_amount,
            total: data.total,
            deliveryDate: data.delivery_date,
            expectedDelivery: data.expected_delivery,
            deliveryAddress: data.delivery_address,
            notes: data.notes,
            createdAt: data.created_at,
          };

          set((state) => ({ purchaseOrders: [newOrder, ...state.purchaseOrders], loading: false }));
          return newOrder;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create purchase order', loading: false });
          return null;
        }
      },

      deletePurchaseOrder: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('purchase_orders', 'delete', { id });
            return;
          }
          set((state) => ({
            purchaseOrders: state.purchaseOrders.filter((o) => o.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete purchase order', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-purchase-orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ purchaseOrders: state.purchaseOrders }),
    }
  )
);
