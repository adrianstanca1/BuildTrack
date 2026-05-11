import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDefectsStore } from '../../stores/defectsStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function DefectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { defects, updateDefect, deleteDefect } = useDefectsStore();
  const { projects } = useProjectsStore();

  const defect = defects.find((d) => d.id === id);

  const [status, setStatus] = useState(defect?.status || 'open');

  if (!defect) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background }} edges={['top']}>
        <Ionicons name="bug-outline" size={48} color={colors.gray} />
        <Text style={{ color: colors.gray, marginTop: 16 }}>Defect not found</Text>
      </SafeAreaView>
    );
  }

  const project = projects.find((p) => p.id === defect.projectId);

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.danger;
      case 'major': return '#f97316';
      case 'minor': return colors.warning;
      case 'cosmetic': return colors.success;
      default: return colors.gray;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'open': return colors.danger;
      case 'in-progress': return colors.warning;
      case 'resolved': return colors.success;
      case 'closed': return colors.primary;
      default: return colors.gray;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as any);
    await updateDefect(defect.id, { status: newStatus as any });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Defect',
      'Are you sure you want to delete this defect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDefect(defect.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark.text} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>Defect Detail</Text>
                    <Pressable onPress={() => router.push(`/defects/edit?id=${defect.id}`)} className="p-2 mr-2">
            <Ionicons name="create-outline" size={20} color={'#2563eb'} />
          </Pressable>
<Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
          </Pressable>
        </View>

        {/* Title & Severity */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: COLORS.dark.text }}>
            {defect.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm }}>
            <View
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.xs,
                borderRadius: RADIUS.full,
                backgroundColor: severityColor(defect.severity) + '20',
              }}
            >
              <Text style={{ color: severityColor(defect.severity), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {defect.severity}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.xs,
                borderRadius: RADIUS.full,
                backgroundColor: statusColor(defect.status) + '20',
              }}
            >
              <Text style={{ color: statusColor(defect.status), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {defect.status.replace('-', ' ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>
            Details
          </Text>
          <InfoRow icon="business" label="Project" value={project?.name || defect.projectName || 'No Project'} />
          <InfoRow icon="location" label="Location" value={defect.location || 'Not specified'} />
          <InfoRow icon="person" label="Reported By" value={defect.reportedBy || 'Unknown'} />
          <InfoRow icon="calendar" label="Created" value={new Date(defect.createdAt).toLocaleDateString()} />
          {defect.resolvedAt && (
            <InfoRow icon="checkmark-circle" label="Resolved" value={new Date(defect.resolvedAt).toLocaleDateString()} />
          )}
        </Card>

        {/* Description */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>
            Description
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
            {defect.description || 'No description provided.'}
          </Text>
        </Card>

        {/* Status Actions */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>
            Update Status
          </Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {(['open', 'in-progress', 'resolved', 'closed'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => handleStatusChange(s)}
                style={{
                  flex: 1,
                  paddingVertical: SPACING.sm,
                  borderRadius: RADIUS.md,
                  backgroundColor: status === s ? statusColor(s) + '30' : COLORS.dark.elevated,
                  borderWidth: 1,
                  borderColor: status === s ? statusColor(s) : COLORS.dark.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: status === s ? statusColor(s) : COLORS.dark.textMuted, fontWeight: '600', fontSize: 12 }}>
                  {s.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
      <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: COLORS.dark.textMuted, marginLeft: SPACING.sm, width: 90 }}>
        {label}
      </Text>
      <Text style={{ flex: 1, fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.text, fontWeight: '500' }}>
        {value}
      </Text>
    </View>
  );
}
