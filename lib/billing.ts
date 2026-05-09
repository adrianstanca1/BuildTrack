// ============================================================================
// BuildTrack: Local Billing (Stripe-free)
// ============================================================================
// Admin-managed subscription tiers. No payment processing.
// Users can be upgraded/downgraded via admin panel.

import { useSubscription as useSubHook } from '../hooks/useSubscription';
import type { SubscriptionTier, TierLimits } from '../types';

export const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'enterprise'];

export function tierRank(tier: SubscriptionTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function isTierAtLeast(current: SubscriptionTier, required: SubscriptionTier): boolean {
  return tierRank(current) >= tierRank(required);
}

export function canAccessFeature(limits: TierLimits | null, feature: keyof TierLimits): boolean {
  if (!limits) return false;
  const value = limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}

export function isWithinLimit(
  limits: TierLimits | null,
  usage: number,
  resource: 'max_projects' | 'max_team_members' | 'max_storage_gb'
): boolean {
  if (!limits) return false;
  const max = limits[resource];
  return usage < max;
}

export const LIMIT_MESSAGES: Record<string, string> = {
  max_projects: "You've reached your project limit. Contact admin to upgrade.",
  max_team_members: "You've reached your team member limit. Contact admin to upgrade.",
  max_storage_gb: "Storage limit reached. Contact admin to upgrade.",
};

// Local tier upgrade — admin calls this directly
export async function setUserTier(userId: string, tier: SubscriptionTier, adminId: string) {
  const { supabase } = await import('../lib/supabase');

  // Verify admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminId)
    .single();

  if (!adminProfile || (adminProfile.role !== 'admin' && adminProfile.role !== 'super_admin')) {
    throw new Error('Unauthorized: admin role required');
  }

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier, subscription_status: 'active' })
    .eq('id', userId);

  if (profileError) throw profileError;

  // Upsert subscription record
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ tier, status: 'active', updated_at: new Date().toISOString() })
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
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    if (error) throw error;
  }

  return { success: true };
}
