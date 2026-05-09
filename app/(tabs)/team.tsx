import { View, Text, TextInput, FlatList, Pressable, ScrollView, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../constants/colors';

export default function TeamScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { workers, getWorkersByStatus, getWorkersByRole, deleteWorker, toggleActive } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState('');

  const activeWorkers = getWorkersByStatus('active');
  const totalWorkers = workers.length;
  const totalHours = workers.reduce((sum, w) => sum + (w.weeklyHours || 0), 0);

  const roleBreakdown = getWorkersByRole();

  // Filter workers by search
  const filteredWorkers = searchQuery.trim()
    ? workers.filter((w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.phone.includes(searchQuery)
      )
    : workers;

  const handleDeleteWorker = (id: string, name: string) => {
    Alert.alert(
      'Delete Worker',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorker(id),
        },
      ]
    );
  };

  const handleToggleStatus = (id: string) => {
    toggleActive(id);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Team Management
          </Text>
          <Pressable
            onPress={() => router.push('/(modals)/worker-details' as any)}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Add</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className={`flex-row items-center mb-4 p-3 rounded-xl ${
          isDark ? 'bg-zinc-900' : 'bg-white'
        }`}>
          <Ionicons name="search" size={18} color={colors.gray} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search workers..."
            placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
            className={`flex-1 ml-2 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.gray} />
            </Pressable>
          )}
        </View>

        {/* Team Stats */}
        <View className="flex-row -mx-2 mb-6">
          <TeamStatCard
            icon="people"
            label="Total"
            value={totalWorkers}
            color={colors.primary}
          />
          <TeamStatCard
            icon="checkmark-circle"
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
          {Object.entries(roleBreakdown).map(([role, workers]) => (
            <View key={role} className="w-1/2 px-2 mb-3">
              <View className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="briefcase" size={16} color={colors.primary} />
                  <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                    {workers.length}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                  {role}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Workers List */}
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Team Members ({filteredWorkers.length})
        </Text>

        {filteredWorkers.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="people-outline" size={48} color={colors.gray} />
            <Text className="text-gray-500 mt-4 text-center">
              {searchQuery ? 'No workers match your search' : 'No workers yet.\nTap "Add" to create one.'}
            </Text>
          </View>
        ) : (
          filteredWorkers.map((worker) => (
            <Card key={worker.id} className="mb-3">
              <View className="p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center">
                      <Text className="text-lg font-bold text-blue-600 dark:text-blue-300">
                        {worker.name.split(' ').map((n) => n[0]).join('')}
                      </Text>
                    </View>
                    <View className="ml-3">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {worker.name}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {worker.role}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <StatusBadge status={worker.status} />
                  </View>
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
                  {worker.certifications && worker.certifications.length > 0 && (
                    <View className="flex-row items-center">
                      <Ionicons name="ribbon" size={14} color={colors.success} />
                      <Text className="text-xs text-green-600 ml-1">
                        {worker.certifications.length} certs
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="flex-row mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Pressable
                    onPress={() => handleToggleStatus(worker.id)}
                    className="flex-1 flex-row items-center justify-center py-2"
                  >
                    <Ionicons
                      name={worker.status === 'active' ? 'pause' : 'play'}
                      size={16}
                      color={worker.status === 'active' ? colors.warning : colors.success}
                    />
                    <Text
                      className={`text-sm ml-1 ${
                        worker.status === 'active'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {worker.status === 'active' ? 'Set Off-duty' : 'Set Active'}
                    </Text>
                  </Pressable>

                  <View className="w-px bg-gray-200 dark:bg-gray-700" />

                  <Pressable
                    onPress={() => handleDeleteWorker(worker.id, worker.name)}
                    className="flex-1 flex-row items-center justify-center py-2"
                  >
                    <Ionicons name="trash" size={16} color={colors.danger} />
                    <Text className="text-sm text-red-600 ml-1">Delete</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TeamStatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View className="w-1/3 px-2">
      <View className="bg-white dark:bg-gray-800 p-4 rounded-xl items-center">
        <Ionicons name={icon} size={24} color={color} />
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          {value}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">{label}</Text>
      </View>
    </View>
  );
}
