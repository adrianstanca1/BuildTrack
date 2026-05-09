// ============================================================================
// BuildTrack Admin Store — Simplified (no subscriptions, no tiers)
// ============================================================================
// All users are free with full access. Only role-based admin features remain.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface AdminState {
  isAdmin: boolean;
  adminStats: {
    total_users: number;
    total_projects: number;
    active_projects: number;
    total_tasks: number;
    completed_tasks: number;
    total_incidents: number;
    total_workers: number;
  } | null;
  allUsers: UserProfile[];
  loading: boolean;
  error: string | null;

  setIsAdmin: (isAdmin: boolean) => void;
  setAdminStats: (stats: AdminState['adminStats']) => void;
  setAllUsers: (users: UserProfile[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchAdminStats: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
  refreshAdmin: () => Promise<void>;
  setUserRole: (userId: string, role: UserRole) => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminStats: null,
      allUsers: [],
      loading: false,
      error: null,

      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setAdminStats: (adminStats) => set({ adminStats }),
      setAllUsers: (allUsers) => set({ allUsers }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchAdminStats: async () => {
        if (!get().isAdmin) return;
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.rpc('get_admin_stats');
          if (error) throw error;
          // revenue_mrr removed from schema — strip it
          const stats = data as Record<string, number> | null;
          if (stats) {
            delete stats.revenue_mrr;
          }
          set({ adminStats: stats as unknown as AdminState['adminStats'], loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch admin stats',
            loading: false,
          });
        }
      },

      fetchAllUsers: async () => {
        if (!get().isAdmin) return;
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, created_at, updated_at')
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ allUsers: (data || []) as unknown as UserProfile[], loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch users',
            loading: false,
          });
        }
      },

      checkAdminRole: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isAdmin: false });
            return false;
          }

          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error || !data) {
            set({ isAdmin: false });
            return false;
          }

          const isAdmin = (data.role as string) === 'admin' || (data.role as string) === 'super_admin';
          set({ isAdmin });
          return isAdmin;
        } catch {
          set({ isAdmin: false });
          return false;
        }
      },

      refreshAdmin: async () => {
        const isAdmin = await get().checkAdminRole();
        if (isAdmin) {
          await get().fetchAdminStats();
          await get().fetchAllUsers();
        }
      },

      setUserRole: async (userId: string, role: UserRole) => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (!adminProfile || (adminProfile.role !== 'admin' && adminProfile.role !== 'super_admin')) {
            throw new Error('Admin privileges required');
          }

          const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

          if (error) throw error;
          await get().fetchAllUsers();
          set({ loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to set role',
            loading: false,
          });
          throw err;
        }
      },
    }),
    {
      name: 'buildtrack-admin',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAdmin: state.isAdmin,
      }),
    }
  )
);

// Backward compatibility alias — removed subscription system
export const useBillingStore = useAdminStore;
