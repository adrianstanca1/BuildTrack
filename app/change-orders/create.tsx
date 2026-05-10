import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChangeOrdersStore } from '../../stores/changeOrdersStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import type { ChangeOrderType, ChangeOrderStatus } from '../../types/field';

const CHANGE_ORDER_TYPES: ChangeOrderType[] = ['scope', 'price', 'time', 'design', 'other'];
const CHANGE_ORDER_STATUSES: ChangeOrderStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'withdrawn',
];

function typeLabel(type: ChangeOrderType) {
  switch (type) {
    case 'scope': return 'Scope';
    case 'price': return 'Price';
    case 'time': return 'Time';
    case 'design': return 'Design';
    case 'other': return 'Other';
  }
}

function statusLabel(status: ChangeOrderStatus) {
  return status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
}

function statusColor(status: ChangeOrderStatus) {
  switch (status) {
    case 'approved': return colors.success;
    case 'submitted': return colors.primary;
    case 'under_review': return colors.info;
    case 'rejected': return colors.danger;
    case 'withdrawn': return colors.gray;
    case 'draft': return colors.warning;
    default: return colors.gray;
  }
}

export default function CreateChangeOrderScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createChangeOrder } = useChangeOrdersStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    coNumber: '',
    title: '',
    projectId: '',
    projectName: '',
    description: '',
    reason: '',
    type: 'scope' as ChangeOrderType,
    status: 'draft' as ChangeOrderStatus,
    originalCost: 0,
    proposedCost: 0,
    originalScheduleDays: 0,
    proposedScheduleDays: 0,
    requestedBy: '',
    requestedById: '',
    requestedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const impactCost = form.proposedCost - form.originalCost;
  const impactDays = form.proposedScheduleDays - form.originalScheduleDays;

  const handleSubmit = async () => {
    if (!form.coNumber || !form.title || !form.projectName || !form.requestedBy || !form.requestedDate) {
      Alert.alert('Error', 'CO number, title, project name, requested by, and requested date are required');
      return;
    }

    if (!/\d{4}-\d{2}-\d{2}/.test(form.requestedDate)) {
      Alert.alert('Error', 'Requested date should be in format YYYY-MM-DD');
      return;
    }

    setLoading(true);
    try {
      const changeOrder = await createChangeOrder({
        coNumber: form.coNumber,
        title: form.title,
        projectId: form.projectId || undefined,
        projectName: form.projectName,
        description: form.description || undefined,
        reason: form.reason || undefined,
        type: form.type,
        status: form.status,
        originalCost: form.originalCost,
        proposedCost: form.proposedCost,
        originalScheduleDays: form.originalScheduleDays,
        proposedScheduleDays: form.proposedScheduleDays,
        impactCost,
        impactDays,
        requestedBy: form.requestedBy,
        requestedById: form.requestedById || undefined,
        requestedDate: form.requestedDate,
        notes: form.notes || undefined,
      });

      if (changeOrder) {
        Alert.alert('Success', 'Change order created');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create change order');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create change order');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `£${amount}`;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="p-4 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Change Order</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4">
            {/* CO Number */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CO Number *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.coNumber}
              onChangeText={(v) => updateField('coNumber', v)}
              placeholder="e.g., CO-001"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              autoCapitalize="characters"
            />

            {/* Title */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder="Change order title"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Project Name */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.projectName}
              onChangeText={(v) => updateField('projectName', v)}
              placeholder="Project name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Project ID (optional) */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project ID (optional)</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.projectId}
              onChangeText={(v) => updateField('projectId', v)}
              placeholder="Project ID"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Description */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Describe the change..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ height: 100 }}
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Reason */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.reason}
              onChangeText={(v) => updateField('reason', v)}
              placeholder="Reason for the change..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ height: 80 }}
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Type */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</Text>
            <View className="flex-row flex-wrap mb-3">
              {CHANGE_ORDER_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.type === t ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {typeLabel(t)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Status */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</Text>
            <View className="flex-row flex-wrap mb-3">
              {CHANGE_ORDER_STATUSES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.status === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.status === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {statusLabel(s)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Cost section */}
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-2">Cost</Text>
            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Original (£)</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  value={String(form.originalCost)}
                  onChangeText={(v) => updateField('originalCost', Number(v) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Proposed (£)</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  value={String(form.proposedCost)}
                  onChangeText={(v) => updateField('proposedCost', Number(v) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
            </View>

            {/* Schedule section */}
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Schedule</Text>
            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Original Days</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  value={String(form.originalScheduleDays)}
                  onChangeText={(v) => updateField('originalScheduleDays', Number(v) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Proposed Days</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  value={String(form.proposedScheduleDays)}
                  onChangeText={(v) => updateField('proposedScheduleDays', Number(v) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
            </View>

            {/* Impact summary */}
            <View className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Impact Summary</Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Cost Impact</Text>
                  <Text
                    className="text-base font-bold"
                    style={{ color: impactCost > 0 ? colors.danger : impactCost < 0 ? colors.success : colors.gray }}
                  >
                    {impactCost > 0 ? '+' : ''}{formatCurrency(impactCost)}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Schedule Impact</Text>
                  <Text
                    className="text-base font-bold"
                    style={{ color: impactDays > 0 ? colors.warning : impactDays < 0 ? colors.success : colors.gray }}
                  >
                    {impactDays > 0 ? '+' : ''}{impactDays} days
                  </Text>
                </View>
              </View>
            </View>

            {/* Requested By */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested By *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.requestedBy}
              onChangeText={(v) => updateField('requestedBy', v)}
              placeholder="Name of requester"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Requested By ID */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requester ID (optional)</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.requestedById}
              onChangeText={(v) => updateField('requestedById', v)}
              placeholder="Worker / user ID"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Requested Date */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested Date *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.requestedDate}
              onChangeText={(v) => updateField('requestedDate', v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Notes */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.notes}
              onChangeText={(v) => updateField('notes', v)}
              placeholder="Additional notes..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ height: 80 }}
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />
          </Card>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="bg-blue-600 p-4 rounded-lg items-center mt-4 mb-8"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Creating...' : 'Create Change Order'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
