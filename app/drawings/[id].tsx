import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrawingsStore } from '../../stores/drawingsStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function DrawingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { drawings, updateDrawing, deleteDrawing } = useDrawingsStore();
  const { projects } = useProjectsStore();

  const drawing = drawings.find((d) => d.id === id);
  const [status, setStatus] = useState(drawing?.status || 'active');

  if (!drawing) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background }} edges={['top']}>
        <Ionicons name="map-outline" size={48} color={COLORS.dark.textMuted} />
        <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.md }}>Drawing not found</Text>
      </SafeAreaView>
    );
  }

  const project = projects.find((p) => p.id === drawing.projectId);

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return '#22c55e';
      case 'superseded': return '#f97316';
      case 'archived': return COLORS.dark.textMuted;
      default: return COLORS.dark.textMuted;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as any);
    await updateDrawing(drawing.id, { status: newStatus as any });
  };

  const handleDelete = () => {
    Alert.alert('Delete Drawing', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteDrawing(drawing.id); router.back(); },
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
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>Drawing Detail</Text>
          <Pressable onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>

        {/* Title & Status */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: COLORS.dark.text }}>
            {drawing.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm }}>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: statusColor(drawing.status) + '20' }}>
              <Text style={{ color: statusColor(drawing.status), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {drawing.status}
              </Text>
            </View>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.dark.elevated }}>
              <Text style={{ color: COLORS.dark.textSecondary, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {drawing.discipline}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Details</Text>
          <InfoRow icon="business" label="Project" value={project?.name || drawing.projectName || 'No Project'} />
          <InfoRow icon="git-branch" label="Revision" value={drawing.revision || 'N/A'} />
          <InfoRow icon="person" label="Uploaded By" value={drawing.uploadedBy || 'Unknown'} />
          <InfoRow icon="calendar" label="Created" value={new Date(drawing.createdAt).toLocaleDateString()} />
        </Card>

        {/* File URL */}
        {drawing.fileUrl && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>File</Text>
            <Pressable onPress={() => {}} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="document" size={20} color="#3b82f6" />
              <Text style={{ marginLeft: SPACING.sm, color: '#3b82f6', fontWeight: '500' }}>View Drawing</Text>
            </Pressable>
          </Card>
        )}

        {/* Status Actions */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Update Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {(['active', 'superseded', 'archived'] as const).map((s) => (
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
