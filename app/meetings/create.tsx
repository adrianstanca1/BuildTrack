import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMeetingsStore } from '../../stores/meetingsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import type { MeetingType, MeetingStatus, MeetingAttendee } from '../../types/field';

const MEETING_TYPES: MeetingType[] = [
  'safety_toolbox',
  'standup',
  'client_walkthrough',
  'change_order',
  'quality_review',
  'progress_review',
  'closeout',
  'other',
];

const MEETING_STATUSES: MeetingStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled'];

function typeLabel(type: MeetingType) {
  switch (type) {
    case 'safety_toolbox': return 'Safety Toolbox';
    case 'client_walkthrough': return 'Client Walkthrough';
    case 'change_order': return 'Change Order';
    case 'quality_review': return 'Quality Review';
    case 'progress_review': return 'Progress Review';
    default: return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export default function CreateMeetingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createMeeting } = useMeetingsStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    projectId: '',
    projectName: '',
    meetingType: 'standup' as MeetingType,
    scheduledAt: '',
    durationMinutes: 30,
    location: '',
    agenda: '',
    notes: '',
    status: 'scheduled' as MeetingStatus,
    attendees: [] as MeetingAttendee[],
  });

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAttendee = () => {
    setForm((prev) => ({
      ...prev,
      attendees: [
        ...prev.attendees,
        { name: '', role: '', email: '', present: false },
      ],
    }));
  };

  const handleUpdateAttendee = (index: number, field: keyof MeetingAttendee, value: string | boolean) => {
    setForm((prev) => {
      const updated = [...prev.attendees];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, attendees: updated };
    });
  };

  const handleRemoveAttendee = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.projectName || !form.scheduledAt) {
      Alert.alert('Error', 'Title, project name, and scheduled date/time are required');
      return;
    }

    // Validate scheduledAt roughly looks like ISO or YYYY-MM-DD HH:MM
    if (!/\d{4}-\d{2}-\d{2}/.test(form.scheduledAt)) {
      Alert.alert('Error', 'Scheduled date should be in format YYYY-MM-DD or ISO string');
      return;
    }

    setLoading(true);
    try {
      const meeting = await createMeeting({
        title: form.title,
        projectId: form.projectId || undefined,
        projectName: form.projectName,
        meetingType: form.meetingType,
        scheduledAt: form.scheduledAt,
        durationMinutes: form.durationMinutes,
        location: form.location || undefined,
        agenda: form.agenda || undefined,
        notes: form.notes || undefined,
        status: form.status,
        attendees: form.attendees,
      });

      if (meeting) {
        Alert.alert('Success', 'Meeting scheduled');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to schedule meeting');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to schedule meeting');
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Meeting</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4">
            {/* Title */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder="Meeting title"
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

            {/* Meeting Type */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meeting Type</Text>
            <View className="flex-row flex-wrap mb-3">
              {MEETING_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setForm((prev) => ({ ...prev, meetingType: t }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.meetingType === t ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.meetingType === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {typeLabel(t)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Scheduled At */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled At *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.scheduledAt}
              onChangeText={(v) => updateField('scheduledAt', v)}
              placeholder="YYYY-MM-DD HH:MM"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Duration */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={String(form.durationMinutes)}
              onChangeText={(v) => updateField('durationMinutes', Number(v) || 0)}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Location */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.location}
              onChangeText={(v) => updateField('location', v)}
              placeholder="Meeting location"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Agenda */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agenda</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.agenda}
              onChangeText={(v) => updateField('agenda', v)}
              placeholder="Meeting agenda..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ height: 100 }}
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Notes */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.notes}
              onChangeText={(v) => updateField('notes', v)}
              placeholder="Additional notes..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ height: 80 }}
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Status */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</Text>
            <View className="flex-row flex-wrap mb-3">
              {MEETING_STATUSES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.status === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.status === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Attendees */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attendees</Text>
            {form.attendees.map((attendee, index) => (
              <View key={index} className="mb-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">Attendee {index + 1}</Text>
                  <Pressable onPress={() => handleRemoveAttendee(index)}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700"
                  value={attendee.name}
                  onChangeText={(v) => handleUpdateAttendee(index, 'name', v)}
                  placeholder="Name"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700"
                  value={attendee.role}
                  onChangeText={(v) => handleUpdateAttendee(index, 'role', v)}
                  placeholder="Role"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700"
                  value={attendee.email}
                  onChangeText={(v) => handleUpdateAttendee(index, 'email', v)}
                  placeholder="Email"
                  keyboardType="email-address"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
                <Pressable
                  onPress={() => handleUpdateAttendee(index, 'present', !attendee.present)}
                  className="flex-row items-center"
                >
                  <Ionicons
                    name={attendee.present ? 'checkbox-outline' : 'square-outline'}
                    size={20}
                    color={attendee.present ? colors.primary : colors.gray}
                  />
                  <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">Present</Text>
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={handleAddAttendee}
              className="flex-row items-center mb-4"
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text className="text-sm text-blue-600 ml-2">Add Attendee</Text>
            </Pressable>
          </Card>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="bg-blue-600 p-4 rounded-lg items-center mt-4 mb-8"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
