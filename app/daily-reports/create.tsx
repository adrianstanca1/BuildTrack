import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyReportsStore } from '../../stores/dailyReportsStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function CreateDailyReportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createReport } = useDailyReportsStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    reportDate: new Date().toISOString().split('T')[0],
    weather: '',
    temperature: '',
    workersOnSite: '',
    workCompleted: '',
    materialsUsed: '',
    equipmentUsed: '',
    issuesDelays: '',
    safetyObservations: '',
    nextDayPlan: '',
    submittedBy: '',
    status: 'draft' as 'draft' | 'submitted' | 'approved',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.projectId || !form.reportDate || !form.submittedBy) {
      Alert.alert('Error', 'Project, report date, and submitted by are required');
      return;
    }

    setLoading(true);
    try {
      const report = await createReport({
        projectId: form.projectId,
        projectName: 'Unknown',
        reportDate: form.reportDate,
        weather: form.weather || undefined,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        workersOnSite: form.workersOnSite ? Number(form.workersOnSite) : 0,
        workCompleted: form.workCompleted || undefined,
        materialsUsed: form.materialsUsed || undefined,
        equipmentUsed: form.equipmentUsed || undefined,
        issuesDelays: form.issuesDelays || undefined,
        safetyObservations: form.safetyObservations || undefined,
        nextDayPlan: form.nextDayPlan || undefined,
        submittedBy: form.submittedBy,
        status: form.status,
      });

      if (report) {
        Alert.alert('Success', 'Daily report created');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create daily report');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    color: isDark ? COLORS.dark.text : COLORS.light.text,
    backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
    marginBottom: SPACING.sm,
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: '500' as const,
    color: isDark ? COLORS.dark.text : COLORS.light.text,
    marginBottom: 4,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }}>
        {/* Header */}
        <View style={{ padding: SPACING.md, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: SPACING.sm }}>
            <Ionicons name="arrow-back" size={24} color={isDark ? COLORS.dark.text : COLORS.light.text} />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>
            New Daily Report
          </Text>
        </View>

        <ScrollView style={{ padding: SPACING.md }}>
          <Card style={{ backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface }}>
            {/* Project ID */}
            <Text style={labelStyle}>Project ID *</Text>
            <TextInput style={inputStyle} value={form.projectId} onChangeText={(v) => updateField('projectId', v)} placeholder="Enter project ID" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Report Date */}
            <Text style={labelStyle}>Report Date *</Text>
            <TextInput style={inputStyle} value={form.reportDate} onChangeText={(v) => updateField('reportDate', v)} placeholder="YYYY-MM-DD" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Weather & Temp */}
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Weather</Text>
                <TextInput style={inputStyle} value={form.weather} onChangeText={(v) => updateField('weather', v)} placeholder="e.g. Sunny" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Temp (°C)</Text>
                <TextInput style={inputStyle} value={form.temperature} onChangeText={(v) => updateField('temperature', v)} placeholder="22" keyboardType="numeric" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
              </View>
            </View>

            {/* Workers */}
            <Text style={labelStyle}>Workers on Site</Text>
            <TextInput style={inputStyle} value={form.workersOnSite} onChangeText={(v) => updateField('workersOnSite', v)} placeholder="0" keyboardType="numeric" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Work Completed */}
            <Text style={labelStyle}>Work Completed</Text>
            <TextInput style={[inputStyle, { height: 80, textAlignVertical: 'top' }]} value={form.workCompleted} onChangeText={(v) => updateField('workCompleted', v)} placeholder="Describe work completed..." multiline placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Materials */}
            <Text style={labelStyle}>Materials Used</Text>
            <TextInput style={[inputStyle, { height: 60, textAlignVertical: 'top' }]} value={form.materialsUsed} onChangeText={(v) => updateField('materialsUsed', v)} placeholder="List materials used..." multiline placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Equipment */}
            <Text style={labelStyle}>Equipment Used</Text>
            <TextInput style={[inputStyle, { height: 60, textAlignVertical: 'top' }]} value={form.equipmentUsed} onChangeText={(v) => updateField('equipmentUsed', v)} placeholder="List equipment used..." multiline placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Issues */}
            <Text style={labelStyle}>Issues / Delays</Text>
            <TextInput style={[inputStyle, { height: 60, textAlignVertical: 'top' }]} value={form.issuesDelays} onChangeText={(v) => updateField('issuesDelays', v)} placeholder="Any issues or delays..." multiline placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Safety */}
            <Text style={labelStyle}>Safety Observations</Text>
            <TextInput style={[inputStyle, { height: 60, textAlignVertical: 'top' }]} value={form.safetyObservations} onChangeText={(v) => updateField('safetyObservations', v)} placeholder="Safety observations..." multiline placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Next Day Plan */}
            <Text style={labelStyle}>Next Day Plan</Text>
            <TextInput style={[inputStyle, { height: 60, textAlignVertical: 'top' }]} value={form.nextDayPlan} onChangeText={(v) => updateField('nextDayPlan', v)} placeholder="Plan for next day..." multiline placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

            {/* Submitted By & Status */}
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Submitted By *</Text>
                <TextInput style={inputStyle} value={form.submittedBy} onChangeText={(v) => updateField('submittedBy', v)} placeholder="Your name" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Status</Text>
                <TextInput style={inputStyle} value={form.status} editable={false} />
              </View>
            </View>
          </Card>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: COLORS.primary[500],
              padding: SPACING.md,
              borderRadius: RADIUS.md,
              alignItems: 'center',
              marginTop: SPACING.md,
              marginBottom: SPACING.xl,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              {loading ? 'Creating...' : 'Create Report'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
