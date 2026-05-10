import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import type { WorkerRole, WorkerStatus } from '../../types';

const ROLES: { value: WorkerRole; label: string }[] = [
  { value: 'foreman', label: 'Foreman' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'mason', label: 'Mason' },
  { value: 'laborer', label: 'Laborer' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'safety-officer', label: 'Safety Officer' },
];

const STATUSES: { value: WorkerStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'off-duty', label: 'Off-duty' },
  { value: 'on-leave', label: 'On-leave' },
];

export default function CreateTeamMemberScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addWorker } = useTeamStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: 'laborer' as WorkerRole,
    status: 'active' as WorkerStatus,
    email: '',
    phone: '',
    weeklyHours: '',
    certifications: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      Alert.alert('Error', 'Name, email, and phone are required');
      return;
    }

    const hours = parseFloat(form.weeklyHours);

    setLoading(true);
    try {
      await addWorker({
        name: form.name,
        role: form.role,
        status: form.status,
        email: form.email,
        phone: form.phone,
        weeklyHours: isNaN(hours) ? 0 : hours,
        certifications: form.certifications.split(',').map((c) => c.trim()).filter(Boolean),
        projectAssignments: [],
      });

      Alert.alert('Success', 'Team member added');
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add team member');
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Team Member</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4">
            {/* Name */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="Full name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              autoCapitalize="words"
            />

            {/* Role */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</Text>
            <View className="flex-row flex-wrap mb-3">
              {ROLES.map((r) => (
                <Pressable
                  key={r.value}
                  onPress={() => setForm((prev) => ({ ...prev, role: r.value }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.role === r.value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.role === r.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {r.label}
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

            {/* Email */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
              placeholder="email@example.com"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Phone */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.phone}
              onChangeText={(v) => updateField('phone', v)}
              placeholder="+44 7123 456789"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              keyboardType="phone-pad"
            />

            {/* Weekly Hours */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weekly Hours</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.weeklyHours}
              onChangeText={(v) => updateField('weeklyHours', v)}
              placeholder="40"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              keyboardType="number-pad"
            />

            {/* Certifications */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certifications</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.certifications}
              onChangeText={(v) => updateField('certifications', v)}
              placeholder="CSCS, IPAF, PASMA (comma separated)"
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
              {loading ? 'Adding...' : 'Add Team Member'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
