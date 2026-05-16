import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Company multi-tenancy
  companyId: string | null;
  companyRole: string | null;

  // Actions
  setUser: (user: any | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  setCompany: (companyId: string | null, companyRole: string | null) => void;
  loadCompany: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      companyId: null,
      companyRole: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (!user) {
          set({ companyId: null, companyRole: null });
        }
      },

      setSession: (session) => {
        set({ session });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setCompany: (companyId, companyRole) => set({ companyId, companyRole }),

      loadCompany: async () => {
        const user = get().user;
        if (!user) {
          set({ companyId: null, companyRole: null });
          return;
        }

        try {
          // Get the user's primary company membership
          const { data, error } = await supabase
            .from('company_users')
            .select('company_id, role')
            .eq('user_id', user.id)
            .order('joined_at', { ascending: true })
            .limit(1)
            .single();

          if (error || !data) {
            // Check if user is a company owner
            const { data: owned, error: ownedError } = await supabase
              .from('companies')
              .select('id')
              .eq('owner_id', user.id)
              .limit(1)
              .single();

            if (!ownedError && owned) {
              set({ companyId: owned.id, companyRole: 'owner' });
            } else {
              set({ companyId: null, companyRole: null });
            }
            return;
          }

          set({ companyId: data.company_id, companyRole: data.role });
        } catch {
          set({ companyId: null, companyRole: null });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false, companyId: null, companyRole: null });
      },
    }),
    {
      name: 'buildtrack-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        companyId: state.companyId,
        companyRole: state.companyRole,
      }),
    }
  )
);
