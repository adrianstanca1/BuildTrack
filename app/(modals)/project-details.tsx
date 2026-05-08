import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjectsStore, Project, ProjectStatus } from '../../stores/projectsStore';
import { colors } from '../../constants/colors';

export default function ProjectDetailsModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { projects, addProject, updateProject } = useProjectsStore();

  const existing = id ? projects.find(p => p.id === id as string) : undefined;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name || '');
  const [location, setLocation] = useState(existing?.location || '');
  const [budget, setBudget] = useState(existing?.budget?.toString() || '');
  const [endDate, setEndDate] = useState(existing?.endDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ProjectStatus>(existing?.status || 'planning');
  const [description, setDescription] = useState(existing?.description || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    const projectData = {
      name: name.trim(),
      location: location.trim(),
      budget: parseFloat(budget) || 0,
      endDate,
      status,
      description: description.trim(),
      progress: existing?.progress || 0,
      teamSize: existing?.teamSize || 0,
      startDate: existing?.startDate || new Date().toISOString(),
    };

    if (isEditing) {
      updateProject(id as string, projectData);
    } else {
      addProject(projectData);
    }

    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Project' : 'New Project'}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </Pressable>
        </View>

        <InputField label="Project Name *" value={name} onChangeText={setName} placeholder="e.g. Riverside Apartments" />
        <InputField label="Location" value={location} onChangeText={setLocation} placeholder="e.g. 123 Main St, Downtown" />
        <InputField label="Budget ($)" value={budget} onChangeText={setBudget} placeholder="500000" keyboardType="numeric" />
        <InputField label="End Date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</Text>
        <View className="flex-row flex-wrap -mx-1 mb-4">
          {(['planning', 'active', 'on-hold', 'completed'] as ProjectStatus[]).map(s => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              className={`m-1 px-4 py-2 rounded-full ${status === s ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Text className={status === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Project details..."
          multiline
          numberOfLines={4}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 mb-6"
          textAlignVertical="top"
        />

        <Pressable
          onPress={handleSave}
          className="bg-blue-600 p-4 rounded-xl items-center"
        >
          <Text className="text-white font-semibold text-lg">{isEditing ? 'Update Project' : 'Create Project'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InputField({ label, value, onChangeText, placeholder, keyboardType = 'default' }: {
  label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
      />
    </View>
  );
}
