import { View, Text } from 'react-native';
import type { SubscriptionTier } from '../../stores/billingStore';

const TIER_STYLES: Record<SubscriptionTier, { bg: string; text: string; label: string }> = {
  free: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Free' },
  pro: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Pro' },
  enterprise: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Enterprise' },
};

export function TierBadge({ tier, size = 'sm' }: { tier: SubscriptionTier; size?: 'sm' | 'md' }) {
  const style = TIER_STYLES[tier];
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <View className={`${style.bg} ${padding} rounded-full`}>
      <Text className={`${textSize} font-medium ${style.text}`}>{style.label}</Text>
    </View>
  );
}
