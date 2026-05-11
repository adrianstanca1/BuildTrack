import { View, Text, FlatList, Pressable, TextInput, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTasksStore } from '../../stores/tasksStore';
import { Card } from '../../components/ui/Card';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../constants/colors';

export default function TasksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { tasks, toggleTaskStatus } = useTasksStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</Text>
          <Pressable
            onPress={() => router.push('/(modals)/task-details')}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">New</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-3 py-2.5 mb-3 shadow-sm">
          <Ionicons name="search" size={18} color={colors.gray} />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
            placeholder="Search tasks, projects, assignees..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} className="ml-2">
              <Ionicons name="close-circle" size={18} color={colors.gray} />
            </Pressable>
          )}
        </View>

        {/* Status Filters */}
        <View className="flex-row mb-4">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatusFilter(s)}
              className={`mr-2 px-3 py-1.5 rounded-full ${
                statusFilter === s
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-medium capitalize ${
                  statusFilter === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card className="mb-3">
              <Pressable
                onPress={() => router.push(`/(modals)/task-details?id=${item.id}`)}
                className="p-4"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.projectName}</Text>
                  </View>
                  <PriorityBadge priority={item.priority} />
                </View>

                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2" numberOfLines={2}>
                  {item.description}
                </Text>

                <View className="flex-row justify-between items-center mt-3">
                  <View className="flex-row items-center space-x-4">
                    <View className="flex-row items-center">
                      <Ionicons name="person" size={14} color={colors.gray} />
                      <Text className="text-xs text-gray-500 ml-1">{item.assignedTo}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar"
                        size={14}
                        color={item.isOverdue ? colors.danger : colors.gray}
                      />
                      <Text
                        className={`text-xs ml-1 ${
                          item.isOverdue ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        {new Date(item.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => toggleTaskStatus(item.id)}
                    className={`px-3 py-1 rounded-full ${
                      item.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.status === 'completed'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {item.status === 'completed' ? 'Done' : 'Mark Done'}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Card>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Ionicons name="list-outline" size={48} color={colors.gray} />
              <Text className="text-gray-500 mt-4 text-center">
                {searchQuery || statusFilter !== 'all'
                  ? 'No matching tasks.'
                  : 'No tasks yet.\nTap "New" to create one.'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
