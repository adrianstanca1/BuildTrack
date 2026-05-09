import { useState, useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions, Pressable, Linking } from 'react-native';
import { useAdmin } from '../../hooks/useAdmin';
import { useSubscription } from '../../hooks/useSubscription';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { SubscriptionCard } from '../../components/admin/SubscriptionCard';
import { DataTable } from '../../components/admin/DataTable';
import { TierBadge } from '../../components/admin/TierBadge';
import { supabase } from '../../lib/supabase';
import type { Subscription, TierLimits } from '../../stores/billingStore';

export default function AdminBillingScreen() {
  const { width } = useWindowDimensions();
  const { allSubscriptions, loading, isAdmin } = useAdmin();
  const { limits, tier } = useSubscription();
  const isWide = width >= 768;

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-600 dark:text-gray-400">Access Denied</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {isWide && (
        <View className="flex-row flex-1">
          <View style={{ width: 220 }}>
            <AdminSidebar />
          </View>
          <View className="flex-1">
            <BillingContent
              subscriptions={allSubscriptions}
              loading={loading}
              currentTier={tier}
              currentLimits={limits}
            />
          </View>
        </View>
      )}
      {!isWide && (
        <BillingContent
          subscriptions={allSubscriptions}
          loading={loading}
          currentTier={tier}
          currentLimits={limits}
        />
      )}
    </View>
  );
}

function BillingContent({
  subscriptions,
  loading,
  currentTier,
  currentLimits,
}: {
  subscriptions: Subscription[];
  loading: boolean;
  currentTier: string;
  currentLimits: TierLimits | null;
}) {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Billing & Subscriptions
      </Text>

      {/* Subscription Tiers */}
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Plans
      </Text>
      <View className="mb-6">
        <SubscriptionTiers currentTier={currentTier} currentLimits={currentLimits} />
      </View>

      {/* All Subscriptions Table */}
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Active Subscriptions
      </Text>

      {loading && <Text className="text-gray-500">Loading subscriptions...</Text>}

      <DataTable
        columns={[
          {
            key: 'tier',
            header: 'Tier',
            width: 100,
            render: (item: Subscription) => <TierBadge tier={item.tier} />,
          },
          {
            key: 'status',
            header: 'Status',
            width: 100,
            render: (item: Subscription) => (
              <Text
                className={`text-sm font-medium ${
                  item.status === 'active'
                    ? 'text-green-600'
                    : item.status === 'past_due'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {item.status}
              </Text>
            ),
          },
          {
            key: 'current_period_end',
            header: 'Renews',
            width: 120,
            render: (item: Subscription) => (
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {item.current_period_end
                  ? new Date(item.current_period_end).toLocaleDateString()
                  : 'N/A'}
              </Text>
            ),
          },
          {
            key: 'cancel_at_period_end',
            header: 'Cancelling?',
            width: 100,
            render: (item: Subscription) => (
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {item.cancel_at_period_end ? 'Yes' : 'No'}
              </Text>
            ),
          },
        ]}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        emptyText="No subscriptions found"
      />
    </ScrollView>
  );
}

function SubscriptionTiers({
  currentTier,
  currentLimits,
}: {
  currentTier: string;
  currentLimits: TierLimits | null;
}) {
  const [tiers, setTiers] = useState<TierLimits[]>([]);

  useEffect(() => {
    supabase
      .from('tier_limits')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          setTiers(data as unknown as TierLimits[]);
        }
      });
  }, []);

  return (
    <View className="space-y-3">
      {tiers.map((t) => (
        <SubscriptionCard
          key={t.tier}
          tier={t.tier}
          limits={t}
          isCurrent={currentTier === t.tier}
          onSelect={(tier) => {
            // Open Stripe Checkout or billing portal
            // TODO: implement create-checkout-session edge function
            console.log('Selected tier:', tier);
          }}
        />
      ))}
    </View>
  );
}

