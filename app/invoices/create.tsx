import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInvoicesStore } from '../../stores/invoicesStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

const STATUSES = [
  { value: 'draft' as const, label: 'Draft' },
  { value: 'submitted' as const, label: 'Submitted' },
  { value: 'approved' as const, label: 'Approved' },
  { value: 'paid' as const, label: 'Paid' },
  { value: 'overdue' as const, label: 'Overdue' },
];

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createInvoice } = useInvoicesStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    invoiceNumber: '',
    projectName: '',
    status: 'draft' as typeof STATUSES[number]['value'],
    amount: '',
    description: '',
    vendor: '',
    issueDate: '',
    dueDate: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.invoiceNumber || !form.projectName || !form.amount || !form.issueDate) {
      Alert.alert('Error', 'Invoice number, project name, amount, and issue date are required');
      return;
    }

    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Amount must be a positive number');
      return;
    }

    setLoading(true);
    try {
      const invoice = await createInvoice({
        invoiceNumber: form.invoiceNumber,
        projectName: form.projectName,
        status: form.status,
        amount: amountNum,
        description: form.description,
        vendor: form.vendor || undefined,
        issueDate: form.issueDate,
        dueDate: form.dueDate || undefined,
      });

      if (invoice) {
        Alert.alert('Success', 'Invoice created');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create invoice');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setLoading(false);
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Invoice</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4">
            {/* Invoice Number */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Number *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.invoiceNumber}
              onChangeText={(v) => updateField('invoiceNumber', v)}
              placeholder="INV-001"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              autoCapitalize="characters"
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

            {/* Status */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</Text>
            <View className="flex-row flex-wrap mb-3">
              {STATUSES.map((s) => (
                <Pressable
                  key={s.value}
                  onPress={() => setForm((prev) => ({ ...prev, status: s.value }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.status === s.value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.status === s.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Amount */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</Text>
            <View className="flex-row items-center border border-gray-200 dark:border-gray-700 rounded-lg mb-3 bg-white dark:bg-gray-800">
              <Text className="text-gray-500 dark:text-gray-400 ml-3 text-base">£</Text>
              <TextInput
                className="flex-1 p-3 text-gray-900 dark:text-white"
                value={form.amount}
                onChangeText={(v) => updateField('amount', v)}
                placeholder="0.00"
                placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Description */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="What is this invoice for?"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ height: 80 }}
            />

            {/* Vendor */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.vendor}
              onChangeText={(v) => updateField('vendor', v)}
              placeholder="Vendor name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Issue Date */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date *</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.issueDate}
              onChangeText={(v) => updateField('issueDate', v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Due Date */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={form.dueDate}
              onChangeText={(v) => updateField('dueDate', v)}
              placeholder="YYYY-MM-DD"
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
              {loading ? 'Creating...' : 'Create Invoice'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
