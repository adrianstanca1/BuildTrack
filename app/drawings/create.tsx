import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrawingsStore } from '../../stores/drawingsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

const DISCIPLINES = [
  { value: 'architectural' as const, label: 'Architectural', icon: 'business' },
  { value: 'structural' as const, label: 'Structural', icon: 'construct' },
  { value: 'mechanical' as const, label: 'Mechanical', icon: 'settings' },
  { value: 'electrical' as const, label: 'Electrical', icon: 'flash' },
  { value: 'plumbing' as const, label: 'Plumbing', icon: 'water' },
  { value: 'civil' as const, label: 'Civil', icon: 'earth' },
];

const STATUSES = [
  { value: 'active' as const, label: 'Active' },
  { value: 'superseded' as const, label: 'Superseded' },
  { value: 'archived' as const, label: 'Archived' },
];

export default function CreateDrawingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createDrawing } = useDrawingsStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    projectName: '',
    revision: 'A',
    discipline: 'architectural' as typeof DISCIPLINES[number]['value'],
    status: 'active' as typeof STATUSES[number]['value'],
    uploadedBy: '',
    fileUrl: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.projectName || !form.uploadedBy) {
      Alert.alert('Error', 'Title, project name, and uploaded by are required');
      return;
    }

    setLoading(true);
    try {
      const drawing = await createDrawing({
        title: form.title,
        projectName: form.projectName,
        revision: form.revision,
        discipline: form.discipline,
        status: form.status,
        uploadedBy: form.uploadedBy,
        fileUrl: form.fileUrl || undefined,
      });

      if (drawing) {
        Alert.alert('Success', 'Drawing created');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create drawing');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create drawing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="p-4 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Drawing</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4">
            {/* Title */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder="Drawing title"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Project Name */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.projectName}
              onChangeText={(v) => updateField('projectName', v)}
              placeholder="Project name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Revision */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Revision</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.revision}
              onChangeText={(v) => updateField('revision', v)}
              placeholder="e.g. A, B, 1, 2"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Discipline */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discipline</Text>
            <View className="flex-row flex-wrap mb-3">
              {DISCIPLINES.map((d) => (
                <Pressable
                  key={d.value}
                  onPress={() => setForm((prev) => ({ ...prev, discipline: d.value }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.discipline === d.value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.discipline === d.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Status */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</Text>
            <View className="flex-row flex-wrap mb-3">
              {STATUSES.map((s) => (
                <Pressable
                  key={s.value}
                  onPress={() => setForm((prev) => ({ ...prev, status: s.value }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.status === s.value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.status === s.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Uploaded By */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uploaded By *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.uploadedBy}
              onChangeText={(v) => updateField('uploadedBy', v)}
              placeholder="Your name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* File URL */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File URL</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.fileUrl}
              onChangeText={(v) => updateField('fileUrl', v)}
              placeholder="https://..."
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              keyboardType="url"
              autoCapitalize="none"
            />
          </Card>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="bg-blue-600 p-4 rounded-lg items-center mt-4 mb-8"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Creating...' : 'Create Drawing'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
