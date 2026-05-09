import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface Stats {
  totalProjects: number;
  activeTasks: number;
  totalWorkers: number;
  openIncidents: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'task' | 'incident';
  title: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeTasks: 0,
    totalWorkers: 0,
    openIncidents: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: projects },
        { count: tasks },
        { count: workers },
        { count: incidents },
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('workers').select('*', { count: 'exact', head: true }),
        supabase.from('safety_incidents').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      ]);

      setStats({
        totalProjects: projects || 0,
        activeTasks: tasks || 0,
        totalWorkers: workers || 0,
        openIncidents: incidents || 0,
      });
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setActivities(
          data.map((n) => ({
            id: n.id,
            type: n.type || 'project',
            title: n.title || 'New activity',
            timestamp: n.created_at,
            user: n.user_id || 'System',
          }))
        );
      }
    } catch (e) {
      console.error('Error fetching activity:', e);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    onPress,
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mx-1"
      style={{ minWidth: (width - 48) / 2 - 8 }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <FontAwesome name={icon as any} size={18} color={color} />
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </Text>
      </View>
      <Text className="text-sm text-gray-500 dark:text-gray-400">{title}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({
    title,
    icon,
    color,
    onPress,
  }: {
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <FontAwesome name={icon as any} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">Tap to create</Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <View className="px-4 pt-6 pb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Admin Dashboard
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Overview of your construction operations
        </Text>

        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon="building"
            color="#3B82F6"
            onPress={() => router.push('/(admin)/projects')}
          />
          <StatCard
            title="Active Tasks"
            value={stats.activeTasks}
            icon="tasks"
            color="#10B981"
          />
          <StatCard
            title="Workers"
            value={stats.totalWorkers}
            icon="users"
            color="#F59E0B"
          />
          <StatCard
            title="Open Incidents"
            value={stats.openIncidents}
            icon="exclamation-triangle"
            color="#EF4444"
          />
        </View>

        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </Text>

        <QuickAction
          title="New Project"
          icon="plus-circle"
          color="#3B82F6"
          onPress={() => router.push('/(tabs)/projects/new')}
        />
        <QuickAction
          title="Create Task"
          icon="check-circle"
          color="#10B981"
          onPress={() => router.push('/(tabs)/tasks/new')}
        />
        <QuickAction
          title="Report Incident"
          icon="warning"
          color="#EF4444"
          onPress={() => router.push('/(tabs)/safety/new')}
        />
        <QuickAction
          title="Add Worker"
          icon="user-plus"
          color="#F59E0B"
          onPress={() => router.push('/(tabs)/team/new')}
        />

        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4 mt-4">
          Recent Activity
        </Text>

        {loading ? (
          <Text className="text-gray-500 dark:text-gray-400 text-center py-4">
            Loading...
          </Text>
        ) : activities.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 items-center">
            <FontAwesome name="bell-o" size={32} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 mt-2">No recent activity</Text>
          </View>
        ) : (
          <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
            {activities.map((activity, index) => (
              <View
                key={activity.id}
                className={`p-4 ${
                  index !== activities.length - 1
                    ? 'border-b border-gray-100 dark:border-gray-700'
                    : ''
                }`}
              >
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-blue-500 mr-3">
                  </View>
                  <View className="flex-1">
                    <Text className="text-base text-gray-900 dark:text-white">
                      {activity.title}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()} · {activity.user}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
