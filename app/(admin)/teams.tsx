import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { useTeamStore } from '../../stores/teamStore';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { DataTable } from '../../components/admin/DataTable';
import type { Worker } from '../../types';

export default function AdminTeamsScreen() {
  const { width } = useWindowDimensions();
  const { workers, loading } = useTeamStore();
  const isWide = width >= 768;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {isWide && (
        <View className="flex-row flex-1">
          <View style={{ width: 220 }}>
            <AdminSidebar />
          </View>
          <View className="flex-1">
            <TeamsContent workers={workers} loading={loading} />
          </View>
        </View>
      )}
      {!isWide && <TeamsContent workers={workers} loading={loading} />}
    </View>
  );
}

function TeamsContent({ workers, loading }: { workers: Worker[]; loading: boolean }) {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Team Management
      </Text>

      {loading && <Text className="text-gray-500">Loading team...</Text>}

      <DataTable
        columns={[
          { key: 'name', header: 'Name', width: 140 },
          { key: 'role', header: 'Role', width: 120 },
          {
            key: 'status',
            header: 'Status',
            width: 100,
            render: (item: Worker) => (
              <Text
                className={`text-sm font-medium ${
                  item.status === 'active'
                    ? 'text-green-600'
                    : item.status === 'off-duty'
                    ? 'text-yellow-600'
                    : 'text-gray-500'
                }`}
              >
                {item.status}
              </Text>
            ),
          },
          { key: 'phone', header: 'Phone', width: 140 },
          { key: 'email', header: 'Email', width: 180 },
          { key: 'weeklyHours', header: 'Hours/wk', width: 90 },
          { key: 'hourly_rate', header: 'Rate', width: 80 },
        ]}
        data={workers}
        keyExtractor={(item) => item.id}
        emptyText="No team members found"
      />
    </ScrollView>
  );
}
