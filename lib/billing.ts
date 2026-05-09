import { useSubscription } from '../hooks/useSubscription';
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

// Hard limits for client-side validation before hitting the DB
export const LIMIT_MESSAGES: Record<string, string> = {
  max_projects: "You've reached your project limit. Upgrade to add more.",
  max_team_members: "You've reached your team member limit. Upgrade to add more.",
  max_storage_gb: "Storage limit reached. Upgrade for more space.",
};

// Stripe Price IDs — update these after creating products in Stripe Dashboard
export const STRIPE_PRICE_IDS: Record<SubscriptionTier, string | null> = {
  free: null,
  pro: process.env.EXPO_PUBLIC_STRIPE_PRICE_PRO || 'price_pro_monthly_placeholder',
  enterprise: process.env.EXPO_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly_placeholder',
};

// Checkout session creation helper (calls edge function)
export async function createCheckoutSession(tier: SubscriptionTier, returnUrl: string): Promise<string | null> {
  try {
    const priceId = STRIPE_PRICE_IDS[tier];
    if (!priceId) throw new Error('Invalid tier or price not configured');

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, returnUrl }),
    });

    if (!response.ok) throw new Error('Failed to create checkout session');
    const { url } = await response.json();
    return url;
  } catch {
    return null;
  }
}
