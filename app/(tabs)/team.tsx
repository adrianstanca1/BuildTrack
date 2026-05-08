import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../constants/colors';

export default function TeamScreen() {
  const { workers, getWorkersByStatus, getWorkersByRole } = useTeamStore();

  const activeWorkers = getWorkersByStatus('active');
  const totalWorkers = workers.length;
  const totalHours = workers.reduce((sum, w) => sum + (w.weeklyHours || 0), 0);

  const roleBreakdown = getWorkersByRole();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Team Management
        </Text>

        {/* Team Stats */}
        <View className="flex-row -mx-2 mb-6">
          <TeamStatCard 
            icon="people" 
            label="Total" 
            value={totalWorkers}
            color={colors.primary}
          />
          <TeamStatCard 
            icon="person-check" 
            label="Active" 
            value={activeWorkers.length}
            color={colors.success}
          />
          <TeamStatCard 
            icon="time" 
            label="Hours/Week" 
            value={totalHours}
            color={colors.warning}
          />
        </View>

        {/* Role Breakdown */}
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Role Breakdown
        </Text>

        <View className="flex-row flex-wrap -mx-2 mb-6">
          {Object.entries(roleBreakdown).map(([role, count]) => (
            <View key={role} className="w-1/2 px-2 mb-3">
              <View className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="briefcase" size={16} color={colors.primary} />
                  <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">{count}</Text>
                </View>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Workers List */}
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Team Members
        </Text>

        {workers.map(worker => (
          <Card key={worker.id} className="mb-3">
            <View className="p-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center">
                    <Text className="text-lg font-bold text-blue-600 dark:text-blue-300">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View className="ml-3">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">{worker.name}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 capitalize">{worker.role}</Text>
                  </View>
                </View>
                <StatusBadge status={worker.status} />
              </View>

              <View className="flex-row mt-3 space-x-4">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={14} color={colors.gray} />
                  <Text className="text-xs text-gray-500 ml-1">{worker.weeklyHours}h/week</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="call" size={14} color={colors.gray} />
                  <Text className="text-xs text-gray-500 ml-1">{worker.phone}</Text>
                </View>
                {'certifications' in worker && worker.certifications.length > 0 && (
                  <View className="flex-row items-center">
                    <Ionicons name="ribbon" size={14} color={colors.success} />
                    <Text className="text-xs text-green-600 ml-1">{worker.certifications.length} certs</Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

function TeamStatCard({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; color: string }) {
  return (
    <View className="w-1/3 px-2">
      <View className="bg-white dark:bg-gray-800 p-4 rounded-xl items-center">
        <Ionicons name={icon} size={24} color={color} />
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</Text>
        <Text className="text-xs text-gray-500 mt-1">{label}</Text>
      </View>
    </View>
  );
}
