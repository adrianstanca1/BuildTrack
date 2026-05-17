import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useTimesheetsStore } from '../../stores/timesheetsStore';
import { useProjects } from '@/hooks/useProjects';
import { useTeamStore } from '../../stores/teamStore';
import { Clock, Calendar, PoundSterling } from 'lucide-react-native';
import type { TimesheetCategory, TimesheetStatus } from '../../types/field';

const CATEGORIES: { value: TimesheetCategory; label: string; rateMult: number }[] = [
  { value: 'regular', label: 'Regular', rateMult: 1 },
  { value: 'overtime', label: 'Overtime', rateMult: 1.5 },
  { value: 'weekend', label: 'Weekend', rateMult: 1.5 },
  { value: 'holiday', label: 'Holiday', rateMult: 2 },
  { value: 'sick', label: 'Sick', rateMult: 1 },
  { value: 'leave', label: 'Leave', rateMult: 1 },
];

const STATUSES: { value: TimesheetStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paid', label: 'Paid' },
];

const DEFAULT_HOURLY_RATE = 15;
const DEFAULT_OVERTIME_RATE = 22.5;

export default function CreateTimesheetScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const [workerId, setWorkerId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState('8');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [hourlyRate, setHourlyRate] = useState(String(DEFAULT_HOURLY_RATE));
  const [overtimeRate, setOvertimeRate] = useState(String(DEFAULT_OVERTIME_RATE));
  const [workDescription, setWorkDescription] = useState('');
  const [category, setCategory] = useState<TimesheetCategory>('regular');
  const [status, setStatus] = useState<TimesheetStatus>('submitted');
  const [notes, setNotes] = useState('');

  const { createTimesheet, loading } = useTimesheetsStore();
  const { data: projectsData } = useProjects();
  const { workers } = useTeamStore();
  const projects = projectsData?.data?.data || [];

  const selectedWorker = workers.find((w) => w.id === workerId);

  // Live pay calculation
  const liveTotalPay = useMemo(() => {
    const hours = parseFloat(hoursWorked) || 0;
    const ot = parseFloat(overtimeHours) || 0;
    const rate = parseFloat(hourlyRate) || 0;
    const otRate = parseFloat(overtimeRate) || 0;
    const cat = CATEGORIES.find((c) => c.value === category);
    const adjustedRate = rate * (cat?.rateMult || 1);
    return hours * adjustedRate + ot * otRate;
  }, [hoursWorked, overtimeHours, hourlyRate, overtimeRate, category]);

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
    const ot = parseFloat(overtimeHours) || 0;
    if (ot < 0 || ot > 16) {
      Alert.alert('Error', 'Overtime hours must be between 0 and 16');
      return;
    }
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 0) {
      Alert.alert('Error', 'Hourly rate must be a positive number');
      return;
    }

    try {
      const cat = CATEGORIES.find((c) => c.value === category);
      const adjustedRate = rate * (cat?.rateMult || 1);
      const totalPay = hours * adjustedRate + ot * (parseFloat(overtimeRate) || 0);

      await createTimesheet({
        workerId,
        workerName: selectedWorker?.name || 'Unknown',
        workerRole: selectedWorker?.role || undefined,
        projectId: projectId || undefined,
        projectName: projects.find((p: any) => p.id === projectId)?.name || 'No Project',
        date: date.trim(),
        hoursWorked: hours,
        overtimeHours: ot,
        hourlyRate: rate,
        overtimeRate: parseFloat(overtimeRate) || 0,
        workDescription: workDescription.trim() || undefined,
        category,
        status,
        notes: notes.trim() || undefined,
        totalPay,
      });
      Alert.alert('Success', 'Timesheet created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create timesheet');
    }
  };

  const inputStyle = {
    backgroundColor: c.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: c.text,
    fontSize: TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderColor: c.border,
  };

  const labelStyle = {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: '600' as const,
    color: c.textMuted,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  };

  const chipStyle = (selected: boolean, accentColor?: string) => ({
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: selected ? (accentColor || c.primary) + '30' : c.surface,
    borderWidth: 1,
    borderColor: selected ? (accentColor || c.primary) : c.border,
  });

  const chipTextStyle = (selected: boolean, accentColor?: string) => ({
    color: selected ? (accentColor || c.primary) : c.textMuted,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.caption.fontSize,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING['3xl'] }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: c.primary, fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: c.text }}>
            New Timesheet
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Worker */}
        <Text style={labelStyle}>Worker *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {workers.map((w) => (
              <TouchableOpacity key={w.id} onPress={() => setWorkerId(w.id)} style={chipStyle(workerId === w.id)}>
                <Text style={chipTextStyle(workerId === w.id)}>{w.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Project */}
        <Text style={labelStyle}>Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity onPress={() => setProjectId('')} style={chipStyle(projectId === '')}>
              <Text style={chipTextStyle(projectId === '')}>No Project</Text>
            </TouchableOpacity>
            {projects.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setProjectId(p.id)}
                style={chipStyle(projectId === p.id, p.color)}
              >
                <Text style={chipTextStyle(projectId === p.id, p.color)}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Date */}
        <Text style={labelStyle}>Date *</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Calendar size={16} color={c.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: c.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={c.textMuted}
          />
        </View>

        {/* Hours */}
        <Text style={labelStyle}>Hours Worked *</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Clock size={16} color={c.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: c.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={hoursWorked}
            onChangeText={setHoursWorked}
            placeholder="0"
            placeholderTextColor={c.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Overtime */}
        <Text style={labelStyle}>Overtime Hours</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Clock size={16} color={c.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: c.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={overtimeHours}
            onChangeText={setOvertimeHours}
            placeholder="0"
            placeholderTextColor={c.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Rates */}
        <View style={{ flexDirection: 'row', gap: SPACING.md }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Hourly Rate (£)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
              <PoundSterling size={16} color={c.textMuted} style={{ marginRight: SPACING.sm }} />
              <TextInput
                style={{ flex: 1, color: c.text, fontSize: TYPOGRAPHY.body.fontSize }}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="0.00"
                placeholderTextColor={c.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Overtime Rate (£)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
              <PoundSterling size={16} color={c.textMuted} style={{ marginRight: SPACING.sm }} />
              <TextInput
                style={{ flex: 1, color: c.text, fontSize: TYPOGRAPHY.body.fontSize }}
                value={overtimeRate}
                onChangeText={setOvertimeRate}
                placeholder="0.00"
                placeholderTextColor={c.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Category */}
        <Text style={labelStyle}>Category</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md }}>
          {CATEGORIES.map((cItem) => (
            <TouchableOpacity
              key={cItem.value}
              onPress={() => {
                setCategory(cItem.value);
                // Auto-adjust base rate based on multiplier
                const base = parseFloat(hourlyRate) || DEFAULT_HOURLY_RATE;
                const adjusted = DEFAULT_HOURLY_RATE * cItem.rateMult;
                if (cItem.value !== 'regular') {
                  setHourlyRate(String(adjusted));
                } else {
                  setHourlyRate(String(DEFAULT_HOURLY_RATE));
                }
              }}
              style={chipStyle(category === cItem.value)}
            >
              <Text style={chipTextStyle(category === cItem.value)}>
                {cItem.label}
                {cItem.rateMult !== 1 && ` (${cItem.rateMult}x)`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status */}
        <Text style={labelStyle}>Status</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setStatus(s.value)}
              style={chipStyle(status === s.value)}
            >
              <Text style={chipTextStyle(status === s.value)}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Work Description */}
        <Text style={labelStyle}>Work Description</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={workDescription}
          onChangeText={setWorkDescription}
          placeholder="Describe the work performed..."
          placeholderTextColor={c.textMuted}
          multiline
        />

        {/* Notes */}
        <Text style={labelStyle}>Notes</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          placeholderTextColor={c.textMuted}
          multiline
        />

        {/* Live Pay Preview */}
        <View
          style={{
            marginTop: SPACING.lg,
            padding: SPACING.lg,
            borderRadius: RADIUS.lg,
            backgroundColor: isDark ? COLORS.primary[900] + '40' : COLORS.primary[50],
            borderWidth: 1,
            borderColor: isDark ? COLORS.primary[700] : COLORS.primary[200],
          }}
        >
          <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: isDark ? COLORS.primary[300] : COLORS.primary[700], fontWeight: '600', marginBottom: SPACING.xs }}>
            Estimated Total Pay
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.h1.fontSize, fontWeight: '700', color: isDark ? COLORS.primary[400] : COLORS.primary[700] }}>
            £{liveTotalPay.toFixed(2)}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: isDark ? COLORS.primary[400] : COLORS.primary[600], marginTop: SPACING.xs }}>
            {(parseFloat(hoursWorked) || 0) + (parseFloat(overtimeHours) || 0)} total hours
            {parseFloat(overtimeHours) > 0 && ` incl. ${parseFloat(overtimeHours)}h overtime`}
          </Text>
        </View>

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
