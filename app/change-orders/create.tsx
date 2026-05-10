import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useChangeOrdersStore } from '../../stores/changeOrdersStore';
import type { ChangeOrderType, ChangeOrderStatus } from '@/types/field';

const TYPES: ChangeOrderType[] = ['scope', 'price', 'time', 'design', 'other'];
const STATUSES: ChangeOrderStatus[] = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'];

export default function CreateChangeOrderScreen() {
  const [coNumber, setCoNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<ChangeOrderType>('scope');
  const [status, setStatus] = useState<ChangeOrderStatus>('draft');
  const [originalCost, setOriginalCost] = useState('');
  const [proposedCost, setProposedCost] = useState('');
  const [originalScheduleDays, setOriginalScheduleDays] = useState('');
  const [proposedScheduleDays, setProposedScheduleDays] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');

  const { createChangeOrder, loading } = useChangeOrdersStore();

  const handleSubmit = async () => {
    if (!coNumber.trim()) { Alert.alert('Error', 'CO Number is required'); return; }
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return; }

    try {
      await createChangeOrder({
        coNumber: coNumber.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        reason: reason.trim() || undefined,
        type,
        status,
        originalCost: parseFloat(originalCost) || 0,
        proposedCost: parseFloat(proposedCost) || 0,
        originalScheduleDays: parseInt(originalScheduleDays) || 0,
        proposedScheduleDays: parseInt(proposedScheduleDays) || 0,
        requestedBy: requestedBy.trim() || undefined,
        requestedDate: requestedDate || undefined,
        projectId: projectId || undefined,
        projectName: 'Unassigned',
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Change order created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create change order');
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
    fontWeight: '500' as const,
    color: COLORS.dark.textSecondary,
    marginBottom: SPACING.xs,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white ml-3">New Change Order</Text>
      </View>

      <ScrollView className="px-4 pb-8">
        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>CO Number *</Text>
          <TextInput value={coNumber} onChangeText={setCoNumber} placeholder="e.g. CO-001"
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Title *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Brief description"
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} multiline numberOfLines={3}
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text, textAlignVertical: 'top' }} />
        </View>

        <View className="mb-4">
          <Text style={labelStyle}>Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => (
              <TouchableOpacity key={t} onPress={() => setType(t)}
                className={`px-3 py-1.5 rounded-full ${type === t ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <Text className={`text-xs font-medium ${type === t ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text style={labelStyle}>Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {STATUSES.map((s) => (
              <TouchableOpacity key={s} onPress={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full ${status === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <Text className={`text-xs font-medium ${status === s ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  {s.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Reason</Text>
          <TextInput value={reason} onChangeText={setReason} placeholder="e.g. Client request"
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]} >
            <Text style={labelStyle}>Original Cost (£)</Text>
            <TextInput value={originalCost} onChangeText={setOriginalCost} keyboardType="decimal-pad"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
          <View style={[inputStyle, { flex: 1 }]} >
            <Text style={labelStyle}>Proposed Cost (£)</Text>
            <TextInput value={proposedCost} onChangeText={setProposedCost} keyboardType="decimal-pad"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]} >
            <Text style={labelStyle}>Original Days</Text>
            <TextInput value={originalScheduleDays} onChangeText={setOriginalScheduleDays} keyboardType="number-pad"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
          <View style={[inputStyle, { flex: 1 }]} >
            <Text style={labelStyle}>Proposed Days</Text>
            <TextInput value={proposedScheduleDays} onChangeText={setProposedScheduleDays} keyboardType="number-pad"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]} >
            <Text style={labelStyle}>Requested By</Text>
            <TextInput value={requestedBy} onChangeText={setRequestedBy}
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
          <View style={[inputStyle, { flex: 1 }]} >
            <Text style={labelStyle}>Requested Date</Text>
            <TextInput value={requestedDate} onChangeText={setRequestedDate} placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]} >
          <Text style={labelStyle}>Project ID</Text>
          <TextInput value={projectId} onChangeText={setProjectId} placeholder="Optional"
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]} >
          <Text style={labelStyle}>Notes</Text>
          <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3}
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text, textAlignVertical: 'top' }} />
        </View>

        <Button onPress={handleSubmit} disabled={loading} className="mt-4">
          <Text className="text-white font-semibold">{loading ? 'Creating...' : 'Create Change Order'}</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
