import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SubscriptionTier, TierLimits } from '../../stores/billingStore';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  limits: TierLimits;
  isCurrent?: boolean;
  onSelect?: (tier: SubscriptionTier) => void;
}

const TIER_META: Record<SubscriptionTier, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  free: { label: 'Free', color: '#6b7280', icon: 'cube' },
  pro: { label: 'Pro', color: '#2563eb', icon: 'rocket' },
  enterprise: { label: 'Enterprise', color: '#7c3aed', icon: 'business' },
};

export function SubscriptionCard({ tier, limits, isCurrent, onSelect }: SubscriptionCardProps) {
  const meta = TIER_META[tier];

  return (
    <Pressable
      onPress={() => onSelect?.(tier)}
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border-2 ${
        isCurrent ? 'border-blue-500' : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: meta.color + '20' }}
          >
            <Ionicons name={meta.icon} size={20} color={meta.color} />
          </View>
          <View className="ml-3">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">{meta.label}</Text>
            <Text className="text-sm text-gray-500">£{limits.price_monthly_gbp}/mo</Text>
          </View>
        </View>
        {isCurrent && (
          <View className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
            <Text className="text-xs font-medium text-blue-700 dark:text-blue-300">Current</Text>
          </View>
        )}
      </View>

      <View className="space-y-2">
        <FeatureRow icon="construct" label="Projects" value={limits.max_projects >= 999999 ? 'Unlimited' : limits.max_projects} />
        <FeatureRow icon="people" label="Team Members" value={limits.max_team_members >= 999999 ? 'Unlimited' : limits.max_team_members} />
        <FeatureRow icon="cloud-upload" label="Storage" value={`${limits.max_storage_gb} GB`} />
        <FeatureRow icon="bar-chart" label="Advanced Reports" value={limits.has_advanced_reports ? 'Yes' : 'No'} active={limits.has_advanced_reports} />
        <FeatureRow icon="headset" label="Priority Support" value={limits.has_priority_support ? 'Yes' : 'No'} active={limits.has_priority_support} />
        <FeatureRow icon="document-lock" label="Audit Logs" value={limits.has_audit_logs ? 'Yes' : 'No'} active={limits.has_audit_logs} />
      </View>
    </Pressable>
  );
}

function FeatureRow({
  icon,
  label,
  value,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  active?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={14} color="#6b7280" />
        <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">{label}</Text>
      </View>
      <Text className={`text-sm font-medium ${active ? 'text-green-600' : 'text-gray-900 dark:text-gray-200'}`}>
        {value}
      </Text>
    </View>
  );
}
