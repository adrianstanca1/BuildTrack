import { useState, useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions, Pressable, Alert } from 'react-native';
import { useAdmin } from '../../hooks/useAdmin';
import { useBillingStore } from '../../stores/billingStore';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { SubscriptionCard } from '../../components/admin/SubscriptionCard';
import { DataTable } from '../../components/admin/DataTable';
import { TierBadge } from '../../components/admin/TierBadge';
import { supabase } from '../../lib/supabase';
import type { Subscription, TierLimits } from '../../stores/billingStore';

export default function AdminBillingScreen() {
  const { width } = useWindowDimensions();
  const { allSubscriptions, allUsers, loading, isAdmin } = useAdmin();
  const upgradeUserTier = useBillingStore((s) => s.upgradeUserTier);
  const isWide = width >= 768;

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

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-600 dark:text-gray-400">Access Denied</Text>
      </View>
    );
  }

  const handleUpgrade = (userId: string, newTier: string) => {
    Alert.alert(
      'Upgrade User',
      `Set this user to ${newTier.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          style: 'default',
          onPress: async () => {
            try {
              await upgradeUserTier(userId, newTier as any);
              Alert.alert('Success', `User upgraded to ${newTier.toUpperCase()}`);
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Failed to upgrade');
            }
          },
        },
      ]
    );
  };

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
              users={allUsers}
              tiers={tiers}
              loading={loading}
              onUpgrade={handleUpgrade}
            />
          </View>
        </View>
      )}
      {!isWide && (
        <BillingContent
          subscriptions={allSubscriptions}
          users={allUsers}
          tiers={tiers}
          loading={loading}
          onUpgrade={handleUpgrade}
        />
      )}
    </View>
  );
}

function BillingContent({
  subscriptions,
  users,
  tiers,
  loading,
  onUpgrade,
}: {
  subscriptions: Subscription[];
  users: any[];
  tiers: TierLimits[];
  loading: boolean;
  onUpgrade: (userId: string, tier: string) => void;
}) {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Billing & Plans
      </Text>

      {/* Subscription Tiers Overview */}
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Available Plans
      </Text>
      <View className="mb-6">
        {tiers.map((t) => (
          <View key={t.tier} className="mb-3">
            <SubscriptionCard tier={t.tier} limits={t} isCurrent={false} />
          </View>
        ))}
      </View>

      {/* User Subscriptions Table */}
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        User Plans
      </Text>

      {loading && <Text className="text-gray-500">Loading...</Text>}

      <DataTable
        columns={[
          {
            key: 'email',
            header: 'User',
            width: 160,
            render: (item: any) => (
              <Text className="text-sm text-gray-900 dark:text-white" numberOfLines={1}>
                {item.email || '—'}
              </Text>
            ),
          },
          {
            key: 'tier',
            header: 'Tier',
            width: 80,
            render: (item: any) => <TierBadge tier={item.subscription_tier} />,
          },
          {
            key: 'status',
            header: 'Status',
            width: 80,
            render: (item: any) => (
              <Text
                className={`text-sm font-medium ${
                  item.subscription_status === 'active'
                    ? 'text-green-600'
                    : item.subscription_status === 'past_due'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {item.subscription_status}
              </Text>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            width: 120,
            render: (item: any) => (
              <View className="flex-row">
                {['free', 'pro', 'enterprise'].map((tier) => (
                  <Pressable
                    key={tier}
                    onPress={() => onUpgrade(item.id, tier)}
                    className={`px-2 py-1 rounded mr-1 ${
                      item.subscription_tier === tier
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.subscription_tier === tier
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {tier[0].toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ),
          },
        ]}
        data={users}
        keyExtractor={(item) => item.id}
        emptyText="No users found"
      />
    </ScrollView>
  );
}
