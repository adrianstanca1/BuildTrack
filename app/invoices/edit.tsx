import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useInvoicesStore } from "../../stores/invoicesStore";
import { COLORS } from "@/constants/theme";
import type { InvoiceStatus } from "../../types/field";

const STATUSES: InvoiceStatus[] = ["draft", "submitted", "approved", "paid", "overdue"];
const statusLabel = (s: InvoiceStatus) => s.charAt(0).toUpperCase() + s.slice(1);
const statusColor = (s: InvoiceStatus) => {
  switch (s) {
    case "draft": return "#6b7280";
    case "submitted": return "#2563eb";
    case "approved": return "#059669";
    case "paid": return "#7c3aed";
    case "overdue": return "#dc2626";
    default: return "#9ca3af";
  }
};

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, updateInvoice, deleteInvoice } = useInvoicesStore();
  const item = invoices.find((i) => i.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [vendor, setVendor] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setInvoiceNumber(item.invoiceNumber || "");
      setDescription(item.description || "");
      setAmount(item.amount?.toString() || "");
      setStatus(item.status);
      setVendor(item.vendor || "");
      setIssueDate(item.issueDate || "");
      setDueDate(item.dueDate || "");
      setPaidDate(item.paidDate || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Invoice not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: "#2563eb" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!invoiceNumber.trim()) {
      Alert.alert("Error", "Invoice number is required");
      return;
    }
    setLoading(true);
    try {
      await updateInvoice(id as string, {
        invoiceNumber: invoiceNumber.trim(),
        description: description.trim() || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        status,
        vendor: vendor.trim() || undefined,
        issueDate: issueDate.trim() || undefined,
        dueDate: dueDate.trim() || undefined,
        paidDate: paidDate.trim() || undefined,
      });
      Alert.alert("Success", "Invoice updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Invoice",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteInvoice(id as string);
            router.back();
          },
        },
      ]
    );
  };

  const renderOptions = <T extends string>(
    options: readonly T[],
    selected: T,
    setter: (v: T) => void,
    colorFn: (v: T) => string,
    labelFn: (v: T) => string
  ) => (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => setter(opt)}
            className="px-3 py-2 rounded-lg border"
            style={{
              borderColor: active ? colorFn(opt) : isDark ? "#374151" : "#e5e7eb",
              backgroundColor: active ? colorFn(opt) + "20" : "transparent",
            }}
          >
            <Text style={{ color: active ? colorFn(opt) : textColor, fontWeight: active ? "600" : "400" }}>
              {labelFn(opt)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Invoice</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Invoice Number</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="INV-001"
            placeholderTextColor={mutedColor}
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Description</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Invoice description..."
            placeholderTextColor={mutedColor}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Amount</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="0.00"
            placeholderTextColor={mutedColor}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Vendor</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Vendor name"
            placeholderTextColor={mutedColor}
            value={vendor}
            onChangeText={setVendor}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Issue Date</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mutedColor}
            value={issueDate}
            onChangeText={setIssueDate}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Due Date</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mutedColor}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Paid Date</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mutedColor}
            value={paidDate}
            onChangeText={setPaidDate}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading || !invoiceNumber.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading || !invoiceNumber.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Invoice"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete Invoice</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
