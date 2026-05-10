import { View, Text, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePurchaseOrdersStore } from '../../stores/purchaseOrdersStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import type { PurchaseOrderItem } from '../../types/field';

export default function CreatePurchaseOrderScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createPurchaseOrder } = usePurchaseOrdersStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    projectId: '',
    projectName: '',
    poNumber: '',
    description: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    status: 'draft' as 'draft' | 'sent' | 'acknowledged' | 'partially_delivered' | 'delivered' | 'invoiced' | 'paid' | 'cancelled',
    taxRate: 20,
    deliveryDate: '',
    expectedDelivery: '',
    deliveryAddress: '',
    notes: '',
  });

  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { description: '', quantity: 1, unit: 'ea', unitPrice: 0, totalPrice: 0 },
  ]);

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unit: 'ea', unitPrice: 0, totalPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const { subtotal, taxAmount, total } = (() => {
    const sub = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = sub * (form.taxRate / 100);
    return { subtotal: sub, taxAmount: tax, total: sub + tax };
  })();

  const handleSubmit = async () => {
    if (!form.title || !form.projectName || !form.poNumber || !form.vendorName) {
      Alert.alert('Error', 'Title, project name, PO number, and vendor name are required');
      return;
    }

    const validItems = items.filter((i) => i.description.trim() && i.quantity > 0);
    if (validItems.length === 0) {
      Alert.alert('Error', 'Add at least one valid line item');
      return;
    }

    setLoading(true);
    try {
      const order = await createPurchaseOrder({
        title: form.title,
        projectId: form.projectId || undefined,
        projectName: form.projectName,
        poNumber: form.poNumber,
        description: form.description || undefined,
        vendorName: form.vendorName,
        vendorEmail: form.vendorEmail || undefined,
        vendorPhone: form.vendorPhone || undefined,
        status: form.status,
        items: validItems,
        subtotal,
        taxRate: form.taxRate,
        taxAmount,
        total,
        deliveryDate: form.deliveryDate || undefined,
        expectedDelivery: form.expectedDelivery || undefined,
        deliveryAddress: form.deliveryAddress || undefined,
        notes: form.notes || undefined,
      });

      if (order) {
        Alert.alert('Success', 'Purchase order created');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create purchase order');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create purchase order');
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">New Purchase Order</Text>
        </View>

        <ScrollView className="p-4">
          <Card className="p-4 mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</Text>
            <TextInput
              className={inputClass}
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder="PO title"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PO Number *</Text>
            <TextInput
              className={inputClass}
              value={form.poNumber}
              onChangeText={(v) => updateField('poNumber', v)}
              placeholder="e.g. PO-2024-001"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</Text>
            <TextInput
              className={inputClass}
              value={form.projectName}
              onChangeText={(v) => updateField('projectName', v)}
              placeholder="Project name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</Text>
            <View className="flex-row flex-wrap mb-3">
              {(['draft', 'sent', 'acknowledged', 'partially_delivered', 'delivered', 'invoiced', 'paid', 'cancelled'] as const).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                    form.status === s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm ${form.status === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {s === 'partially_delivered' ? 'Partial' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</Text>
            <TextInput
              className={inputClass}
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Description..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ height: 80 }}
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />
          </Card>

          {/* Vendor Details */}
          <Card className="p-4 mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Vendor</Text>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Name *</Text>
            <TextInput
              className={inputClass}
              value={form.vendorName}
              onChangeText={(v) => updateField('vendorName', v)}
              placeholder="Vendor name"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Email</Text>
            <TextInput
              className={inputClass}
              value={form.vendorEmail}
              onChangeText={(v) => updateField('vendorEmail', v)}
              placeholder="vendor@example.com"
              keyboardType="email-address"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Phone</Text>
            <TextInput
              className={inputClass}
              value={form.vendorPhone}
              onChangeText={(v) => updateField('vendorPhone', v)}
              placeholder="Phone number"
              keyboardType="phone-pad"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />
          </Card>

          {/* Line Items */}
          <Card className="p-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-bold text-gray-900 dark:text-white">Line Items</Text>
              <Pressable onPress={addItem} className="bg-blue-600 px-3 py-1.5 rounded-lg">
                <Text className="text-white text-sm font-semibold">+ Add Item</Text>
              </Pressable>
            </View>

            {items.map((item, index) => (
              <View key={index} className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs font-semibold text-gray-500">Item {index + 1}</Text>
                  {items.length > 1 && (
                    <Pressable onPress={() => removeItem(index)}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </Pressable>
                  )}
                </View>

                <TextInput
                  className={inputClass}
                  value={item.description}
                  onChangeText={(v) => updateItem(index, 'description', v)}
                  placeholder="Description"
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                />

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Qty</Text>
                    <TextInput
                      className={inputClass}
                      value={String(item.quantity)}
                      onChangeText={(v) => updateItem(index, 'quantity', Number(v) || 0)}
                      placeholder="1"
                      keyboardType="numeric"
                      placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Unit</Text>
                    <TextInput
                      className={inputClass}
                      value={item.unit}
                      onChangeText={(v) => updateItem(index, 'unit', v)}
                      placeholder="ea"
                      placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Unit Price</Text>
                    <TextInput
                      className={inputClass}
                      value={String(item.unitPrice)}
                      onChangeText={(v) => updateItem(index, 'unitPrice', Number(v) || 0)}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                    />
                  </View>
                </View>

                <Text className="text-sm font-semibold text-gray-900 dark:text-white text-right mt-1">
                  Total: £{item.totalPrice.toFixed(2)}
                </Text>
              </View>
            ))}
          </Card>

          {/* Totals */}
          <Card className="p-4 mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Subtotal</Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">£{subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Tax Rate (%)</Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-gray-900 dark:text-white bg-white dark:bg-gray-800 w-20 text-right"
                value={String(form.taxRate)}
                onChangeText={(v) => updateField('taxRate', Number(v) || 0)}
                keyboardType="numeric"
                placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
              />
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Tax Amount</Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">£{taxAmount.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-base font-bold text-gray-900 dark:text-white">Total</Text>
              <Text className="text-base font-bold text-blue-600">£{total.toFixed(2)}</Text>
            </View>
          </Card>

          {/* Delivery & Notes */}
          <Card className="p-4 mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Date</Text>
            <TextInput
              className={inputClass}
              value={form.deliveryDate}
              onChangeText={(v) => updateField('deliveryDate', v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery</Text>
            <TextInput
              className={inputClass}
              value={form.expectedDelivery}
              onChangeText={(v) => updateField('expectedDelivery', v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Address</Text>
            <TextInput
              className={inputClass}
              value={form.deliveryAddress}
              onChangeText={(v) => updateField('deliveryAddress', v)}
              placeholder="Delivery address"
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
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
