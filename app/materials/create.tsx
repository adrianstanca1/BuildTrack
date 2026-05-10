import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useMaterialsStore } from '../../stores/materialsStore';
import { useProjects } from '@/hooks/useProjects';
import type { MaterialCategory } from '@/types/field';

const CATEGORIES = [
  'concrete', 'steel', 'timber', 'brick', 'block',
  'insulation', 'roofing', 'electrical', 'plumbing',
  'paint', 'hardware', 'aggregate', 'other',
];

export default function CreateMaterialScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('other');
  const [unit, setUnit] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [quantityOnHand, setQuantityOnHand] = useState('');
  const [quantityOrdered, setQuantityOrdered] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [reorderQuantity, setReorderQuantity] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [location, setLocation] = useState('');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');

  const { createMaterial, loading } = useMaterialsStore();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data?.data || [];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Material name is required');
      return;
    }
    if (!unit.trim()) {
      Alert.alert('Error', 'Unit is required');
      return;
    }

    try {
      await createMaterial({
        name: name.trim(),
        category,
        unit: unit.trim(),
        unitCost: parseFloat(unitCost) || 0,
        quantityOnHand: parseFloat(quantityOnHand) || 0,
        quantityOrdered: parseFloat(quantityOrdered) || 0,
        reorderLevel: parseFloat(reorderLevel) || 0,
        reorderQuantity: parseFloat(reorderQuantity) || 0,
        supplierName: supplierName.trim() || undefined,
        location: location.trim() || undefined,
        projectId: projectId || undefined,
        projectName: projects.find((p: any) => p.id === projectId)?.name || 'Unassigned',
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Material created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create material');
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
        <Text className="text-xl font-bold text-gray-900 dark:text-white ml-3">New Material</Text>
      </View>

      <ScrollView className="px-4 pb-8">
        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Portland Cement"
            placeholderTextColor={COLORS.dark.textSecondary}
            style={{ color: COLORS.dark.text }}
          />
        </View>

        <View className="mb-4">
          <Text style={labelStyle}>Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c as MaterialCategory)}
                className={`px-3 py-1.5 rounded-full ${category === c ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <Text className={`text-xs font-medium ${category === c ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Unit *</Text>
          <TextInput
            value={unit}
            onChangeText={setUnit}
            placeholder="e.g. m³, kg, pcs"
            placeholderTextColor={COLORS.dark.textSecondary}
            style={{ color: COLORS.dark.text }}
          />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Unit Cost (£)</Text>
            <TextInput
              value={unitCost}
              onChangeText={setUnitCost}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.dark.textSecondary}
              style={{ color: COLORS.dark.text }}
            />
          </View>
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>On Hand</Text>
            <TextInput
              value={quantityOnHand}
              onChangeText={setQuantityOnHand}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={COLORS.dark.textSecondary}
              style={{ color: COLORS.dark.text }}
            />
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Ordered</Text>
            <TextInput
              value={quantityOrdered}
              onChangeText={setQuantityOrdered}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={COLORS.dark.textSecondary}
              style={{ color: COLORS.dark.text }}
            />
          </View>
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Project ID</Text>
            <TextInput
              value={projectId}
              onChangeText={setProjectId}
              placeholder="Optional"
              placeholderTextColor={COLORS.dark.textSecondary}
              style={{ color: COLORS.dark.text }}
            />
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Reorder Level</Text>
            <TextInput
              value={reorderLevel}
              onChangeText={setReorderLevel}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={COLORS.dark.textSecondary}
              style={{ color: COLORS.dark.text }}
            />
          </View>
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Reorder Qty</Text>
            <TextInput
              value={reorderQuantity}
              onChangeText={setReorderQuantity}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={COLORS.dark.textSecondary}
              style={{ color: COLORS.dark.text }}
            />
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Supplier</Text>
            <TextInput
              value={supplierName}
              onChangeText={setSupplierName}
              placeholder="e.g. Travis Perkins"
              placeholderTextColor={COLORS.dark.textSecondary}
              style={{ color: COLORS.dark.text }}
            />
          </View>
          <View style={[inputStyle, { flex: 1 }]}>
            <Text style={labelStyle}>Storage Location</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Site shed A"
              placeholderTextColor={COLORS.dark.textSecondary}
              style={{ color: COLORS.dark.text }}
            />
          </View>
        </View>

        <View style={[inputStyle, { marginBottom: SPACING.md }]}>
          <Text style={labelStyle}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Additional notes..."
            placeholderTextColor={COLORS.dark.textSecondary}
            style={{ color: COLORS.dark.text, textAlignVertical: 'top' }}
          />
        </View>

        <Button
          onPress={handleSubmit}
          disabled={loading}
          className="mt-4"
        >
          <Text className="text-white font-semibold">
            {loading ? 'Creating...' : 'Create Material'}
          </Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
