import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useProjectsStore } from '@/stores/projectsStore';
import { useAuth } from '@/contexts/AuthContext';
import { useSafetyStore } from '@/stores/safetyStore';

const SEVERITIES = [
  { value: 'low' as const, label: 'Low', color: '#22c55e' },
  { value: 'medium' as const, label: 'Medium', color: '#eab308' },
  { value: 'high' as const, label: 'High', color: '#f97316' },
  { value: 'critical' as const, label: 'Critical', color: '#ef4444' },
];

const OBSERVATION_TYPES = ['Hazard', 'Near Miss', 'Good Practice', 'PPE Issue', 'Housekeeping'];

export default function SafetyObservationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { projects } = useProjectsStore();
  const { addIncident } = useSafetyStore();

  const [projectId, setProjectId] = useState<string>('');
  const [severity, setSeverity] = useState<string>('medium');
  const [obsType, setObsType] = useState<string>('Hazard');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe the observation');
      return;
    }
    setSubmitting(true);
    try {
      await addIncident({
        title: `${obsType}: ${description.slice(0, 60)}`,
        description: description.trim(),
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        projectId: projectId || undefined,
        projectName: projects.find((p) => p.id === projectId)?.name || 'No Project',
        date: new Date().toISOString(),
        injuries: 0,
        witnesses: [],
        reportedBy: user?.email || 'Unknown',
      });
      Alert.alert('Saved', 'Safety observation logged', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to log observation');
    } finally {
      setSubmitting(false);
    }
  }, [description, severity, obsType, projectId, projects, user, addIncident, router]);

  const inputBase = {
    backgroundColor: COLORS.dark.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.dark.text,
    fontSize: TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      <View className="px-4 pt-2 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="close-outline" size={28} color={COLORS.dark.textMuted} />
        </Pressable>
        <Text className="text-white text-lg font-bold flex-1 text-center mr-11">Safety Observation</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}>
        {/* Meta */}
        <View className="mb-4 flex-row items-center">
          <Ionicons name="time-outline" size={14} color={COLORS.dark.textMuted} />
          <Text className="text-[#64748b] text-xs ml-1.5">{now}</Text>
          <Text className="text-[#64748b] text-xs mx-2">·</Text>
          <Ionicons name="person-outline" size={14} color={COLORS.dark.textMuted} />
          <Text className="text-[#64748b] text-xs ml-1.5">
            {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
          </Text>
        </View>

        {/* Project */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setProjectId('')}
              className={`px-4 py-2 rounded-xl border ${projectId === '' ? 'border-[#eab308] bg-[#eab308]/10' : 'border-[#334155] bg-[#1e293b]'}`}
            >
              <Text className={projectId === '' ? 'text-[#eab308] font-semibold' : 'text-[#64748b]'}>None</Text>
            </Pressable>
            {projects.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setProjectId(p.id)}
                className={`px-4 py-2 rounded-xl border ${projectId === p.id ? 'border-[#eab308] bg-[#eab308]/10' : 'border-[#334155] bg-[#1e293b]'}`}
              >
                <Text className={projectId === p.id ? 'text-[#eab308] font-semibold' : 'text-[#64748b]'} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Observation type */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {OBSERVATION_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setObsType(t)}
              className={`px-3 py-2 rounded-xl border ${obsType === t ? 'border-[#eab308] bg-[#eab308]/10' : 'border-[#334155] bg-[#1e293b]'}`}
            >
              <Text className={`text-sm font-semibold ${obsType === t ? 'text-[#eab308]' : 'text-[#64748b]'}`}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* Severity */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Severity</Text>
        <View className="flex-row gap-2 mb-4">
          {SEVERITIES.map((s) => (
            <Pressable
              key={s.value}
              onPress={() => setSeverity(s.value)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${severity === s.value ? 'bg-opacity-10' : 'bg-[#1e293b] border-[#334155]'}`}
              style={severity === s.value ? { backgroundColor: s.color + '18', borderColor: s.color } : undefined}
            >
              <Text className="text-xs font-semibold" style={{ color: severity === s.value ? s.color : COLORS.dark.textMuted }}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Description */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Description *</Text>
        <TextInput
          style={[inputBase, { height: 120, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what you observed..."
          placeholderTextColor={COLORS.dark.textMuted}
          multiline
          autoFocus
        />

        {/* Photo */}
        <Text className="text-[#94a3b8] text-xs font-semibold mt-4 mb-2 uppercase tracking-wide">Photo</Text>
        <Pressable
          onPress={() => setPhotoUri(photoUri ? null : 'placeholder')}
          className="bg-[#1e293b] border border-dashed border-[#334155] rounded-xl p-6 items-center justify-center"
        >
          {photoUri ? (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text className="text-[#22c55e] ml-2 text-sm font-semibold">Photo attached</Text>
            </View>
          ) : (
            <>
              <Ionicons name="camera-outline" size={28} color={COLORS.dark.textMuted} />
              <Text className="text-[#64748b] text-sm mt-2">Tap to add photo</Text>
            </>
          )}
        </Pressable>

        <Button
          title="Log Observation"
          onPress={handleSubmit}
          loading={submitting}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
          iconLeft="warning"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
