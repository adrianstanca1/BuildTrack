import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { usePurchaseOrdersStore } from '../../stores/purchaseOrdersStore';
import { useProjects } from '@/hooks/useProjects';

const STATUSES = ['draft', 'sent', 'acknowledged', 'partially_delivered', 'delivered', 'invoiced', 'paid', 'cancelled'] as const;

export default function CreatePurchaseOrderScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [poNumber, setPoNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [status, setStatus] = useState<string>('draft');
  const [projectId, setProjectId] = useState('');
  const [taxRate, setTaxRate] = useState('20');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const { createPurchaseOrder, loading } = usePurchaseOrdersStore();
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const projects = projectsData?.data?.data || [];

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = async () => {
    if (!poNumber.trim()) {
      Alert.alert('Error', 'PO number is required');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    if (!vendorName.trim()) {
      Alert.alert('Error', 'Vendor name is required');
      return;
    }

    const project = projects.find((p: any) => p.id === projectId);

    try {
      await createPurchaseOrder({
        poNumber: poNumber.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        vendorName: vendorName.trim(),
        vendorEmail: vendorEmail.trim() || undefined,
        vendorPhone: vendorPhone.trim() || undefined,
        status: status as any,
        projectId: projectId || undefined,
        projectName: project?.name || 'No Project',
        items: [],
        taxRate: parseFloat(taxRate) || 0,
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        deliveryDate: deliveryDate.trim() || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Purchase order created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create purchase order');
    }
  };

  const inputStyle = {
    backgroundColor: theme.inputBg,
    borderRadius: 12,
    padding: 14,
    color: theme.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.inputBorder,
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.textMuted,
    marginBottom: 6,
    marginTop: 16,
  };

  const selectedProject = projects.find((p: any) => p.id === projectId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text className="text-xl font-bold ml-4" style={{ color: theme.text }}>New Purchase Order</Text>
        </View>

        <Text style={labelStyle}>Project *</Text>
        {loadingProjects ? (
          <ActivityIndicator color={COLORS.primary[600]} />
        ) : projects.length === 0 ? (
          <Text style={{ color: theme.textMuted }}>No projects available</Text>
        ) : (
          <View className="flex-row flex-wrap">
            {projects.map((p: any) => (
              <Pressable
                key={p.id}
                onPress={() => setProjectId(p.id)}
                className="mr-2 mb-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: selectedProject?.id === p.id ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: selectedProject?.id === p.id ? '#fff' : theme.textSecondary }}
                >
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={labelStyle}>PO Number *</Text>
        <TextInput
          style={inputStyle}
          value={poNumber}
          onChangeText={setPoNumber}
          placeholder="e.g. PO-001"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Title *</Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="Purchase order title"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Description</Text>
        <TextInput
          style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description of the order..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Text style={labelStyle}>Vendor Name *</Text>
        <TextInput
          style={inputStyle}
          value={vendorName}
          onChangeText={setVendorName}
          placeholder="Vendor / supplier name"
          placeholderTextColor={theme.placeholder}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text style={labelStyle}>Vendor Email</Text>
            <TextInput
              style={inputStyle}
              value={vendorEmail}
              onChangeText={setVendorEmail}
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          <View className="flex-1">
            <Text style={labelStyle}>Vendor Phone</Text>
            <TextInput
              style={inputStyle}
              value={vendorPhone}
              onChangeText={setVendorPhone}
              keyboardType="phone-pad"
              placeholder="Phone"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        <Text style={labelStyle}>Status</Text>
        <View className="flex-row flex-wrap">
          {STATUSES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              className="mr-2 mb-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: status === s ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
              }}
            >
              <Text className="text-sm capitalize" style={{ color: status === s ? '#fff' : theme.textSecondary }}>
                {s.replace(/_/g, ' ')}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text style={labelStyle}>Tax Rate (%)</Text>
            <TextInput
              style={inputStyle}
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="numeric"
              placeholder="20"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          <View className="flex-1">
            <Text style={labelStyle}>Delivery Date</Text>
            <TextInput
              style={inputStyle}
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        <Text style={labelStyle}>Delivery Address</Text>
        <TextInput
          style={inputStyle}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Delivery address..."
          placeholderTextColor={theme.placeholder}
        />

        <Text style={labelStyle}>Notes</Text>
        <TextInput
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          placeholderTextColor={theme.placeholder}
          multiline
        />

        <Pressable
          className="p-4 rounded-xl items-center mb-8 mt-4"
          style={{
            backgroundColor: loading || !poNumber.trim() || !title.trim() || !vendorName.trim() ? '#9ca3af' : COLORS.primary[600],
          }}
          onPress={handleSubmit}
          disabled={loading || !poNumber.trim() || !title.trim() || !vendorName.trim()}
        >
          <Text className="text-white font-semibold">
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
