import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInvoicesStore } from '../../stores/invoicesStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { invoices, updateInvoice, deleteInvoice } = useInvoicesStore();
  const { projects } = useProjectsStore();

  const invoice = invoices.find((i) => i.id === id);
  const [status, setStatus] = useState(invoice?.status || 'draft');

  if (!invoice) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background }} edges={['top']}>
        <Ionicons name="receipt-outline" size={48} color={COLORS.dark.textMuted} />
        <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.md }}>Invoice not found</Text>
      </SafeAreaView>
    );
  }

  const project = projects.find((p) => p.id === invoice.projectId);

  const statusColor = (s: string) => {
    switch (s) {
      case 'draft': return COLORS.dark.textMuted;
      case 'submitted': return '#3b82f6';
      case 'approved': return '#22c55e';
      case 'paid': return '#a855f7';
      case 'overdue': return '#ef4444';
      default: return COLORS.dark.textMuted;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as any);
    await updateInvoice(invoice.id, { status: newStatus as any });
  };

  const handleDelete = () => {
    Alert.alert('Delete Invoice', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteInvoice(invoice.id); router.back(); },
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
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>Invoice Detail</Text>
          <Pressable onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>

        {/* Title & Status */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: COLORS.dark.text }}>
            {invoice.invoiceNumber}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm }}>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: statusColor(invoice.status) + '20' }}>
              <Text style={{ color: statusColor(invoice.status), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {invoice.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Details</Text>
          <InfoRow icon="business" label="Project" value={project?.name || invoice.projectName || 'No Project'} />
          <InfoRow icon="document-text" label="Description" value={invoice.description || 'N/A'} />
          <InfoRow icon="cash" label="Amount" value={`£${invoice.amount.toFixed(2)}`} />
          {invoice.vendor && <InfoRow icon="person" label="Vendor" value={invoice.vendor} />}
          <InfoRow icon="calendar" label="Issued" value={new Date(invoice.issueDate).toLocaleDateString()} />
          {invoice.dueDate && <InfoRow icon="warning" label="Due" value={new Date(invoice.dueDate).toLocaleDateString()} />}
          {invoice.paidDate && <InfoRow icon="checkmark-circle" label="Paid" value={new Date(invoice.paidDate).toLocaleDateString()} />}
          <InfoRow icon="calendar" label="Created" value={new Date(invoice.createdAt).toLocaleDateString()} />
        </Card>

        {/* Status Actions */}
        <Card className="mb-4 p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Update Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {(['draft', 'submitted', 'approved', 'paid', 'overdue'] as const).map((s) => (
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
