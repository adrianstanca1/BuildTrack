import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRfisStore } from '../../stores/rfisStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function RfiDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { rfis, updateRfi, deleteRfi } = useRfisStore();
  const { projects } = useProjectsStore();

  const rfi = rfis.find((r) => r.id === id);
  const [status, setStatus] = useState(rfi?.status || 'draft');

  if (!rfi) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background }} edges={['top']}>
        <Ionicons name="help-circle-outline" size={48} color={COLORS.dark.textMuted} />
        <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.md }}>RFI not found</Text>
      </SafeAreaView>
    );
  }

  const project = projects.find((p) => p.id === rfi.projectId);

  const priorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return COLORS.dark.textMuted;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'draft': return COLORS.dark.textMuted;
      case 'submitted': return '#3b82f6';
      case 'open': return '#eab308';
      case 'answered': return '#22c55e';
      case 'closed': return '#a855f7';
      default: return COLORS.dark.textMuted;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as any);
    await updateRfi(rfi.id, { status: newStatus as any });
  };

  const handleDelete = () => {
    Alert.alert('Delete RFI', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteRfi(rfi.id); router.back(); },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark.text} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>RFI Detail</Text>
          <Pressable onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>

        {/* Title & Status */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: COLORS.dark.text }}>
            {rfi.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm }}>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: statusColor(rfi.status) + '20' }}>
              <Text style={{ color: statusColor(rfi.status), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {rfi.status}
              </Text>
            </View>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: priorityColor(rfi.priority) + '20' }}>
              <Text style={{ color: priorityColor(rfi.priority), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {rfi.priority} priority
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Details</Text>
          <InfoRow icon="business" label="Project" value={project?.name || rfi.projectName || 'No Project'} />
          <InfoRow icon="person" label="Submitted By" value={rfi.submittedBy || 'Unknown'} />
          {rfi.assignedTo && <InfoRow icon="person" label="Assigned To" value={rfi.assignedTo} />}
          {rfi.dueDate && <InfoRow icon="calendar" label="Due Date" value={new Date(rfi.dueDate).toLocaleDateString()} />}
          <InfoRow icon="calendar" label="Created" value={new Date(rfi.createdAt).toLocaleDateString()} />
          {rfi.answeredAt && <InfoRow icon="checkmark-circle" label="Answered" value={new Date(rfi.answeredAt).toLocaleDateString()} />}
        </Card>

        {/* Question */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Question</Text>
          <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
            {rfi.question}
          </Text>
        </Card>

        {/* Answer */}
        {rfi.answer && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Answer</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {rfi.answer}
            </Text>
          </Card>
        )}

        {/* Status Actions */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Update Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {(['draft', 'submitted', 'open', 'answered', 'closed'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => handleStatusChange(s)}
                style={{
                  paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
                  borderRadius: RADIUS.md,
                  backgroundColor: status === s ? statusColor(s) + '30' : COLORS.dark.elevated,
                  borderWidth: 1, borderColor: status === s ? statusColor(s) : COLORS.dark.border,
                }}
              >
                <Text style={{ color: status === s ? statusColor(s) : COLORS.dark.textMuted, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm }}>
      <Ionicons name={icon} size={16} color={COLORS.dark.textMuted} />
      <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: COLORS.dark.textMuted, marginLeft: SPACING.sm, width: 90 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.text, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}
