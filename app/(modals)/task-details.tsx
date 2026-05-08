import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasksStore, Task, TaskPriority, TaskStatus } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { colors } from '../../constants/colors';

export default function TaskDetailsModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tasks, addTask, updateTask } = useTasksStore();
  const { projects } = useProjectsStore();

  const existing = id ? tasks.find(t => t.id === id as string) : undefined;
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [projectId, setProjectId] = useState(existing?.projectId || '');
  const [assignedTo, setAssignedTo] = useState(existing?.assignedTo || '');
  const [priority, setPriority] = useState<TaskPriority>(existing?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(existing?.status || 'pending');
  const [dueDate, setDueDate] = useState(existing?.dueDate || new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    const selectedProject = projects.find(p => p.id === projectId);

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      projectId: projectId || undefined,
      projectName: selectedProject?.name || 'No Project',
      assignedTo: assignedTo.trim() || 'Unassigned',
      priority,
      status,
      dueDate,
    };

    if (isEditing) {
      updateTask(id as string, taskData);
    } else {
      addTask(taskData);
    }

    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Task' : 'New Task'}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </Pressable>
        </View>

        <InputField label="Task Title *" value={title} onChangeText={setTitle} placeholder="e.g. Pour foundation concrete" />
        <InputField label="Description" value={description} onChangeText={setDescription} placeholder="Task details..." />
        <InputField label="Assigned To" value={assignedTo} onChangeText={setAssignedTo} placeholder="Worker name" />
        <InputField label="Due Date" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <Pressable
            onPress={() => setProjectId('')}
            className={`mr-2 px-4 py-2 rounded-full ${projectId === '' ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <Text className={projectId === '' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>No Project</Text>
          </Pressable>
          {projects.map(p => (
            <Pressable
              key={p.id}
              onPress={() => setProjectId(p.id)}
              className={`mr-2 px-4 py-2 rounded-full ${projectId === p.id ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Text className={projectId === p.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>{p.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</Text>
        <View className="flex-row -mx-1 mb-4">
          {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              className={`m-1 px-4 py-2 rounded-full ${priority === p ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Text className={priority === p ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</Text>
        <View className="flex-row -mx-1 mb-6">
          {(['pending', 'in-progress', 'completed'] as TaskStatus[]).map(s => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              className={`m-1 px-4 py-2 rounded-full ${status === s ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Text className={status === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                {s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={handleSave} className="bg-blue-600 p-4 rounded-xl items-center">
          <Text className="text-white font-semibold text-lg">{isEditing ? 'Update Task' : 'Create Task'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InputField({ label, value, onChangeText, placeholder }: {
  label: string; value: string; onChangeText: (text: string) => void; placeholder?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
      />
    </View>
  );
}
