import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useDelayNotesStore } from '../../stores/delayNotesStore';
import { useProjects } from '@/hooks/useProjects';

const STATUSES = ['open', 'resolved', 'closed'] as const;

export default function CreateDelayNoteScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('open');
  const [projectId, setProjectId] = useState('');
  const [linkedRfiId, setLinkedRfiId] = useState('');

  const { createDelayNote, loading } = useDelayNotesStore();
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const projects = projectsData?.data?.data || [];

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Reason is required');
      return;
    }

    const project = projects.find((p: any) => p.id === projectId);

    try {
      await createDelayNote({
        reason: reason.trim(),
        description: description.trim() || undefined,
        status: status as any,
        projectId: projectId || undefined,
        projectName: project?.name || 'No Project',
        linkedRfiId: linkedRfiId.trim() || undefined,
      });
      Alert.alert('Success', 'Delay note created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create delay note');
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

  const selectedProject = projects.find((p: any) => p.id === projectId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text className="text-xl font-bold ml-4" style={{ color: theme.text }}>New Delay Note</Text>
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

        <Text style={labelStyle}>Reason *</Text>
        <TextInput
          style={inputStyle}
          value={reason}
          onChangeText={setReason}
          placeholder="Reason for delay"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Description</Text>
        <TextInput
          style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the delay in detail..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

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

        <Text style={labelStyle}>Linked RFI ID (optional)</Text>
        <TextInput
          style={inputStyle}
          value={linkedRfiId}
          onChangeText={setLinkedRfiId}
          placeholder="RFI ID if related"
          placeholderTextColor={theme.placeholder}
        />

        <Pressable
          className="p-4 rounded-xl items-center mb-8 mt-4"
          style={{
            backgroundColor: loading || !reason.trim() ? '#9ca3af' : COLORS.primary[600],
          }}
          onPress={handleSubmit}
          disabled={loading || !reason.trim()}
        >
          <Text className="text-white font-semibold">
            {loading ? 'Creating...' : 'Create Delay Note'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
