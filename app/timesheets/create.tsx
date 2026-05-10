import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useTimesheetsStore } from '../../stores/timesheetsStore';
import { useProjects } from '@/hooks/useProjects';
import { useTeamStore } from '../../stores/teamStore';
import { Clock, Calendar, User, Briefcase } from 'lucide-react-native';

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export default function CreateTimesheetScreen() {
  const [workerId, setWorkerId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState('8');
  const [overtime, setOvertime] = useState('0');
  const [status, setStatus] = useState('draft');
  const [notes, setNotes] = useState('');

  const { createTimesheet, loading } = useTimesheetsStore();
  const { data: projectsData } = useProjects();
  const { workers } = useTeamStore();
  const projects = projectsData?.data?.data || [];

  const selectedWorker = workers.find((w) => w.id === workerId);

  const handleSubmit = async () => {
    if (!workerId) {
      Alert.alert('Error', 'Please select a worker');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Error', 'Date is required');
      return;
    }
    const hours = parseFloat(hoursWorked);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      Alert.alert('Error', 'Hours worked must be between 0 and 24');
      return;
    }

    try {
      await createTimesheet({
        workerId,
        workerName: selectedWorker?.name || 'Unknown',
        projectId: projectId || undefined,
        projectName: projects.find((p: any) => p.id === projectId)?.name || 'No Project',
        date: date.trim(),
        hoursWorked: hours,
        overtimeHours: parseFloat(overtime) || 0,
        hourlyRate: 0,
        overtimeRate: 0,
        category: 'regular',
        status: status as any,
        notes: notes.trim() || undefined,
        totalPay: 0,
      });
      Alert.alert('Success', 'Timesheet created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create timesheet');
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
            New Timesheet
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={labelStyle}>Worker *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {workers.map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => setWorkerId(w.id)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  borderRadius: RADIUS.md,
                  backgroundColor: workerId === w.id ? COLORS.dark.primary + '30' : COLORS.dark.surface,
                  borderWidth: 1,
                  borderColor: workerId === w.id ? COLORS.dark.primary : COLORS.dark.border,
                }}
              >
                <Text style={{ color: workerId === w.id ? COLORS.dark.primary : COLORS.dark.textMuted, fontWeight: '600' }}>
                  {w.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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

        <Text style={labelStyle}>Date *</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Calendar size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Text style={labelStyle}>Hours Worked *</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Clock size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={hoursWorked}
            onChangeText={setHoursWorked}
            placeholder="0"
            placeholderTextColor={COLORS.dark.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={labelStyle}>Overtime</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Clock size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={overtime}
            onChangeText={setOvertime}
            placeholder="0"
            placeholderTextColor={COLORS.dark.textMuted}
            keyboardType="decimal-pad"
          />
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

        <Text style={labelStyle}>Notes</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          placeholderTextColor={COLORS.dark.textMuted}
          multiline
        />

        <Button
          title="Create Timesheet"
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
