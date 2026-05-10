import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermitsStore } from '../../stores/permitsStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function PermitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { permits, updatePermit, deletePermit } = usePermitsStore();
  const { projects } = useProjectsStore();

  const permit = permits.find((p) => p.id === id);
  const [status, setStatus] = useState(permit?.status || 'draft');

  if (!permit) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background }} edges={['top']}>
        <Ionicons name="document-text-outline" size={48} color={COLORS.dark.textMuted} />
        <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.md }}>Permit not found</Text>
      </SafeAreaView>
    );
  }

  const project = projects.find((p) => p.id === permit.projectId);

  const statusColor = (s: string) => {
    switch (s) {
      case 'draft': return COLORS.dark.textMuted;
      case 'submitted': return '#3b82f6';
      case 'approved': return '#22c55e';
      case 'rejected': return '#ef4444';
      case 'expired': return '#f97316';
      default: return COLORS.dark.textMuted;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as any);
    await updatePermit(permit.id, { status: newStatus as any });
  };

  const handleDelete = () => {
    Alert.alert('Delete Permit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deletePermit(permit.id); router.back(); },
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
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>Permit Detail</Text>
          <Pressable onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>

        {/* Title & Status */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: COLORS.dark.text }}>
            {permit.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm }}>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: statusColor(permit.status) + '20' }}>
              <Text style={{ color: statusColor(permit.status), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {permit.status}
              </Text>
            </View>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.dark.elevated }}>
              <Text style={{ color: COLORS.dark.textSecondary, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {permit.type}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Details</Text>
          <InfoRow icon="business" label="Project" value={project?.name || permit.projectName || 'No Project'} />
          <InfoRow icon="document-text" label="Reference" value={permit.referenceNumber || 'N/A'} />
          <InfoRow icon="person" label="Issuer" value={permit.issuer || 'Unknown'} />
          {permit.issuedDate && <InfoRow icon="calendar" label="Issued" value={new Date(permit.issuedDate).toLocaleDateString()} />}
          {permit.expiryDate && <InfoRow icon="warning" label="Expires" value={new Date(permit.expiryDate).toLocaleDateString()} />}
          <InfoRow icon="calendar" label="Created" value={new Date(permit.createdAt).toLocaleDateString()} />
        </Card>

        {/* Description */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Description</Text>
          <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
            {permit.description || 'No description provided.'}
          </Text>
        </Card>

        {/* Status Actions */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Update Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {(['draft', 'submitted', 'approved', 'rejected', 'expired'] as const).map((s) => (
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
