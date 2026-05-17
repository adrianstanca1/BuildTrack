import { View, Text, ScrollView, useWindowDimensions, Pressable, Alert } from 'react-native';
import { useAdmin } from '../../hooks/useAdmin';
import { useAdminStore, type UserRole } from '../../stores/billingStore';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { DataTable } from '../../components/admin/DataTable';


export default function AdminUsersScreen() {
  const { width } = useWindowDimensions();
  const { allUsers, loading, isAdmin } = useAdmin();
  const setUserRole = useAdminStore((s) => s.setUserRole);
  const isWide = width >= 768;

  const handleRoleChange = (userId: string, currentRole: string, newRole: UserRole) => {
    if (currentRole === newRole) return;
    Alert.alert(
      'Change Role',
      `Set this user to ${newRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          style: 'default',
          onPress: async () => {
            try {
              await setUserRole(userId, newRole);
              Alert.alert('Success', `User role updated to ${newRole.toUpperCase()}`);
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update role');
            }
          },
        },
      ]
    );
  };

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
            <UsersContent users={allUsers} loading={loading} onRoleChange={handleRoleChange} />
          </View>
        </View>
      )}
      {!isWide && <UsersContent users={allUsers} loading={loading} onRoleChange={handleRoleChange} />}
    </View>
  );
}

function UsersContent({
  users,
  loading,
  onRoleChange,
}: {
  users: any[];
  loading: boolean;
  onRoleChange: (userId: string, currentRole: string, newRole: UserRole) => void;
}) {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        User Management
      </Text>

      {loading && <Text className="text-gray-500">Loading users...</Text>}

      <DataTable
        columns={[
          {
            key: 'email',
            header: 'Email',
            width: 180,
            render: (item: any) => (
              <Text className="text-sm text-gray-900 dark:text-white" numberOfLines={1}>
                {item.email || '—'}
              </Text>
            ),
          },
          {
            key: 'full_name',
            header: 'Name',
            width: 140,
            render: (item: any) => (
              <Text className="text-sm text-gray-700 dark:text-gray-300" numberOfLines={1}>
                {item.full_name || '—'}
              </Text>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            width: 120,
            render: (item: any) => (
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
            key: 'actions',
            header: 'Actions',
            width: 160,
            render: (item: any) => (
              <View className="flex-row">
                {(['user', 'admin', 'super_admin'] as UserRole[]).map((role) => (
                  <Pressable
                    key={role}
                    onPress={() => onRoleChange(item.id, item.role, role)}
                    className={`px-2 py-1 rounded mr-1 ${
                      item.role === role
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.role === role
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {role[0].toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
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
