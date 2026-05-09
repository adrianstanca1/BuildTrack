import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjectsStore } from '../../stores/projectsStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useTeamStore } from '../../stores/teamStore';
import type { Project, Task } from '../../types';
import { colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';

export default function ProjectDetailModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { projects, updateProject } = useProjectsStore();
  const { tasks, getTasksByProject } = useTasksStore();
  const { workers } = useTeamStore();

  const project = projects.find((p) => p.id === id);
  const projectTasks = id ? getTasksByProject(id as string) : [];
  const assignedWorkers = workers.filter((w) =>
    w.projectAssignments?.includes(id as string)
  );

  const [progress, setProgress] = useState(project?.progress?.toString() || '0');
  const [notes, setNotes] = useState(project?.description || '');

  if (!project) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Ionicons name="construct-outline" size={48} color={colors.gray} />
        <Text className="text-gray-500 mt-4">Project not found</Text>
      </View>
    );
  }

  const handleUpdateProgress = () => {
    const newProgress = parseInt(progress);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      Alert.alert('Error', 'Progress must be between 0 and 100');
      return;
    }
    updateProject(project.id, { progress: newProgress });
    Alert.alert('Success', 'Progress updated');
  };

  const statusColors: Record<Project['status'], string> = {
    planning: '#0891b2',
    active: '#16a34a',
    'on-hold': '#ca8a04',
    completed: '#2563eb',
    cancelled: '#dc2626',
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.location}</Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </Pressable>
        </View>

        {/* Status & Quick Stats */}
        <View className="flex-row items-center mb-4">
          <StatusBadge status={project.status} />
          <View
            className="ml-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: statusColors[project.status] + '20' }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: statusColors[project.status] }}
            >
              {project.progress}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <Card className="mb-4 p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</Text>
            <Text className="text-sm font-bold text-blue-600">{project.progress}%</Text>
          </View>
          <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
            <View
              className="h-full rounded-full"
              style={{
                width: `${project.progress}%`,
                backgroundColor: statusColors[project.status],
              }}
            />
          </View>

          {/* Quick Progress Update */}
          <View className="flex-row items-center">
            <TextInput
              value={progress}
              onChangeText={setProgress}
              keyboardType="numeric"
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 mr-2"
              placeholder="0-100"
            />
            <Pressable
              onPress={handleUpdateProgress}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Update</Text>
            </Pressable>
          </View>
        </Card>

        {/* Project Info */}
        <Card className="mb-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Details</Text>
          <InfoRow icon="calendar" label="Start Date" value={new Date(project.startDate).toLocaleDateString()} />
          <InfoRow icon="flag" label="End Date" value={new Date(project.endDate).toLocaleDateString()} />
          <InfoRow icon="cash" label="Budget" value={`$${project.budget?.toLocaleString() || 0}`} />
          <InfoRow icon="people" label="Team Size" value={`${project.teamSize} workers`} />
        </Card>

        {/* Description/Notes */}
        <Card className="mb-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
            placeholder="Add notes..."
            textAlignVertical="top"
          />
          {notes !== project.description && (
            <Pressable
              onPress={() => {
                updateProject(project.id, { description: notes });
                Alert.alert('Success', 'Notes saved');
              }}
              className="bg-blue-600 p-3 rounded-lg mt-2 items-center"
            >
              <Text className="text-white font-medium">Save Notes</Text>
            </Pressable>
          )}
        </Card>

        {/* Tasks */}
        <Card className="mb-4 p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">Tasks ({projectTasks.length})</Text>
            <Pressable
              onPress={() => router.push('/(modals)/task-details' as any)}
              className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full"
            >
              <Text className="text-blue-600 dark:text-blue-400 text-sm font-medium">+ Add</Text>
            </Pressable>
          </View>

          {projectTasks.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No tasks yet</Text>
          ) : (
            projectTasks.slice(0, 5).map((task) => (
              <Pressable
                key={task.id}
                onPress={() => router.push(`/(modals)/task-details?id=${task.id}` as any)}
                className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <Ionicons
                  name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={task.status === 'completed' ? colors.success : colors.gray}
                />
                <Text className="flex-1 ml-2 text-gray-900 dark:text-white" numberOfLines={1}>
                  {task.title}
                </Text>
                <PriorityBadge priority={task.priority} />
              </Pressable>
            ))
          )}

          {projectTasks.length > 5 && (
            <Pressable className="mt-2 items-center">
              <Text className="text-blue-600 text-sm">View all {projectTasks.length} tasks →</Text>
            </Pressable>
          )}
        </Card>

        {/* Team */}
        <Card className="mb-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Assigned Workers ({assignedWorkers.length})</Text>

          {assignedWorkers.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No workers assigned</Text>
          ) : (
            assignedWorkers.map((worker) => (
              <View
                key={worker.id}
                className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-2">
                  <Text className="text-sm font-bold text-blue-600">{worker.name.charAt(0)}</Text>
                </View>
                <Text className="flex-1 text-gray-900 dark:text-white">{worker.name}</Text>
                <Text className="text-xs text-gray-500 capitalize">{worker.role}</Text>
              </View>
            ))
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-2">
      <Ionicons name={icon as any} size={16} color={colors.gray} />
      <Text className="text-sm text-gray-500 ml-2 w-24">{label}</Text>
      <Text className="flex-1 text-sm text-gray-900 dark:text-white font-medium">{value}</Text>
    </View>
  );
}
