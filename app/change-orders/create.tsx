import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useChangeOrdersStore } from '../../stores/changeOrdersStore';
import { useProjects } from '@/hooks/useProjects';

const TYPES = ['scope', 'price', 'time', 'design', 'other'] as const;
const STATUSES = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'] as const;

export default function CreateChangeOrderScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [coNumber, setCoNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<string>('scope');
  const [status, setStatus] = useState<string>('draft');
  const [projectId, setProjectId] = useState('');
  const [originalCost, setOriginalCost] = useState('');
  const [proposedCost, setProposedCost] = useState('');
  const [originalDays, setOriginalDays] = useState('');
  const [proposedDays, setProposedDays] = useState('');
  const [notes, setNotes] = useState('');

  const { createChangeOrder, loading } = useChangeOrdersStore();
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
    if (!coNumber.trim()) {
      Alert.alert('Error', 'Change order number is required');
      return;
    }

    const project = projects.find((p: any) => p.id === projectId);

    try {
      await createChangeOrder({
        coNumber: coNumber.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        reason: reason.trim() || undefined,
        type: type as any,
        status: status as any,
        projectId: projectId || undefined,
        projectName: project?.name || 'No Project',
        originalCost: parseFloat(originalCost) || 0,
        proposedCost: parseFloat(proposedCost) || 0,
        originalScheduleDays: parseInt(originalDays) || 0,
        proposedScheduleDays: parseInt(proposedDays) || 0,
        impactCost: (parseFloat(proposedCost) || 0) - (parseFloat(originalCost) || 0),
        impactDays: (parseInt(proposedDays) || 0) - (parseInt(originalDays) || 0),
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Change order created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create change order');
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
          <Text className="text-xl font-bold ml-4" style={{ color: theme.text }}>New Change Order</Text>
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

        <Text style={labelStyle}>CO Number *</Text>
        <TextInput
          style={inputStyle}
          value={coNumber}
          onChangeText={setCoNumber}
          placeholder="e.g. CO-001"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Title *</Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="Change order title"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Description</Text>
        <TextInput
          style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the change..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Text style={labelStyle}>Reason</Text>
        <TextInput
          style={inputStyle}
          value={reason}
          onChangeText={setReason}
          placeholder="Why is this change needed?"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Type</Text>
        <View className="flex-row flex-wrap">
          {TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              className="mr-2 mb-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: type === t ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
              }}
            >
              <Text className="text-sm capitalize" style={{ color: type === t ? '#fff' : theme.textSecondary }}>
                {t}
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
                {s.replace(/_/g, ' ')}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text style={labelStyle}>Original Cost (£)</Text>
            <TextInput
              style={inputStyle}
              value={originalCost}
              onChangeText={setOriginalCost}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          <View className="flex-1">
            <Text style={labelStyle}>Proposed Cost (£)</Text>
            <TextInput
              style={inputStyle}
              value={proposedCost}
              onChangeText={setProposedCost}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text style={labelStyle}>Original Days</Text>
            <TextInput
              style={inputStyle}
              value={originalDays}
              onChangeText={setOriginalDays}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          <View className="flex-1">
            <Text style={labelStyle}>Proposed Days</Text>
            <TextInput
              style={inputStyle}
              value={proposedDays}
              onChangeText={setProposedDays}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        <Text style={labelStyle}>Notes</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Pressable
          className="p-4 rounded-xl items-center mb-8 mt-4"
          style={{
            backgroundColor: loading || !title.trim() || !coNumber.trim() ? '#9ca3af' : COLORS.primary[600],
          }}
          onPress={handleSubmit}
          disabled={loading || !title.trim() || !coNumber.trim()}
        >
          <Text className="text-white font-semibold">
            {loading ? 'Creating...' : 'Create Change Order'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
