import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useCreateIncident } from '@/hooks/useSafety';
import { useProjects } from '@/hooks/useProjects';
import { AlertTriangle, MapPin, Calendar, User, FileText } from 'lucide-react-native';

const SEVERITIES = [
  { value: 'low', label: 'Low', color: COLORS.dark.success },
  { value: 'medium', label: 'Medium', color: COLORS.dark.warning },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: COLORS.dark.danger },
];

export default function ReportIncidentScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [location, setLocation] = useState('');
  const [injuries, setInjuries] = useState('0');

  const createIncident = useCreateIncident();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data?.data || [];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Incident title is required');
      return;
    }

    try {
      await createIncident.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        severity,
        location: location.trim() || undefined,
        injuries: parseInt(injuries) || 0,
      });
      Alert.alert('Success', 'Incident reported successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to report incident');
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
            Report Incident
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={labelStyle}>Incident Title *</Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="What happened?"
          placeholderTextColor={COLORS.dark.textMuted}
        />

        <Text style={labelStyle}>Description</Text>
        <TextInput
          style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the incident in detail..."
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
              <AlertTriangle size={16} color={severity === s.value ? s.color : COLORS.dark.textMuted} />
              <Text style={{ color: severity === s.value ? s.color : COLORS.dark.textMuted, fontWeight: '600', marginTop: 4 }}>
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
            placeholder="Where did it happen?"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Text style={labelStyle}>Injuries</Text>
        <TextInput
          style={inputStyle}
          value={injuries}
          onChangeText={setInjuries}
          placeholder="0"
          placeholderTextColor={COLORS.dark.textMuted}
          keyboardType="number-pad"
        />

        <Button
          title="Report Incident"
          onPress={handleSubmit}
          loading={createIncident.isPending}
          variant="danger"
          style={{ marginTop: SPACING.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
