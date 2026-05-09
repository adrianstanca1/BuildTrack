import { View, Text, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectsStore } from '../../stores/projectsStore';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Project } from '../../types';

export default function AdminProjectsScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { projects, loading } = useProjectsStore();
  const isWide = width >= 768;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {isWide && (
        <View className="flex-row flex-1">
          <View style={{ width: 220 }}>
            <AdminSidebar />
          </View>
          <View className="flex-1">
            <ProjectsContent projects={projects} loading={loading} router={router} />
          </View>
        </View>
      )}
      {!isWide && <ProjectsContent projects={projects} loading={loading} router={router} />}
    </View>
  );
}

function ProjectsContent({
  projects,
  loading,
  router,
}: {
  projects: Project[];
  loading: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Project Oversight
      </Text>

      {loading && <Text className="text-gray-500">Loading projects...</Text>}

      <DataTable
        columns={[
          { key: 'name', header: 'Project', width: 160 },
          { key: 'location', header: 'Location', width: 140 },
          {
            key: 'status',
            header: 'Status',
            width: 100,
            render: (item: Project) => <StatusBadge status={item.status} />,
          },
          { key: 'budget', header: 'Budget', width: 100 },
          { key: 'progress', header: 'Progress', width: 100 },
          { key: 'teamSize', header: 'Team', width: 80 },
        ]}
        data={projects}
        keyExtractor={(item) => item.id}
        onRowPress={(item) => router.push(`/(modals)/project-details?id=${item.id}` as any)}
        emptyText="No projects found"
      />
    </ScrollView>
  );
}
