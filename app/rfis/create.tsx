import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRfisStore } from '../../stores/rfisStore';
import { Card } from '../../components/ui/Card';


export default function CreateRfiScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createRfi } = useRfisStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    projectId: '',
    projectName: '',
    status: 'draft' as 'draft' | 'submitted' | 'open' | 'answered' | 'closed',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    question: '',
    answer: '',
    assignedTo: '',
    dueDate: '',
    submittedBy: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.projectName || !form.question || !form.submittedBy) {
      Alert.alert('Error', 'Title, project name, question, and submitted by are required');
      return;
    }

    setLoading(true);
    try {
      const rfi = await createRfi({
        title: form.title,
        projectId: form.projectId || undefined,
        projectName: form.projectName,
        status: form.status,
        priority: form.priority,
        question: form.question,
        answer: form.answer || undefined,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
        submittedBy: form.submittedBy,
      });

      if (rfi) {
        Alert.alert('Success', 'RFI created');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create RFI');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create RFI');
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New RFI</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4">
            {/* Title */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder="RFI title"
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

            {/* Priority */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</Text>
            <View className="flex-row mb-3">
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setForm((prev) => ({ ...prev, priority: p }))}
                  className={`mr-2 px-3 py-2 rounded-full ${
                    form.priority === p ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.priority === p ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Question */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.question}
              onChangeText={(v) => updateField('question', v)}
              placeholder="Enter your question..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ height: 100 }}
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Assigned To */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.assignedTo}
              onChangeText={(v) => updateField('assignedTo', v)}
              placeholder="Name of assignee"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Due Date */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.dueDate}
              onChangeText={(v) => updateField('dueDate', v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Submitted By */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submitted By *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.submittedBy}
              onChangeText={(v) => updateField('submittedBy', v)}
              placeholder="Your name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
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
              {loading ? 'Creating...' : 'Create RFI'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
