import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { usePermitsStore } from '../../stores/permitsStore';
import { useProjects } from '@/hooks/useProjects';
import { FileText, Calendar, Building2 } from 'lucide-react-native';

const PERMIT_TYPES = [
  { value: 'building', label: 'Building' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'demolition', label: 'Demolition' },
  { value: 'scaffolding', label: 'Scaffolding' },
  { value: 'general', label: 'General' },
] as const;

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
] as const;

export default function CreatePermitScreen() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('general');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('draft');
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { createPermit, loading } = usePermitsStore();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data?.data || [];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Permit title is required');
      return;
    }
    if (!referenceNumber.trim()) {
      Alert.alert('Error', 'Reference number is required');
      return;
    }

    try {
      await createPermit({
        title: title.trim(),
        type: type as any,
        projectId: projectId || undefined,
        projectName: projects.find((p: any) => p.id === projectId)?.name || 'No Project',
        status: status as any,
        description: description.trim() || '',
        referenceNumber: referenceNumber.trim(),
        issuer: issuer.trim() || '',
        issuedDate: issuedDate || undefined,
        expiryDate: expiryDate || undefined,
      });
      Alert.alert('Success', 'Permit created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create permit');
    }
  };

  const inputStyle = {
    backgroundColor: COLORS.dark.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.dark.text,
    fontSize: TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  };

  const labelStyle = {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: '600' as const,
    color: COLORS.dark.textMuted,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: COLORS.dark.primary, fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>
            New Permit
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={labelStyle}>Permit Title *</Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Building Control Approval"
          placeholderTextColor={COLORS.dark.textMuted}
        />

        <Text style={labelStyle}>Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md }}>
          {PERMIT_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setType(t.value)}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                backgroundColor: type === t.value ? COLORS.dark.primary + '30' : COLORS.dark.surface,
                borderWidth: 1,
                borderColor: type === t.value ? COLORS.dark.primary : COLORS.dark.border,
              }}
            >
              <Text style={{ color: type === t.value ? COLORS.dark.primary : COLORS.dark.textMuted, fontWeight: '600' }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={labelStyle}>Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity
              onPress={() => setProjectId('')}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                backgroundColor: projectId === '' ? COLORS.dark.primary + '30' : COLORS.dark.surface,
                borderWidth: 1,
                borderColor: projectId === '' ? COLORS.dark.primary : COLORS.dark.border,
              }}
            >
              <Text style={{ color: projectId === '' ? COLORS.dark.primary : COLORS.dark.textMuted }}>No Project</Text>
            </TouchableOpacity>
            {projects.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setProjectId(p.id)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  borderRadius: RADIUS.md,
                  backgroundColor: projectId === p.id ? (p.color || COLORS.dark.primary) + '30' : COLORS.dark.surface,
                  borderWidth: 1,
                  borderColor: projectId === p.id ? (p.color || COLORS.dark.primary) : COLORS.dark.border,
                }}
              >
                <Text style={{ color: projectId === p.id ? (p.color || COLORS.dark.primary) : COLORS.dark.textMuted }}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={labelStyle}>Reference Number *</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <FileText size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            placeholder="Permit reference number"
            placeholderTextColor={COLORS.dark.textMuted}
            autoCapitalize="characters"
          />
        </View>

        <Text style={labelStyle}>Status</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md }}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setStatus(s.value)}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                backgroundColor: status === s.value ? COLORS.dark.primary + '30' : COLORS.dark.surface,
                borderWidth: 1,
                borderColor: status === s.value ? COLORS.dark.primary : COLORS.dark.border,
              }}
            >
              <Text style={{ color: status === s.value ? COLORS.dark.primary : COLORS.dark.textMuted, fontWeight: '600' }}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={labelStyle}>Issuer</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Building2 size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={issuer}
            onChangeText={setIssuer}
            placeholder="Issuing authority"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Text style={labelStyle}>Issued Date</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Calendar size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={issuedDate}
            onChangeText={setIssuedDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Text style={labelStyle}>Expiry Date</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...inputStyle }}>
          <Calendar size={16} color={COLORS.dark.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={{ flex: 1, color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize }}
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        <Text style={labelStyle}>Description</Text>
        <TextInput
          style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Additional details..."
          placeholderTextColor={COLORS.dark.textMuted}
          multiline
        />

        <Button
          title="Create Permit"
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
