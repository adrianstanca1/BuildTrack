import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { useProjectsStore } from '../../stores/projectsStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useTeamStore } from '../../stores/teamStore';
import { colors } from '../../constants/colors';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { projects } = useProjectsStore();
  const { tasks, getOverdueTasks, getTodayTasks } = useTasksStore();
  const { workers, getWorkersByStatus } = useTeamStore();

  // --- Stats ---
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = getOverdueTasks().length;
  const todayTasksCount = getTodayTasks().length;
  const totalWorkers = workers.length;
  const activeWorkers = getWorkersByStatus('active').length;

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  const bgColor = isDark ? 'bg-zinc-950' : 'bg-gray-50';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-zinc-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-zinc-900' : 'bg-white';

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['bottom']}>
      <ScrollView className="px-4 pt-4 pb-8">
        {/* Header */}
        <View className="mb-6">
          <Text className={`text-3xl font-extrabold ${textColor}`}>Admin</Text>
          <Text className={`text-sm ${mutedColor} mt-1`}>Overview & Quick Actions</Text>
        </View>

        {/* Key Metrics Row */}
        <View className="flex-row flex-wrap -mx-2 mb-6">
          <MetricCard icon="construct" label="Projects" value={totalProjects} color={colors.primary} isDark={isDark} />
          <MetricCard icon="list" label="Tasks" value={totalTasks} color={colors.success} isDark={isDark} />
          <MetricCard icon="people" label="Workers" value={totalWorkers} color={colors.info} isDark={isDark} />
          <MetricCard icon="warning" label="Overdue" value={overdueTasks} color={overdueTasks > 0 ? colors.danger : colors.success} isDark={isDark} />
        </View>

        {/* Projects Overview */}
        <Text className={`text-lg font-bold ${textColor} mb-3`}>Project Overview</Text>
        <Card className="mb-6 p-4">
          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">{activeProjects}</Text>
              <Text className={`text-xs ${mutedColor}`}>Active</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">{completedProjects}</Text>
              <Text className={`text-xs ${mutedColor}`}>Completed</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-500">{totalProjects - activeProjects - completedProjects}</Text>
              <Text className={`text-xs ${mutedColor}`}>Pending</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className={`text-xs ${mutedColor}`}>Overall Completion</Text>
              <Text className="text-xs font-bold text-blue-600">{projectCompletionRate}%</Text>
            </View>
            <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${projectCompletionRate}%` }}
              />
            </View>
          </View>
        </Card>

        {/* Tasks Overview */}
        <Text className={`text-lg font-bold ${textColor} mb-3`}>Task Overview</Text>
        <Card className="mb-6 p-4">
          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">{todayTasksCount}</Text>
              <Text className={`text-xs ${mutedColor}`}>Today</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">{completedTasks}</Text>
              <Text className={`text-xs ${mutedColor}`}>Done</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-500">{overdueTasks}</Text>
              <Text className={`text-xs ${mutedColor}`}>Overdue</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className={`text-xs ${mutedColor}`}>Task Completion</Text>
              <Text className="text-xs font-bold text-green-600">{taskCompletionRate}%</Text>
            </View>
            <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </View>
          </View>
        </Card>

        {/* Team Overview */}
        <Text className={`text-lg font-bold ${textColor} mb-3`}>Team Overview</Text>
        <Card className="mb-6 p-4">
          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">{totalWorkers}</Text>
              <Text className={`text-xs ${mutedColor}`}>Total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">{activeWorkers}</Text>
              <Text className={`text-xs ${mutedColor}`}>Active</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-500">{totalWorkers - activeWorkers}</Text>
              <Text className={`text-xs ${mutedColor}`}>Off-duty</Text>
            </View>
          </View>
          <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-row">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${totalWorkers > 0 ? (activeWorkers / totalWorkers) * 100 : 0}%` }}
            />
          </View>
        </Card>

        {/* Quick Actions */}
        <Text className={`text-lg font-bold ${textColor} mb-3`}>Quick Actions</Text>
        <View className="flex-row flex-wrap -mx-2">
          <QuickAction
            icon="add-circle"
            label="New Project"
            color={colors.primary}
            onPress={() => router.push('/(modals)/project-details' as any)}
          />
          <QuickAction
            icon="create"
            label="Log Task"
            color={colors.success}
            onPress={() => router.push('/(modals)/task-details' as any)}
          />
          <QuickAction
            icon="shield-checkmark"
            label="Safety Check"
            color={colors.danger}
            onPress={() => router.push('/(modals)/safety-report' as any)}
          />
          <QuickAction
            icon="people"
            label="View Team"
            color={colors.info}
            onPress={() => router.push('/(tabs)/team' as any)}
          />
          <QuickAction
            icon="map"
            label="Site Map"
            color="#0891b2"
            onPress={() => router.push('/(tabs)/map' as any)}
          />
          <QuickAction
            icon="notifications"
            label="Alerts"
            color="#ea580c"
            onPress={() => router.push('/(tabs)/notifications' as any)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  isDark: boolean;
}) {
  return (
    <View className="w-1/2 px-2 mb-3">
      <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} p-4 rounded-xl`}>
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: color + '15' }}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{label}</Text>
        </View>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</Text>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <View className="w-1/3 px-2 mb-3">
      <Pressable onPress={onPress} className="items-center p-3 bg-white dark:bg-zinc-900 rounded-xl">
        <Ionicons name={icon} size={24} color={color} />
        <Text className="text-xs text-gray-700 dark:text-gray-300 mt-1 text-center">{label}</Text>
      </Pressable>
    </View>
  );
}
