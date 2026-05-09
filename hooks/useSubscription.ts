import { useCallback, useEffect, useState } from 'react';
import { useBillingStore, type SubscriptionTier, type TierLimits } from '../stores/billingStore';

export function useSubscription() {
  const subscription = useBillingStore((s) => s.subscription);
  const limits = useBillingStore((s) => s.limits);
  const usage = useBillingStore((s) => s.usage);
  const loading = useBillingStore((s) => s.loading);
  const error = useBillingStore((s) => s.error);
  const fetchSubscription = useBillingStore((s) => s.fetchSubscription);
  const fetchUsage = useBillingStore((s) => s.fetchUsage);

  useEffect(() => {
    fetchSubscription();
    fetchUsage();
  }, [fetchSubscription, fetchUsage]);

  const tier: SubscriptionTier = subscription?.tier ?? 'free';
  const status = subscription?.status ?? 'inactive';
  const isActive = status === 'active' || status === 'trialing';

  const canAccess = useCallback(
    (feature: keyof TierLimits) => {
      if (!limits) return false;
      const value = limits[feature];
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value > 0;
      return false;
    },
    [limits]
  );

  const isWithinLimit = useCallback(
    (resource: 'projects' | 'teamMembers', count?: number) => {
      if (!limits) return false;
      const current = count ?? usage[resource === 'projects' ? 'projects' : 'teamMembers'];
      const max = resource === 'projects' ? limits.max_projects : limits.max_team_members;
      return current < max;
    },
    [limits, usage]
  );

  return {
    subscription,
    limits,
    tier,
    status,
    isActive,
    usage,
    loading,
    error,
    canAccess,
    isWithinLimit,
    refresh: async () => {
      await fetchSubscription();
      await fetchUsage();
    },
  };
}
