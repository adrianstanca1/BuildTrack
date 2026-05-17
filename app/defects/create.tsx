import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useDefectsStore } from '../../stores/defectsStore';
import { useProjects } from '@/hooks/useProjects';
import { Bug, MapPin } from 'lucide-react-native';

const SEVERITIES = [
  { value: 'cosmetic', label: 'Cosmetic', color: COLORS.dark.success },
  { value: 'minor', label: 'Minor', color: COLORS.dark.warning },
  { value: 'major', label: 'Major', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: COLORS.dark.danger },
] as const;

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

export default function CreateDefectScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [severity, setSeverity] = useState('minor');
  const [status, setStatus] = useState('open');
  const [location, setLocation] = useState('');

  const { createDefect, loading } = useDefectsStore();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data?.data || [];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Defect title is required');
      return;
    }

    try {
      await createDefect({
        title: title.trim(),
        description: description.trim() || '',
        projectId: projectId || undefined,
        projectName: projects.find((p: any) => p.id === projectId)?.name || 'No Project',
        severity: severity as any,
        status: status as any,
        location: location.trim() || '',
        reportedBy: '',
      });
      Alert.alert('Success', 'Defect logged successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to log defect');
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
    fontWeight: '600' as const,
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
            Log Defect
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={labelStyle}>Defect Title *</Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="What is the defect?"
          placeholderTextColor={COLORS.dark.textMuted}
        />

        <Text style={labelStyle}>Description</Text>
        <TextInput
          style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the defect in detail..."
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

        <Text style={labelStyle}>Severity</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
          {SEVERITIES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setSeverity(s.value)}
              style={{
                flex: 1,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                backgroundColor: severity === s.value ? s.color + '30' : COLORS.dark.surface,
                borderWidth: 1,
                borderColor: severity === s.value ? s.color : COLORS.dark.border,
                alignItems: 'center',
              }}
            >
              <Bug size={16} color={severity === s.value ? s.color : COLORS.dark.textMuted} />
              <Text style={{ color: severity === s.value ? s.color : COLORS.dark.textMuted, fontWeight: '600', marginTop: 4 }}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={labelStyle}>Status</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setStatus(s.value)}
              style={{
                flex: 1,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                backgroundColor: status === s.value ? COLORS.dark.primary + '30' : COLORS.dark.surface,
                borderWidth: 1,
                borderColor: status === s.value ? COLORS.dark.primary : COLORS.dark.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: status === s.value ? COLORS.dark.primary : COLORS.dark.textMuted, fontWeight: '600' }}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={labelStyle}>Location</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <MapPin size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={location}
            onChangeText={setLocation}
            placeholder="Where is the defect located?"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Button
          title="Log Defect"
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
