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

const URGENCIES = [
  { value: 'low' as const, label: 'Low', color: '#22c55e' },
  { value: 'medium' as const, label: 'Medium', color: '#f59e0b' },
  { value: 'high' as const, label: 'High', color: '#f97316' },
  { value: 'critical' as const, label: 'Critical', color: '#ef4444' },
];

export default function QuickRFIScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { projects } = useProjectsStore();

  const [projectId, setProjectId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [urgency, setUrgency] = useState<string>('medium');
  const [discipline, setDiscipline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const now = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleSubmit = useCallback(async () => {
    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter a subject');
      return;
    }
    if (!question.trim()) {
      Alert.alert('Required', 'Please enter your question');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.createRFI({
        projectId: projectId || undefined,
        subject: subject.trim(),
        question: question.trim(),
        priority: urgency,
        discipline: discipline.trim() || undefined,
      });
      Alert.alert('Saved', 'RFI submitted', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit RFI');
    } finally {
      setSubmitting(false);
    }
  }, [subject, question, projectId, urgency, discipline, router]);

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
        <Text className="text-white text-lg font-bold flex-1 text-center mr-11">RFI</Text>
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

        {/* Subject */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Subject *</Text>
        <TextInput
          style={inputBase}
          value={subject}
          onChangeText={setSubject}
          placeholder="What is this RFI about?"
          placeholderTextColor={COLORS.dark.textMuted}
          autoFocus
        />

        {/* Discipline */}
        <Text className="text-[#94a3b8] text-xs font-semibold mt-4 mb-2 uppercase tracking-wide">Discipline</Text>
        <View className="flex-row items-center" style={[inputBase, { padding: 0 }]}>
          <Ionicons name="briefcase-outline" size={16} color={COLORS.dark.textMuted} style={{ marginLeft: SPACING.md, marginRight: SPACING.sm }} />
          <TextInput
            className="flex-1 text-white py-3 pr-3"
            style={{ fontSize: TYPOGRAPHY.body.fontSize }}
            value={discipline}
            onChangeText={setDiscipline}
            placeholder="e.g. Structural, MEP, Architecture"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        {/* Urgency */}
        <Text className="text-[#94a3b8] text-xs font-semibold mt-4 mb-2 uppercase tracking-wide">Urgency</Text>
        <View className="flex-row gap-2 mb-4">
          {URGENCIES.map((u) => (
            <Pressable
              key={u.value}
              onPress={() => setUrgency(u.value)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${urgency === u.value ? 'bg-opacity-10' : 'bg-[#1e293b] border-[#334155]'}`}
              style={urgency === u.value ? { backgroundColor: u.color + '18', borderColor: u.color } : undefined}
            >
              <Text className="text-xs font-semibold" style={{ color: urgency === u.value ? u.color : COLORS.dark.textMuted }}>
                {u.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Question */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Question *</Text>
        <TextInput
          style={[inputBase, { height: 140, textAlignVertical: 'top' }]}
          value={question}
          onChangeText={setQuestion}
          placeholder="What do you need to know? Be specific..."
          placeholderTextColor={COLORS.dark.textMuted}
          multiline
        />

        <Button
          title="Submit RFI"
          onPress={handleSubmit}
          loading={submitting}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
          iconLeft="send"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
