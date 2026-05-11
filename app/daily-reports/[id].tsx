import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyReportsStore } from '../../stores/dailyReportsStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function DailyReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { reports, deleteReport } = useDailyReportsStore();
  const { projects } = useProjectsStore();

  const report = reports.find((r) => r.id === id);

  if (!report) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background }} edges={['top']}>
        <Ionicons name="clipboard-outline" size={48} color={COLORS.dark.textMuted} />
        <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.md }}>Daily Report not found</Text>
      </SafeAreaView>
    );
  }

  const project = projects.find((p) => p.id === report.projectId);

  const handleDelete = () => {
    Alert.alert('Delete Daily Report', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteReport(report.id); router.back(); },
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
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>Daily Report</Text>
                    <Pressable onPress={() => router.push(`/daily-reports/edit?id=${report.id}`)} className="p-2 mr-2">
            <Ionicons name="create-outline" size={20} color={'#2563eb'} />
          </Pressable>
<Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>

        {/* Title */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: COLORS.dark.text }}>
            {new Date(report.reportDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Details Card */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Details</Text>
          <InfoRow icon="business" label="Project" value={project?.name || report.projectName || 'No Project'} />
          <InfoRow icon="cloud" label="Weather" value={report.weather || 'N/A'} />
          {report.temperature !== undefined && <InfoRow icon="thermometer" label="Temperature" value={`${report.temperature}°C`} />}
          <InfoRow icon="people" label="Workers" value={`${report.workersOnSite || 0} on site`} />
          <InfoRow icon="person" label="Submitted By" value={report.submittedBy || 'Unknown'} />
        </Card>

        {/* Work Completed */}
        {report.workCompleted && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Work Completed</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {report.workCompleted}
            </Text>
          </Card>
        )}

        {/* Safety Observations */}
        {report.safetyObservations && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Safety Observations</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {report.safetyObservations}
            </Text>
          </Card>
        )}

        {/* Materials Used */}
        {report.materialsUsed && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Materials Used</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {report.materialsUsed}
            </Text>
          </Card>
        )}

        {/* Equipment Used */}
        {report.equipmentUsed && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Equipment Used</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {report.equipmentUsed}
            </Text>
          </Card>
        )}

        {/* Issues & Delays */}
        {report.issuesDelays && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Issues & Delays</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {report.issuesDelays}
            </Text>
          </Card>
        )}

        {/* Next Day Plan */}
        {report.nextDayPlan && (
          <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.sm }}>Next Day Plan</Text>
            <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.textSecondary, lineHeight: TYPOGRAPHY.body.lineHeight }}>
              {report.nextDayPlan}
            </Text>
          </Card>
        )}
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
