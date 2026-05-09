import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useCreateProject } from '@/hooks/useProjects';
import { Calendar, MapPin, DollarSign, FileText, Tag } from 'lucide-react-native';

const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', color: COLORS.dark.warning },
  { value: 'active', label: 'Active', color: COLORS.dark.success },
  { value: 'on-hold', label: 'On Hold', color: COLORS.dark.warning },
  { value: 'completed', label: 'Completed', color: COLORS.dark.info },
  { value: 'cancelled', label: 'Cancelled', color: COLORS.dark.danger },
];

const PROJECT_COLORS = [
  '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4b5563',
];

export default function CreateProjectScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('planning');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const createProject = useCreateProject();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    try {
      await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        status,
        color,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      Alert.alert('Success', 'Project created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create project');
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
            New Project
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={labelStyle}>Project Name *</Text>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder="Enter project name"
          placeholderTextColor={COLORS.dark.textMuted}
        />

        <Text style={labelStyle}>Description</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the project"
          placeholderTextColor={COLORS.dark.textMuted}
          multiline
        />

        <Text style={labelStyle}>Location</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <MapPin size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={location}
            onChangeText={setLocation}
            placeholder="Project location"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Text style={labelStyle}>Budget</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <DollarSign size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={budget}
            onChangeText={setBudget}
            placeholder="0.00"
            placeholderTextColor={COLORS.dark.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={labelStyle}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {PROJECT_STATUSES.map((s) => (
              <TouchableOpacity
                key={s.value}
                onPress={() => setStatus(s.value)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  borderRadius: RADIUS.md,
                  backgroundColor: status === s.value ? s.color + '30' : COLORS.dark.surface,
                  borderWidth: 1,
                  borderColor: status === s.value ? s.color : COLORS.dark.border,
                }}
              >
                <Text style={{ color: status === s.value ? s.color : COLORS.dark.textMuted, fontWeight: '600' }}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={labelStyle}>Color</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md }}>
          {PROJECT_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.md,
                backgroundColor: c,
                borderWidth: color === c ? 3 : 0,
                borderColor: COLORS.dark.text,
              }}
            />
          ))}
        </View>

        <Button
          title="Create Project"
          onPress={handleSubmit}
          loading={createProject.isPending}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
