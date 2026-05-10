import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useProjectsStore } from '@/stores/projectsStore';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/api';

const SEVERITIES = [
  { value: 'cosmetic' as const, label: 'Cosmetic', color: '#22c55e' },
  { value: 'minor' as const, label: 'Minor', color: '#f59e0b' },
  { value: 'major' as const, label: 'Major', color: '#f97316' },
  { value: 'critical' as const, label: 'Critical', color: '#ef4444' },
];

export default function PunchItemScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { projects } = useProjectsStore();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<string>('minor');
  const [projectId, setProjectId] = useState<string>('');
  const [assignee, setAssignee] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a punch item title');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.createPunchItem({
        projectId: projectId || undefined,
        title: title.trim(),
        location: location.trim() || undefined,
        severity: severity as any,
        assignee: assignee.trim() || undefined,
        photoUrls: photoUri ? [photoUri] : undefined,
      });
      Alert.alert('Saved', 'Punch item logged', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save punch item');
    } finally {
      setSubmitting(false);
    }
  }, [title, location, severity, projectId, assignee, photoUri, router]);

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
        <Text className="text-white text-lg font-bold flex-1 text-center mr-11">Punch Item</Text>
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

        {/* Project picker */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setProjectId('')}
              className={`px-4 py-2 rounded-xl border ${projectId === '' ? 'border-[#3b82f6] bg-[#3b82f6]/10' : 'border-[#334155] bg-[#1e293b]'}`}
            >
              <Text className={projectId === '' ? 'text-[#3b82f6] font-semibold' : 'text-[#64748b]'}>None</Text>
            </Pressable>
            {projects.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setProjectId(p.id)}
                className={`px-4 py-2 rounded-xl border ${projectId === p.id ? 'border-[#3b82f6] bg-[#3b82f6]/10' : 'border-[#334155] bg-[#1e293b]'}`}
              >
                <Text className={projectId === p.id ? 'text-[#3b82f6] font-semibold' : 'text-[#64748b]'} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Title */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Title *</Text>
        <TextInput
          style={inputBase}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs fixing?"
          placeholderTextColor={COLORS.dark.textMuted}
          autoFocus
        />

        {/* Location */}
        <Text className="text-[#94a3b8] text-xs font-semibold mt-4 mb-2 uppercase tracking-wide">Location</Text>
        <View className="flex-row items-center" style={[inputBase, { padding: 0 }]}>
          <Ionicons name="location-outline" size={16} color={COLORS.dark.textMuted} style={{ marginLeft: SPACING.md, marginRight: SPACING.sm }} />
          <TextInput
            className="flex-1 text-white py-3 pr-3"
            style={{ fontSize: TYPOGRAPHY.body.fontSize }}
            value={location}
            onChangeText={setLocation}
            placeholder="Where on site?"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        {/* Severity */}
        <Text className="text-[#94a3b8] text-xs font-semibold mt-4 mb-2 uppercase tracking-wide">Severity</Text>
        <View className="flex-row gap-2 mb-2">
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

        {/* Assignee */}
        <Text className="text-[#94a3b8] text-xs font-semibold mt-4 mb-2 uppercase tracking-wide">Assignee</Text>
        <View className="flex-row items-center" style={[inputBase, { padding: 0 }]}>
          <Ionicons name="person-outline" size={16} color={COLORS.dark.textMuted} style={{ marginLeft: SPACING.md, marginRight: SPACING.sm }} />
          <TextInput
            className="flex-1 text-white py-3 pr-3"
            style={{ fontSize: TYPOGRAPHY.body.fontSize }}
            value={assignee}
            onChangeText={setAssignee}
            placeholder="Who should fix this?"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

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
          title="Log Punch Item"
          onPress={handleSubmit}
          loading={submitting}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
          iconLeft="add-circle"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
