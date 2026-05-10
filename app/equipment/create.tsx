import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import type { EquipmentType, EquipmentStatus } from '../../types/field';

const EQUIPMENT_TYPES: EquipmentType[] = [
  'excavator',
  'bulldozer',
  'crane',
  'loader',
  'dump_truck',
  'mixer',
  'generator',
  'scaffold',
  'scissor_lift',
  'forklift',
  'compactor',
  'other',
];

const EQUIPMENT_STATUSES: EquipmentStatus[] = [
  'available',
  'rented',
  'on_site',
  'under_maintenance',
  'out_of_service',
  'retired',
];

function typeLabel(type: EquipmentType) {
  switch (type) {
    case 'dump_truck': return 'Dump Truck';
    case 'scissor_lift': return 'Scissor Lift';
    default: return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export default function CreateEquipmentScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createEquipment } = useEquipmentStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    projectId: '',
    projectName: '',
    type: 'excavator' as EquipmentType,
    make: '',
    model: '',
    serialNumber: '',
    year: '',
    status: 'available' as EquipmentStatus,
    dailyRate: '',
    purchasePrice: '',
    purchaseDate: '',
    insuranceExpiry: '',
    motExpiry: '',
    location: '',
    notes: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.projectName) {
      Alert.alert('Error', 'Name and project name are required');
      return;
    }

    setLoading(true);
    try {
      const equipment = await createEquipment({
        name: form.name,
        projectId: form.projectId || undefined,
        projectName: form.projectName,
        type: form.type,
        make: form.make || undefined,
        model: form.model || undefined,
        serialNumber: form.serialNumber || undefined,
        year: form.year ? Number(form.year) : undefined,
        status: form.status,
        dailyRate: form.dailyRate ? Number(form.dailyRate) : undefined,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
        purchaseDate: form.purchaseDate || undefined,
        insuranceExpiry: form.insuranceExpiry || undefined,
        motExpiry: form.motExpiry || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });

      if (equipment) {
        Alert.alert('Success', 'Equipment added');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to add equipment');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} edges={['top']}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="p-4 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Equipment</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4 mb-4">
            {/* Name */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</Text>
            <TextInput
              className={inputClass}
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="Equipment name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Project Name */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</Text>
            <TextInput
              className={inputClass}
              value={form.projectName}
              onChangeText={(v) => updateField('projectName', v)}
              placeholder="Project name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            {/* Type */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</Text>
            <View className="flex-row flex-wrap mb-3">
              {EQUIPMENT_TYPES.map((t) => (
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
              {EQUIPMENT_STATUSES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.status === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.status === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Details */}
          <Card className="p-4 mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Details</Text>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Make</Text>
                <TextInput
                  className={inputClass}
                  value={form.make}
                  onChangeText={(v) => updateField('make', v)}
                  placeholder="Make"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</Text>
                <TextInput
                  className={inputClass}
                  value={form.model}
                  onChangeText={(v) => updateField('model', v)}
                  placeholder="Model"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</Text>
                <TextInput
                  className={inputClass}
                  value={form.serialNumber}
                  onChangeText={(v) => updateField('serialNumber', v)}
                  placeholder="S/N"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</Text>
                <TextInput
                  className={inputClass}
                  value={form.year}
                  onChangeText={(v) => updateField('year', v)}
                  placeholder="YYYY"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
            </View>
          </Card>

          {/* Financial */}
          <Card className="p-4 mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Financial</Text>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Rate (£)</Text>
                <TextInput
                  className={inputClass}
                  value={form.dailyRate}
                  onChangeText={(v) => updateField('dailyRate', v)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Price (£)</Text>
                <TextInput
                  className={inputClass}
                  value={form.purchasePrice}
                  onChangeText={(v) => updateField('purchasePrice', v)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
            </View>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date</Text>
            <TextInput
              className={inputClass}
              value={form.purchaseDate}
              onChangeText={(v) => updateField('purchaseDate', v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />
          </Card>

          {/* Compliance */}
          <Card className="p-4 mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Compliance</Text>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance Expiry</Text>
                <TextInput
                  className={inputClass}
                  value={form.insuranceExpiry}
                  onChangeText={(v) => updateField('insuranceExpiry', v)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MOT Expiry</Text>
                <TextInput
                  className={inputClass}
                  value={form.motExpiry}
                  onChangeText={(v) => updateField('motExpiry', v)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
            </View>
          </Card>

          {/* Location & Notes */}
          <Card className="p-4 mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Location</Text>
            <TextInput
              className={inputClass}
              value={form.location}
              onChangeText={(v) => updateField('location', v)}
              placeholder="Current location"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</Text>
            <TextInput
              className={inputClass}
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
              {loading ? 'Adding...' : 'Add Equipment'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
