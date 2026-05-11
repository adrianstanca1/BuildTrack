import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Permit, PermitStatus, PermitType } from '../types/field';

interface PermitsState {
  permits: Permit[];
  loading: boolean;
  error: string | null;

  setPermits: (permits: Permit[]) => void;
  addPermit: (permit: Permit) => void;
  updatePermit: (id: string, updates: Partial<Permit>) => Promise<void>;
  removePermit: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getPermitsByProject: (projectId: string) => Permit[];
  getPermitsByStatus: (status: PermitStatus) => Permit[];
  getPermitsByType: (type: PermitType) => Permit[];
  getExpiringSoon: (days?: number) => Permit[];

  fetchPermits: () => Promise<void>;
  createPermit: (permit: Omit<Permit, 'id' | 'createdAt'>) => Promise<Permit | null>;
  deletePermit: (id: string) => Promise<void>;
}

export const usePermitsStore = create<PermitsState>()(
  persist(
    (set, get) => ({
      permits: [],
      loading: false,
      error: null,

      setPermits: (permits) => set({ permits }),
      addPermit: (permit) => set((state) => ({ permits: [permit, ...state.permits] })),
      updatePermit: async (id, updates) => {
        set((state) => ({
          permits: state.permits.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
        const { error } = await supabase.from('permits').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('permits', 'update', { id, ...updates });
        }
      },
      removePermit: (id) => set((state) => ({
        permits: state.permits.filter((p) => p.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getPermitsByProject: (projectId) => get().permits.filter((p) => p.projectId === projectId),
      getPermitsByStatus: (status) => get().permits.filter((p) => p.status === status),
      getPermitsByType: (type) => get().permits.filter((p) => p.type === type),
      getExpiringSoon: (days = 7) => {
        const now = Date.now();
        const cutoff = now + days * 24 * 60 * 60 * 1000;
        return get().permits.filter((p) => {
          if (!p.expiryDate) return false;
          const expiry = new Date(p.expiryDate).getTime();
          return expiry > now && expiry <= cutoff;
        });
      },

      fetchPermits: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('permits')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const permits = (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            projectId: item.project_id,
            projectName: item.project_name,
            status: item.status,
            description: item.description,
            issuedDate: item.issued_date,
            expiryDate: item.expiry_date,
            issuer: item.issuer,
            referenceNumber: item.reference_number,
            createdAt: item.created_at,
          }));

          set({ permits, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch permits', loading: false });
        }
      },

      createPermit: async (permitData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('permits')
            .insert({
              title: permitData.title,
              type: permitData.type,
              project_id: permitData.projectId,
              project_name: permitData.projectName,
              status: permitData.status,
              description: permitData.description,
              issued_date: permitData.issuedDate,
              expiry_date: permitData.expiryDate,
              issuer: permitData.issuer,
              reference_number: permitData.referenceNumber,
            })
            .select()
            .single();

          if (error) throw error;

          const permit: Permit = {
            id: data.id,
            title: data.title,
            type: data.type,
            projectId: data.project_id,
            projectName: data.project_name,
            status: data.status,
            description: data.description,
            issuedDate: data.issued_date,
            expiryDate: data.expiry_date,
            issuer: data.issuer,
            referenceNumber: data.reference_number,
            createdAt: data.created_at,
          };

          set((state) => ({ permits: [permit, ...state.permits], loading: false }));
          return permit;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create permit', loading: false });
          return null;
        }
      },

      deletePermit: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('permits').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('permits', 'delete', { id });
            return;
          }
          set((state) => ({ permits: state.permits.filter((p) => p.id !== id), loading: false }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete permit', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-permits',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ permits: state.permits }),
    }
  )
);
