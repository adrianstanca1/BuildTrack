import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '../../hooks/useAdmin';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { colors } from '../../constants/colors';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { adminStats, loading, isAdmin } = useAdmin();

  const isWide = width >= 768;

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-600 dark:text-gray-400">Access Denied</Text>
        <Text className="text-sm text-gray-500 mt-2">You need admin privileges.</Text>
      </View>
    );
  }

  const stats = adminStats || {
    total_users: 0,
    total_projects: 0,
    active_projects: 0,
    total_tasks: 0,
    completed_tasks: 0,
    total_incidents: 0,
    total_workers: 0,
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {isWide && (
        <View className="flex-row flex-1">
          <View style={{ width: 220 }}>
            <AdminSidebar />
          </View>
          <View className="flex-1">
            <AdminContent stats={stats} loading={loading} router={router} />
          </View>
        </View>
      )}
      {!isWide && <AdminContent stats={stats} loading={loading} router={router} />}
    </View>
  );
}

function AdminContent({
  stats,
  loading,
  router,
}: {
  stats: Record<string, number>;
  loading: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Admin Dashboard
      </Text>

      {loading && <Text className="text-gray-500">Loading stats...</Text>}

      <View className="flex-row flex-wrap -mx-2 mb-6">
        <View className="w-1/2 px-2 mb-3">
          <AdminStatCard icon="people" label="Total Users" value={stats.total_users} color={colors.primary} />
        </View>
        <View className="w-1/2 px-2 mb-3">
          <AdminStatCard icon="construct" label="Active Projects" value={stats.active_projects} color={colors.info} />
        </View>
        <View className="w-1/2 px-2 mb-3">
          <AdminStatCard icon="list" label="Tasks Done" value={stats.completed_tasks} color={colors.warning} />
        </View>
        <View className="w-1/2 px-2 mb-3">
          <AdminStatCard icon="warning" label="Incidents" value={stats.total_incidents} color={colors.danger} />
        </View>
        <View className="w-1/2 px-2 mb-3">
          <AdminStatCard icon="people-circle" label="Workers" value={stats.total_workers} color={colors.success} />
        </View>
        <View className="w-1/2 px-2 mb-3">
          <AdminStatCard icon="folder" label="Projects" value={stats.total_projects} color={colors.gray} />
        </View>
      </View>

      {/* Quick Nav */}
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</Text>
      <View className="flex-row flex-wrap -mx-2">
        {[
          { label: 'Users', path: '/admin/users', icon: 'people' as const, color: colors.primary },
          { label: 'Projects', path: '/admin/projects', icon: 'construct' as const, color: colors.info },
          { label: 'Teams', path: '/admin/teams', icon: 'shield-checkmark' as const, color: colors.warning },
          { label: 'Billing', path: '/admin/billing', icon: 'card' as const, color: colors.success },
        ].map((item) => (
          <View key={item.path} className="w-1/2 px-2 mb-3">
            <Pressable
              onPress={() => router.push(item.path as any)}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl flex-row items-center"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: item.color + '20' }}
              >
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text className="ml-3 font-medium text-gray-900 dark:text-white">{item.label}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
