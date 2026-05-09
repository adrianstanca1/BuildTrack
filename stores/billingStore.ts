// ============================================================================
// BuildTrack Billing Store — Local/Stripe-free version
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'cancelled' | 'trialing';
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface TierLimits {
  tier: SubscriptionTier;
  max_projects: number;
  max_team_members: number;
  max_storage_gb: number;
  has_advanced_reports: boolean;
  has_audit_logs: boolean;
  has_priority_support: boolean;
  price_monthly_gbp: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingEvent {
  id: string;
  user_id: string | null;
  stripe_event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  processed_at: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  role: UserRole;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

interface BillingState {
  subscription: Subscription | null;
  limits: TierLimits | null;
  usage: {
    projects: number;
    teamMembers: number;
    storageBytes: number;
  };
  isAdmin: boolean;
  adminStats: {
    total_users: number;
    active_users: number;
    total_projects: number;
    active_projects: number;
    total_tasks: number;
    completed_tasks: number;
    total_incidents: number;
    total_workers: number;
    revenue_mrr: number;
  } | null;
  allUsers: UserProfile[];
  allSubscriptions: Subscription[];
  loading: boolean;
  error: string | null;

  setSubscription: (sub: Subscription | null) => void;
  setLimits: (limits: TierLimits | null) => void;
  setUsage: (usage: Partial<BillingState['usage']>) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setAdminStats: (stats: BillingState['adminStats']) => void;
  setAllUsers: (users: UserProfile[]) => void;
  setAllSubscriptions: (subs: Subscription[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchSubscription: () => Promise<void>;
  fetchAdminStats: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchUsage: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
  refreshBilling: () => Promise<void>;
  upgradeUserTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      subscription: null,
      limits: null,
      usage: { projects: 0, teamMembers: 0, storageBytes: 0 },
      isAdmin: false,
      adminStats: null,
      allUsers: [],
      allSubscriptions: [],
      loading: false,
      error: null,

      setSubscription: (subscription) => set({ subscription }),
      setLimits: (limits) => set({ limits }),
      setUsage: (usage) => set((state) => ({ usage: { ...state.usage, ...usage } })),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setAdminStats: (adminStats) => set({ adminStats }),
      setAllUsers: (allUsers) => set({ allUsers }),
      setAllSubscriptions: (allSubscriptions) => set({ allSubscriptions }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchSubscription: async () => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { data, error } = await supabase.rpc('get_user_subscription', {
            user_uuid: user.id,
          });

          if (error) throw error;

          const payload = data as {
            subscription?: Record<string, unknown>;
            limits?: Record<string, unknown>;
          } | null;

          if (payload?.subscription && payload.subscription.id) {
            set({
              subscription: payload.subscription as unknown as Subscription,
              limits: payload.limits as unknown as TierLimits,
              loading: false,
            });
          } else {
            const { data: tierData, error: tierError } = await supabase
              .from('tier_limits')
              .select('*')
              .eq('tier', 'free')
              .single();

            if (tierError) throw tierError;

            set({
              subscription: null,
              limits: tierData as unknown as TierLimits,
              loading: false,
            });
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch subscription',
            loading: false,
          });
        }
      },

      fetchAdminStats: async () => {
        if (!get().isAdmin) return;
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.rpc('get_admin_stats');
          if (error) throw error;
          set({ adminStats: data as unknown as BillingState['adminStats'], loading: false });
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
            .select('id, email, role, stripe_customer_id, subscription_tier, subscription_status, created_at, updated_at')
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

      fetchUsage: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const [projectsRes, workersRes] = await Promise.all([
            supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('workers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          ]);

          set({
            usage: {
              projects: projectsRes.count || 0,
              teamMembers: workersRes.count || 0,
              storageBytes: get().usage.storageBytes,
            },
          });
        } catch {
          // Silent fail
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

      refreshBilling: async () => {
        await get().fetchSubscription();
        await get().fetchUsage();
        const isAdmin = await get().checkAdminRole();
        if (isAdmin) {
          await get().fetchAdminStats();
          await get().fetchAllUsers();
        }
      },

      // Local admin-managed tier upgrade (no Stripe)
      upgradeUserTier: async (userId: string, tier: SubscriptionTier) => {
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

          // Update profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ subscription_tier: tier, subscription_status: 'active' })
            .eq('id', userId);

          if (profileError) throw profileError;

          // Upsert subscription
          const { data: existing } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

          if (existing) {
            const { error } = await supabase
              .from('subscriptions')
              .update({ tier, status: 'active', updated_at: new Date().toISOString(), current_period_end: oneYear })
              .eq('id', existing.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('subscriptions')
              .insert({
                user_id: userId,
                tier,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: oneYear,
              });
            if (error) throw error;
          }

          // Refresh admin data
          await get().fetchAllUsers();
          set({ loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to upgrade user',
            loading: false,
          });
          throw err;
        }
      },
    }),
    {
      name: 'buildtrack-billing',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        subscription: state.subscription,
        limits: state.limits,
        usage: state.usage,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
