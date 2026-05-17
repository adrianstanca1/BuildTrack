import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePurchaseOrdersStore } from "../../stores/purchaseOrdersStore";
import { COLORS } from "@/constants/theme";
import type { PurchaseOrderStatus } from "../../types/field";

const STATUSES: PurchaseOrderStatus[] = ["draft", "sent", "acknowledged", "partially_delivered", "delivered", "invoiced", "paid", "cancelled"];
const statusLabel = (s: PurchaseOrderStatus) => {
  switch (s) {
    case "partially_delivered": return "Partially Delivered";
    default: return s.charAt(0).toUpperCase() + s.slice(1);
  }
};
const statusColor = (s: PurchaseOrderStatus) => {
  switch (s) {
    case "draft": return "#6b7280";
    case "sent": return "#2563eb";
    case "acknowledged": return "#d97706";
    case "partially_delivered": return "#d97706";
    case "delivered": return "#059669";
    case "invoiced": return "#0891b2";
    case "paid": return "#059669";
    case "cancelled": return "#6b7280";
    default: return "#9ca3af";
  }
};

export default function EditPurchaseOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { purchaseOrders, updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrdersStore();
  const item = purchaseOrders.find((p) => p.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [poNumber, setPoNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PurchaseOrderStatus>("draft");
  const [vendorName, setVendorName] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [total, setTotal] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setPoNumber(item.poNumber || "");
      setTitle(item.title || "");
      setDescription(item.description || "");
      setStatus(item.status);
      setVendorName(item.vendorName || "");
      setSubtotal(item.subtotal?.toString() || "");
      setTaxRate(item.taxRate?.toString() || "");
      setTaxAmount(item.taxAmount?.toString() || "");
      setTotal(item.total?.toString() || "");
      setDeliveryDate(item.deliveryDate || "");
      setNotes(item.notes || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Purchase Order not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: "#2563eb" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!poNumber.trim()) { Alert.alert("Error", "PO Number is required"); return; }
    setLoading(true);
    try {
      await updatePurchaseOrder(id as string, {
        poNumber: poNumber.trim(),
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        status,
        vendorName: vendorName.trim() || undefined,
        subtotal: subtotal ? parseFloat(subtotal) : undefined,
        taxRate: taxRate ? parseFloat(taxRate) : undefined,
        taxAmount: taxAmount ? parseFloat(taxAmount) : undefined,
        total: total ? parseFloat(total) : undefined,
        deliveryDate: deliveryDate.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert("Success", "Purchase order updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update purchase order");
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert("Delete Purchase Order", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deletePurchaseOrder(id as string); router.back(); } },
    ]);
  };

  const renderStatusOptions = () => (
    <View className="flex-row flex-wrap gap-2">
      {STATUSES.map((opt) => {
        const active = status === opt;
        return (
          <TouchableOpacity key={opt} onPress={() => setStatus(opt)} className="px-3 py-2 rounded-lg border" style={{ borderColor: active ? statusColor(opt) : isDark ? "#374151" : "#e5e7eb", backgroundColor: active ? statusColor(opt) + "20" : "transparent" }}>
            <Text style={{ color: active ? statusColor(opt) : textColor, fontWeight: active ? "600" : "400" }}>{statusLabel(opt)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={textColor} /></TouchableOpacity>
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Purchase Order</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>PO Number</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="PO-001" placeholderTextColor={mutedColor} value={poNumber} onChangeText={setPoNumber} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Order title" placeholderTextColor={mutedColor} value={title} onChangeText={setTitle} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Description</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Description..." placeholderTextColor={mutedColor} multiline value={description} onChangeText={setDescription} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderStatusOptions()}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Vendor</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Vendor name" placeholderTextColor={mutedColor} value={vendorName} onChangeText={setVendorName} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Subtotal</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0.00" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={subtotal} onChangeText={setSubtotal} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Tax Rate (%)</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="20" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={taxRate} onChangeText={setTaxRate} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Tax Amount</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0.00" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={taxAmount} onChangeText={setTaxAmount} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Total</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0.00" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={total} onChangeText={setTotal} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Delivery Date</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="YYYY-MM-DD" placeholderTextColor={mutedColor} value={deliveryDate} onChangeText={setDeliveryDate} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Notes</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Notes..." placeholderTextColor={mutedColor} multiline value={notes} onChangeText={setNotes} />
        </View>

        <TouchableOpacity className="p-4 rounded-xl items-center mb-4" style={{ backgroundColor: loading || !poNumber.trim() ? "#9ca3af" : "#2563eb" }} onPress={handleUpdate} disabled={loading || !poNumber.trim()}>
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Purchase Order"}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-4 rounded-xl items-center" style={{ backgroundColor: "#dc2626" }} onPress={handleDelete}>
          <Text className="text-white font-semibold">Delete Purchase Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
