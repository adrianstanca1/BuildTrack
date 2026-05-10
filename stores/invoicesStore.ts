import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Invoice, InvoiceStatus } from '../types/field';

interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;

  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  removeInvoice: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getInvoicesByProject: (projectId: string) => Invoice[];
  getInvoicesByStatus: (status: InvoiceStatus) => Invoice[];
  getTotalAmount: () => number;

  fetchInvoices: () => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<void>;
}

export const useInvoicesStore = create<InvoicesState>()(
  persist(
    (set, get) => ({
      invoices: [],
      loading: false,
      error: null,

      setInvoices: (invoices) => set({ invoices }),
      addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
      updateInvoice: (id, updates) => set((state) => ({
        invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      })),
      removeInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getInvoicesByProject: (projectId) => get().invoices.filter((i) => i.projectId === projectId),
      getInvoicesByStatus: (status) => get().invoices.filter((i) => i.status === status),
      getTotalAmount: () => get().invoices.reduce((sum, i) => sum + (i.amount || 0), 0),

      fetchInvoices: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('issue_date', { ascending: false });

          if (error) throw error;

          const invoices = (data || []).map((item) => ({
            id: item.id,
            invoiceNumber: item.invoice_number,
            projectId: item.project_id,
            projectName: item.project_name,
            status: item.status,
            amount: item.amount,
            description: item.description,
            vendor: item.vendor,
            issueDate: item.issue_date,
            dueDate: item.due_date,
            paidDate: item.paid_date,
            createdAt: item.created_at,
          }));

          set({ invoices, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch invoices', loading: false });
        }
      },

      createInvoice: async (invoice) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('invoices')
            .insert({
              invoice_number: invoice.invoiceNumber,
              project_id: invoice.projectId,
              project_name: invoice.projectName,
              status: invoice.status,
              amount: invoice.amount,
              description: invoice.description,
              vendor: invoice.vendor,
              issue_date: invoice.issueDate,
              due_date: invoice.dueDate,
              paid_date: invoice.paidDate,
            })
            .select()
            .single();

          if (error) throw error;

          const newInvoice: Invoice = {
            id: data.id,
            invoiceNumber: data.invoice_number,
            projectId: data.project_id,
            projectName: data.project_name,
            status: data.status,
            amount: data.amount,
            description: data.description,
            vendor: data.vendor,
            issueDate: data.issue_date,
            dueDate: data.due_date,
            paidDate: data.paid_date,
            createdAt: data.created_at,
          };

          set((state) => ({ invoices: [newInvoice, ...state.invoices], loading: false }));
          return newInvoice;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create invoice', loading: false });
          return null;
        }
      },

      deleteInvoice: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('invoices').delete().eq('id', id);
          if (error) throw error;
          set((state) => ({
            invoices: state.invoices.filter((i) => i.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete invoice', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-invoices-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ invoices: state.invoices }),
    }
  )
);
