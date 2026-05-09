import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useCreateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { ClipboardList, Calendar, AlertCircle } from 'lucide-react-native';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: COLORS.dark.success },
  { value: 'medium', label: 'Medium', color: COLORS.dark.warning },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'urgent', label: 'Urgent', color: COLORS.dark.danger },
];

export default function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const createTask = useCreateTask();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data?.data || [];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      Alert.alert('Success', 'Task created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  const inputStyle = {
    backgroundColor: COLORS.dark.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.dark.text,
    fontSize: TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  };

  const labelStyle = {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: '600',
    color: COLORS.dark.textMuted,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: COLORS.dark.primary, fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>
            New Task
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={labelStyle}>Task Title *</Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={COLORS.dark.textMuted}
        />

        <Text style={labelStyle}>Description</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add details..."
          placeholderTextColor={COLORS.dark.textMuted}
          multiline
        />

        <Text style={labelStyle}>Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity
              onPress={() => setProjectId('')}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                backgroundColor: projectId === '' ? COLORS.dark.primary + '30' : COLORS.dark.surface,
                borderWidth: 1,
                borderColor: projectId === '' ? COLORS.dark.primary : COLORS.dark.border,
              }}
            >
              <Text style={{ color: projectId === '' ? COLORS.dark.primary : COLORS.dark.textMuted }}>No Project</Text>
            </TouchableOpacity>
            {projects.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setProjectId(p.id)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  borderRadius: RADIUS.md,
                  backgroundColor: projectId === p.id ? (p.color || COLORS.dark.primary) + '30' : COLORS.dark.surface,
                  borderWidth: 1,
                  borderColor: projectId === p.id ? (p.color || COLORS.dark.primary) : COLORS.dark.border,
                }}
              >
                <Text style={{ color: projectId === p.id ? (p.color || COLORS.dark.primary) : COLORS.dark.textMuted }}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={labelStyle}>Priority</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setPriority(p.value)}
              style={{
                flex: 1,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                backgroundColor: priority === p.value ? p.color + '30' : COLORS.dark.surface,
                borderWidth: 1,
                borderColor: priority === p.value ? p.color : COLORS.dark.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: priority === p.value ? p.color : COLORS.dark.textMuted, fontWeight: '600' }}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={labelStyle}>Due Date</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Calendar size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Button
          title="Create Task"
          onPress={handleSubmit}
          loading={createTask.isPending}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
