import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { useAdmin } from '../../hooks/useAdmin';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { DataTable } from '../../components/admin/DataTable';
import { TierBadge } from '../../components/admin/TierBadge';
import type { UserProfile } from '../../stores/billingStore';

export default function AdminUsersScreen() {
  const { width } = useWindowDimensions();
  const { allUsers, loading, isAdmin } = useAdmin();
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
            <UsersContent users={allUsers} loading={loading} />
          </View>
        </View>
      )}
      {!isWide && <UsersContent users={allUsers} loading={loading} />}
    </View>
  );
}

function UsersContent({ users, loading }: { users: UserProfile[]; loading: boolean }) {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        User Management
      </Text>

      {loading && <Text className="text-gray-500">Loading users...</Text>}

      <DataTable
        columns={[
          { key: 'email', header: 'Email', width: 180 },
          {
            key: 'role',
            header: 'Role',
            width: 100,
            render: (item: UserProfile) => (
              <Text className={`text-sm font-medium ${
                item.role === 'super_admin'
                  ? 'text-purple-600'
                  : item.role === 'admin'
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}>
                {item.role}
              </Text>
            ),
          },
          {
            key: 'subscription_tier',
            header: 'Tier',
            width: 100,
            render: (item: UserProfile) => <TierBadge tier={item.subscription_tier} />,
          },
          {
            key: 'subscription_status',
            header: 'Status',
            width: 100,
            render: (item: UserProfile) => (
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
          { key: 'created_at', header: 'Joined', width: 120 },
        ]}
        data={users}
        keyExtractor={(item) => item.id}
        emptyText="No users found"
      />
    </ScrollView>
  );
}
