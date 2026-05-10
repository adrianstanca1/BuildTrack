import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useBudgetStore } from '../../stores/budgetStore';

const TYPES = ['budget', 'actual', 'forecast', 'commitment', 'variance'];

export default function CreateCostEntryScreen() {
  const [entryType, setEntryType] = useState('actual');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [vendor, setVendor] = useState('');
  const [costCode, setCostCode] = useState('');
  const [date, setDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');

  const { createEntry, loading } = useBudgetStore();

  const handleSubmit = async () => {
    if (!description.trim()) { Alert.alert('Error', 'Description is required'); return; }
    if (!amount.trim() || isNaN(parseFloat(amount))) { Alert.alert('Error', 'Valid amount is required'); return; }

    try {
      await createEntry({
        entryType: entryType as any,
        description: description.trim(),
        amount: parseFloat(amount),
        quantity: parseFloat(quantity) || 1,
        unit: unit.trim() || undefined,
        vendor: vendor.trim() || undefined,
        costCode: costCode.trim() || undefined,
        date: date || undefined,
        projectId: projectId || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Cost entry created', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create entry');
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
        <Text className="text-xl font-bold text-gray-900 dark:text-white ml-3">New Cost Entry</Text>
      </View>

      <ScrollView className="px-4 pb-8">
        <View className="mb-4">
          <Text style={labelStyle}>Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => (
              <TouchableOpacity key={t} onPress={() => setEntryType(t)}
                className={`px-3 py-1.5 rounded-full ${entryType === t ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <Text className={`text-xs font-medium ${entryType === t ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Description *</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="e.g. Foundation concrete pour"
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Amount (£) *</Text>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Cost Code</Text>
            <TextInput value={costCode} onChangeText={setCostCode} placeholder="01-1000"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Quantity</Text>
            <TextInput value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Unit</Text>
            <TextInput value={unit} onChangeText={setUnit} placeholder="m³, hrs"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Vendor</Text>
            <TextInput value={vendor} onChangeText={setVendor}
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Date</Text>
            <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
          </View>
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Project ID</Text>
          <TextInput value={projectId} onChangeText={setProjectId} placeholder="Optional"
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text }} />
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Notes</Text>
          <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3}
            placeholderTextColor={COLORS.dark.textSecondary} style={{ color: COLORS.dark.text, textAlignVertical: 'top' }} />
        </View>

        <Button onPress={handleSubmit} disabled={loading} className="mt-4">
          <Text className="text-white font-semibold">{loading ? 'Creating...' : 'Create Entry'}</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
