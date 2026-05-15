import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useDailyReportsStore } from '../../stores/dailyReportsStore';
import { useProjects } from '@/hooks/useProjects';

const STATUSES = ['draft', 'submitted', 'approved'] as const;
const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Foggy', 'Snow'];

export default function CreateDailyReportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  const [workersOnSite, setWorkersOnSite] = useState('');
  const [workCompleted, setWorkCompleted] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('');
  const [issuesDelays, setIssuesDelays] = useState('');
  const [safetyObservations, setSafetyObservations] = useState('');
  const [nextDayPlan, setNextDayPlan] = useState('');
  const [status, setStatus] = useState<string>('draft');
  const [projectId, setProjectId] = useState('');

  const { createReport, loading } = useDailyReportsStore();
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const projects = projectsData?.data?.data || [];

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = async () => {
    if (!reportDate.trim()) {
      Alert.alert('Error', 'Report date is required');
      return;
    }

    const project = projects.find((p: any) => p.id === projectId);

    try {
      await createReport({
        reportDate: reportDate.trim(),
        weather: weather.trim() || undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        workersOnSite: parseInt(workersOnSite) || 0,
        workCompleted: workCompleted.trim() || undefined,
        materialsUsed: materialsUsed.trim() || undefined,
        equipmentUsed: equipmentUsed.trim() || undefined,
        issuesDelays: issuesDelays.trim() || undefined,
        safetyObservations: safetyObservations.trim() || undefined,
        nextDayPlan: nextDayPlan.trim() || undefined,
        status: status as any,
        projectId: projectId || undefined,
        projectName: project?.name || 'No Project',
        submittedBy: '',
      });
      Alert.alert('Success', 'Daily report created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create daily report');
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
          <Text className="text-xl font-bold ml-4" style={{ color: theme.text }}>New Daily Report</Text>
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

        <Text style={labelStyle}>Report Date *</Text>
        <TextInput
          style={inputStyle}
          value={reportDate}
          onChangeText={setReportDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Weather</Text>
        <View className="flex-row flex-wrap">
          {WEATHER_OPTIONS.map((w) => (
            <Pressable
              key={w}
              onPress={() => setWeather(w)}
              className="mr-2 mb-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: weather === w ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
              }}
            >
              <Text className="text-sm" style={{ color: weather === w ? '#fff' : theme.textSecondary }}>
                {w}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text style={labelStyle}>Temperature (°C)</Text>
            <TextInput
              style={inputStyle}
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          <View className="flex-1">
            <Text style={labelStyle}>Workers on Site</Text>
            <TextInput
              style={inputStyle}
              value={workersOnSite}
              onChangeText={setWorkersOnSite}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.placeholder}
            />
          </View>
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

        <Text style={labelStyle}>Work Completed</Text>
        <TextInput
          style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={workCompleted}
          onChangeText={setWorkCompleted}
          placeholder="Describe work completed today..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Text style={labelStyle}>Materials Used</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={materialsUsed}
          onChangeText={setMaterialsUsed}
          placeholder="List materials used..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Text style={labelStyle}>Equipment Used</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={equipmentUsed}
          onChangeText={setEquipmentUsed}
          placeholder="List equipment used..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Text style={labelStyle}>Issues / Delays</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={issuesDelays}
          onChangeText={setIssuesDelays}
          placeholder="Any issues or delays?"
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Text style={labelStyle}>Safety Observations</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={safetyObservations}
          onChangeText={setSafetyObservations}
          placeholder="Safety notes..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Text style={labelStyle}>Next Day Plan</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={nextDayPlan}
          onChangeText={setNextDayPlan}
          placeholder="Plan for tomorrow..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Pressable
          className="p-4 rounded-xl items-center mb-8 mt-4"
          style={{
            backgroundColor: loading || !reportDate.trim() ? '#9ca3af' : COLORS.primary[600],
          }}
          onPress={handleSubmit}
          disabled={loading || !reportDate.trim()}
        >
          <Text className="text-white font-semibold">
            {loading ? 'Creating...' : 'Create Daily Report'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
