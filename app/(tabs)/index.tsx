import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjectsStore } from '../../stores/projectsStore';
import { useTasksStore } from '../../stores/tasksStore';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../constants/colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { projects } = useProjectsStore();
  const { tasks, getOverdueTasks, getTodayTasks } = useTasksStore();

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const overdueTasks = getOverdueTasks().length;
  const todayTasks = getTodayTasks().length;
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
    : 0;

  const recentProjects = projects.slice(0, 3);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            BuildTrack
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Construction Management
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row flex-wrap -mx-2 mb-6">
          <StatCard 
            icon="construct" 
            label="Active Projects" 
            value={activeProjects} 
            color={colors.primary}
          />
          <StatCard 
            icon="list" 
            label="Today's Tasks" 
            value={todayTasks} 
            color={colors.success}
          />
          <StatCard 
            icon="warning" 
            label="Overdue" 
            value={overdueTasks} 
            color={overdueTasks > 0 ? colors.danger : colors.success}
          />
          <StatCard 
            icon="checkmark-done" 
            label="Completion" 
            value={`${completionRate}%`} 
            color={completionRate >= 80 ? colors.success : colors.warning}
          />
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Quick Actions
        </Text>
        <View className="flex-row -mx-2 mb-6">
          <QuickAction 
            icon="add-circle" 
            label="New Project" 
            onPress={() => router.push('/(modals)/project-details')}
          />
          <QuickAction 
            icon="create" 
            label="Log Task" 
            onPress={() => router.push('/(modals)/task-details')}
          />
          <QuickAction 
            icon="shield-checkmark" 
            label="Safety Check" 
            onPress={() => router.push('/(modals)/safety-report')}
          />
          <QuickAction 
            icon="camera" 
            label="Site Photo" 
            onPress={() => {}}
          />
        </View>

        {/* Recent Projects */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Projects
          </Text>
          <Pressable onPress={() => router.push('/projects')}>
            <Text className="text-sm text-blue-600">View All →</Text>
          </Pressable>
        </View>

        {recentProjects.map(project => (
          <Card key={project.id} className="mb-3">
            <Pressable 
              onPress={() => router.push(`/(modals)/project-details?id=${project.id}` as any)}
              className="p-4"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {project.name}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {project.location}
                  </Text>
                </View>
                <StatusBadge status={project.status} />
              </View>
              
              <View className="flex-row mt-3 space-x-4">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={14} color={colors.gray} />
                  <Text className="text-xs text-gray-500 ml-1">
                    {new Date(project.endDate).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people" size={14} color={colors.gray} />
                  <Text className="text-xs text-gray-500 ml-1">
                    {project.teamSize} workers
                  </Text>
                </View>
              </View>
              
              {/* Progress bar */}
              <View className="mt-3">
                <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1">{project.progress}% complete</Text>
              </View>
            </Pressable>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <View className="w-1/4 px-2">
      <Pressable 
        onPress={onPress}
        className="items-center p-3 bg-white dark:bg-gray-800 rounded-xl"
      >
        <Ionicons name={icon} size={24} color={colors.primary} />
        <Text className="text-xs text-gray-700 dark:text-gray-300 mt-1 text-center">{label}</Text>
      </Pressable>
    </View>
  );
}
