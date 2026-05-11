import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimesheetsStore } from '../../stores/timesheetsStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function TimesheetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { timesheets, updateTimesheet, deleteTimesheet } = useTimesheetsStore();
  const { projects } = useProjectsStore();

  const timesheet = timesheets.find((t) => t.id === id);
  const [status, setStatus] = useState(timesheet?.status || 'submitted');

  if (!timesheet) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background }} edges={['top']}>
        <Ionicons name="time-outline" size={48} color={COLORS.dark.textMuted} />
        <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.md }}>Timesheet not found</Text>
      </SafeAreaView>
    );
  }

  const project = projects.find((p) => p.id === timesheet.projectId);

  const statusColor = (s: string) => {
    switch (s) {
      case 'submitted': return '#3b82f6';
      case 'approved': return '#22c55e';
      case 'rejected': return '#ef4444';
      case 'paid': return '#a855f7';
      default: return COLORS.dark.textMuted;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as any);
    await updateTimesheet(timesheet.id, { status: newStatus as any });
  };

  const handleDelete = () => {
    Alert.alert('Delete Timesheet', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteTimesheet(timesheet.id); router.back(); },
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
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>Timesheet Detail</Text>
                    <Pressable onPress={() => router.push(`/timesheets/edit?id=${timesheet.id}`)} className="p-2 mr-2">
            <Ionicons name="create-outline" size={20} color={'#2563eb'} />
          </Pressable>
<Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>

        {/* Title & Status */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: COLORS.dark.text }}>
            {timesheet.workerName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm }}>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: statusColor(timesheet.status) + '20' }}>
              <Text style={{ color: statusColor(timesheet.status), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {timesheet.status}
              </Text>
            </View>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.dark.elevated }}>
              <Text style={{ color: COLORS.dark.textSecondary, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {timesheet.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Details</Text>
          <InfoRow icon="business" label="Project" value={project?.name || timesheet.projectName || 'No Project'} />
          <InfoRow icon="briefcase" label="Role" value={timesheet.workerRole || 'N/A'} />
          <InfoRow icon="calendar" label="Date" value={new Date(timesheet.date).toLocaleDateString()} />
          <InfoRow icon="time" label="Hours" value={`${timesheet.hoursWorked}h`} />
          <InfoRow icon="time" label="Overtime" value={`${timesheet.overtimeHours}h`} />
          <InfoRow icon="cash" label="Rate" value={`£${timesheet.hourlyRate}/hr`} />
          <InfoRow icon="wallet" label="Total Pay" value={`£${timesheet.totalPay.toFixed(2)}`} />
          <InfoRow icon="calendar" label="Created" value={new Date(timesheet.createdAt).toLocaleDateString()} />
        </Card>

        {/* Description */}
        {timesheet.workDescription && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Work Description</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {timesheet.workDescription}
            </Text>
          </Card>
        )}

        {/* Notes */}
        {timesheet.notes && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Notes</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {timesheet.notes}
            </Text>
          </Card>
        )}

        {/* Status Actions */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Update Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {(['submitted', 'approved', 'rejected', 'paid'] as const).map((s) => (
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
