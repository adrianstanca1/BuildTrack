import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMaterialsStore } from '../../stores/materialsStore';
import { Card } from '../../components/ui/Card';

import type { MaterialCategory } from '../../types/field';

const CATEGORIES: MaterialCategory[] = [
  'concrete',
  'steel',
  'timber',
  'brick',
  'block',
  'insulation',
  'roofing',
  'electrical',
  'plumbing',
  'paint',
  'hardware',
  'aggregate',
  'other',
];

function categoryLabel(c: MaterialCategory) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function categoryIcon(c: MaterialCategory) {
  switch (c) {
    case 'concrete': return 'cube-outline';
    case 'steel': return 'fitness-outline';
    case 'timber': return 'leaf-outline';
    case 'brick': return 'layers-outline';
    case 'block': return 'apps-outline';
    case 'insulation': return 'thermometer-outline';
    case 'roofing': return 'home-outline';
    case 'electrical': return 'flash-outline';
    case 'plumbing': return 'water-outline';
    case 'paint': return 'color-palette-outline';
    case 'hardware': return 'build-outline';
    case 'aggregate': return 'ellipse-outline';
    default: return 'construct-outline';
  }
}

export default function CreateMaterialScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createMaterial } = useMaterialsStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    projectId: '',
    projectName: '',
    category: 'other' as MaterialCategory,
    unit: '',
    unitCost: '',
    quantityOnHand: '',
    quantityOrdered: '',
    reorderLevel: '',
    reorderQuantity: '',
    supplierName: '',
    location: '',
    notes: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const parseNumber = (v: string) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.projectName || !form.unit) {
      Alert.alert('Error', 'Name, project name, and unit are required');
      return;
    }

    setLoading(true);
    try {
      const material = await createMaterial({
        name: form.name,
        projectId: form.projectId || undefined,
        projectName: form.projectName,
        category: form.category,
        unit: form.unit,
        unitCost: parseNumber(form.unitCost),
        quantityOnHand: parseNumber(form.quantityOnHand),
        quantityOrdered: parseNumber(form.quantityOrdered),
        reorderLevel: parseNumber(form.reorderLevel),
        reorderQuantity: parseNumber(form.reorderQuantity),
        supplierName: form.supplierName || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });

      if (material) {
        Alert.alert('Success', 'Material added');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to add material');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add material');
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Material</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4 mb-4">
            {/* Name */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</Text>
            <TextInput
              className={inputClass}
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="Material name"
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

            {/* Category */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</Text>
            <View className="flex-row flex-wrap mb-3">
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setForm((prev) => ({ ...prev, category: c }))}
                  className={`mr-2 mb-2 flex-row items-center px-3 py-2 rounded-full ${
                    form.category === c ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Ionicons
                    name={categoryIcon(c)}
                    size={14}
                    color={form.category === c ? '#fff' : isDark ? '#d1d5db' : '#4b5563'}
                  />
                  <Text
                    className={`text-sm ml-1 ${
                      form.category === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {categoryLabel(c)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Unit */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit *</Text>
            <TextInput
              className={inputClass}
              value={form.unit}
              onChangeText={(v) => updateField('unit', v)}
              placeholder="e.g. m³, kg, bag, roll"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />
          </Card>

          {/* Stock & Pricing */}
          <Card className="p-4 mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Stock & Pricing</Text>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity On Hand</Text>
                <TextInput
                  className={inputClass}
                  value={form.quantityOnHand}
                  onChangeText={(v) => updateField('quantityOnHand', v)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity Ordered</Text>
                <TextInput
                  className={inputClass}
                  value={form.quantityOrdered}
                  onChangeText={(v) => updateField('quantityOrdered', v)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reorder Level</Text>
                <TextInput
                  className={inputClass}
                  value={form.reorderLevel}
                  onChangeText={(v) => updateField('reorderLevel', v)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reorder Quantity</Text>
                <TextInput
                  className={inputClass}
                  value={form.reorderQuantity}
                  onChangeText={(v) => updateField('reorderQuantity', v)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />
              </View>
            </View>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Cost (£)</Text>
            <TextInput
              className={inputClass}
              value={form.unitCost}
              onChangeText={(v) => updateField('unitCost', v)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />
          </Card>

          {/* Supplier & Location */}
          <Card className="p-4 mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Supplier & Location</Text>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier Name</Text>
            <TextInput
              className={inputClass}
              value={form.supplierName}
              onChangeText={(v) => updateField('supplierName', v)}
              placeholder="Supplier name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Storage Location</Text>
            <TextInput
              className={inputClass}
              value={form.location}
              onChangeText={(v) => updateField('location', v)}
              placeholder="Where this material is stored"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />
          </Card>

          {/* Notes */}
          <Card className="p-4 mb-4">
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
              {loading ? 'Adding...' : 'Add Material'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
