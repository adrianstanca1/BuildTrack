import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubmittalsStore } from '../../stores/submittalsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function CreateSubmittalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createSubmittal } = useSubmittalsStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    projectId: '',
    projectName: '',
    status: 'draft' as 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected',
    type: 'other' as 'material' | 'shop-drawing' | 'product-data' | 'sample' | 'mockup' | 'other',
    description: '',
    specSection: '',
    submittedBy: '',
    reviewedBy: '',
    reviewDate: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.projectName || !form.description || !form.submittedBy) {
      Alert.alert('Error', 'Title, project name, description, and submitted by are required');
      return;
    }

    setLoading(true);
    try {
      const submittal = await createSubmittal({
        title: form.title,
        projectId: form.projectId || undefined,
        projectName: form.projectName,
        status: form.status,
        type: form.type,
        description: form.description,
        specSection: form.specSection || undefined,
        submittedBy: form.submittedBy,
        reviewedBy: form.reviewedBy || undefined,
        reviewDate: form.reviewDate || undefined,
      });

      if (submittal) {
        Alert.alert('Success', 'Submittal created');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create submittal');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create submittal');
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Submittal</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4">
            {/* Title */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder="Submittal title"
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

            {/* Type */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</Text>
            <View className="flex-row flex-wrap mb-3">
              {(['material', 'shop-drawing', 'product-data', 'sample', 'mockup', 'other'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.type === t ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {t === 'shop-drawing' ? 'Shop Drawing' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Description */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Enter description..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ height: 100 }}
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Spec Section */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spec Section</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.specSection}
              onChangeText={(v) => updateField('specSection', v)}
              placeholder="e.g. 03300 Cast-in-Place Concrete"
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
              {loading ? 'Creating...' : 'Create Submittal'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
