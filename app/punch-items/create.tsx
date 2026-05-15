import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { usePunchItemsStore } from '../../stores/punchItemsStore';
import { useProjects } from '@/hooks/useProjects';

const STATUSES = ['open', 'in-progress', 'resolved', 'closed'] as const;
const SEVERITIES = ['cosmetic', 'minor', 'major', 'critical'] as const;

export default function CreatePunchItemScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState<string>('open');
  const [severity, setSeverity] = useState<string>('minor');
  const [projectId, setProjectId] = useState('');

  const { createPunchItem, loading } = usePunchItemsStore();
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const projects = projectsData?.data?.data || [];

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const project = projects.find((p: any) => p.id === projectId);

    try {
      await createPunchItem({
        title: title.trim(),
        location: location.trim() || undefined,
        assignee: assignee.trim() || undefined,
        status: status as any,
        severity: severity as any,
        projectId: projectId || undefined,
        projectName: project?.name || 'No Project',
      });
      Alert.alert('Success', 'Punch item created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create punch item');
    }
  };

  const inputStyle = {
    backgroundColor: theme.inputBg,
    borderRadius: 12,
    padding: 14,
    color: theme.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.inputBorder,
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.textMuted,
    marginBottom: 6,
    marginTop: 16,
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return COLORS.danger;
      case 'major': return '#f97316';
      case 'minor': return COLORS.warning;
      case 'cosmetic': return COLORS.success;
      default: return theme.textMuted;
    }
  };

  const selectedProject = projects.find((p: any) => p.id === projectId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text className="text-xl font-bold ml-4" style={{ color: theme.text }}>New Punch Item</Text>
        </View>

        <Text style={labelStyle}>Project *</Text>
        {loadingProjects ? (
          <ActivityIndicator color={COLORS.primary[600]} />
        ) : projects.length === 0 ? (
          <Text style={{ color: theme.textMuted }}>No projects available</Text>
        ) : (
          <View className="flex-row flex-wrap">
            {projects.map((p: any) => (
              <Pressable
                key={p.id}
                onPress={() => setProjectId(p.id)}
                className="mr-2 mb-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: selectedProject?.id === p.id ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: selectedProject?.id === p.id ? '#fff' : theme.textSecondary }}
                >
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={labelStyle}>Title *</Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="Punch item title"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Location</Text>
        <TextInput
          style={inputStyle}
          value={location}
          onChangeText={setLocation}
          placeholder="Where is the issue located?"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Assignee</Text>
        <TextInput
          style={inputStyle}
          value={assignee}
          onChangeText={setAssignee}
          placeholder="Who is responsible?"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Severity</Text>
        <View className="flex-row flex-wrap">
          {SEVERITIES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSeverity(s)}
              className="mr-2 mb-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: severity === s ? severityColor(s) + '30' : isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                borderColor: severity === s ? severityColor(s) : isDark ? '#334155' : '#e2e8f0',
              }}
            >
              <Text className="text-sm capitalize" style={{ color: severity === s ? severityColor(s) : theme.textSecondary }}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={labelStyle}>Status</Text>
        <View className="flex-row flex-wrap">
          {STATUSES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              className="mr-2 mb-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: status === s ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
              }}
            >
              <Text className="text-sm capitalize" style={{ color: status === s ? '#fff' : theme.textSecondary }}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          className="p-4 rounded-xl items-center mb-8 mt-4"
          style={{
            backgroundColor: loading || !title.trim() ? '#9ca3af' : COLORS.primary[600],
          }}
          onPress={handleSubmit}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">
            {loading ? 'Creating...' : 'Create Punch Item'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
