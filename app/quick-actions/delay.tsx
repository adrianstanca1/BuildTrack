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

const REASONS = [
  'Weather',
  'Material Shortage',
  'Subcontractor Delay',
  'Permit Issue',
  'Design Change',
  'Equipment Failure',
  'Labour Shortage',
  'Other',
];

export default function DelayNoteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { projects } = useProjectsStore();

  const [projectId, setProjectId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [linkedRFI, setLinkedRFI] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const now = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleSubmit = useCallback(async () => {
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      Alert.alert('Required', 'Please select or enter a delay reason');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.createDelayNote({
        projectId: projectId || undefined,
        reason: finalReason,
        description: description.trim() || undefined,
        linkedRfiId: linkedRFI.trim() || undefined,
      });
      Alert.alert('Saved', 'Delay note recorded', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save delay note');
    } finally {
      setSubmitting(false);
    }
  }, [reason, customReason, projectId, description, linkedRFI, router]);

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
        <Text className="text-white text-lg font-bold flex-1 text-center mr-11">Delay Note</Text>
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
              className={`px-4 py-2 rounded-xl border ${projectId === '' ? 'border-[#ef4444] bg-[#ef4444]/10' : 'border-[#334155] bg-[#1e293b]'}`}
            >
              <Text className={projectId === '' ? 'text-[#ef4444] font-semibold' : 'text-[#64748b]'}>None</Text>
            </Pressable>
            {projects.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setProjectId(p.id)}
                className={`px-4 py-2 rounded-xl border ${projectId === p.id ? 'border-[#ef4444] bg-[#ef4444]/10' : 'border-[#334155] bg-[#1e293b]'}`}
              >
                <Text className={projectId === p.id ? 'text-[#ef4444] font-semibold' : 'text-[#64748b]'} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Reason */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Delay Reason</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {REASONS.map((r) => (
            <Pressable
              key={r}
              onPress={() => setReason(r)}
              className={`px-3 py-2 rounded-xl border ${reason === r ? 'border-[#ef4444] bg-[#ef4444]/10' : 'border-[#334155] bg-[#1e293b]'}`}
            >
              <Text className={`text-sm font-semibold ${reason === r ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>{r}</Text>
            </Pressable>
          ))}
        </View>

        {reason === 'Other' && (
          <TextInput
            style={[inputBase, { marginBottom: SPACING.md }]}
            value={customReason}
            onChangeText={setCustomReason}
            placeholder="Describe the delay reason..."
            placeholderTextColor={COLORS.dark.textMuted}
            autoFocus
          />
        )}

        {/* Description */}
        <Text className="text-[#94a3b8] text-xs font-semibold mt-2 mb-2 uppercase tracking-wide">Details</Text>
        <TextInput
          style={[inputBase, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Any additional details..."
          placeholderTextColor={COLORS.dark.textMuted}
          multiline
        />

        {/* Linked RFI */}
        <Text className="text-[#94a3b8] text-xs font-semibold mt-4 mb-2 uppercase tracking-wide">Link to RFI (optional)</Text>
        <View className="flex-row items-center" style={[inputBase, { padding: 0 }]}>
          <Ionicons name="link-outline" size={16} color={COLORS.dark.textMuted} style={{ marginLeft: SPACING.md, marginRight: SPACING.sm }} />
          <TextInput
            className="flex-1 text-white py-3 pr-3"
            style={{ fontSize: TYPOGRAPHY.body.fontSize }}
            value={linkedRFI}
            onChangeText={setLinkedRFI}
            placeholder="RFI number or title"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Button
          title="Record Delay"
          onPress={handleSubmit}
          loading={submitting}
          variant="danger"
          style={{ marginTop: SPACING.lg }}
          iconLeft="time"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
