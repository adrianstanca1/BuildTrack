import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChangeOrdersStore } from "../../stores/changeOrdersStore";
import { COLORS } from "@/constants/theme";
import type { ChangeOrderStatus, ChangeOrderType } from "../../types/field";

const STATUSES: ChangeOrderStatus[] = ["draft", "submitted", "under_review", "approved", "rejected", "withdrawn"];
const TYPES: ChangeOrderType[] = ["scope", "price", "time", "design", "other"];

const statusLabel = (s: ChangeOrderStatus) => {
  switch (s) {
    case "under_review": return "Under Review";
    default: return s.charAt(0).toUpperCase() + s.slice(1);
  }
};
const typeLabel = (t: ChangeOrderType) => t.charAt(0).toUpperCase() + t.slice(1);

const statusColor = (s: ChangeOrderStatus) => {
  switch (s) {
    case "draft": return "#6b7280";
    case "submitted": return "#2563eb";
    case "under_review": return "#d97706";
    case "approved": return "#059669";
    case "rejected": return "#dc2626";
    case "withdrawn": return "#9ca3af";
    default: return "#9ca3af";
  }
};
const typeColor = (t: ChangeOrderType) => "#2563eb";

export default function EditChangeOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { changeOrders, updateChangeOrder, deleteChangeOrder } = useChangeOrdersStore();
  const item = changeOrders.find((c) => c.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [coNumber, setCoNumber] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<ChangeOrderStatus>("draft");
  const [type, setType] = useState<ChangeOrderType>("scope");
  const [originalCost, setOriginalCost] = useState("");
  const [proposedCost, setProposedCost] = useState("");
  const [originalScheduleDays, setOriginalScheduleDays] = useState("");
  const [proposedScheduleDays, setProposedScheduleDays] = useState("");
  const [impactCost, setImpactCost] = useState("");
  const [impactDays, setImpactDays] = useState("");
  const [reviewedBy, setReviewedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [reviewedDate, setReviewedDate] = useState("");
  const [approvedDate, setApprovedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setCoNumber(item.coNumber || "");
      setDescription(item.description || "");
      setReason(item.reason || "");
      setStatus(item.status);
      setType(item.type);
      setOriginalCost(item.originalCost?.toString() || "");
      setProposedCost(item.proposedCost?.toString() || "");
      setOriginalScheduleDays(item.originalScheduleDays?.toString() || "");
      setProposedScheduleDays(item.proposedScheduleDays?.toString() || "");
      setImpactCost(item.impactCost?.toString() || "");
      setImpactDays(item.impactDays?.toString() || "");
      setReviewedBy(item.reviewedBy || "");
      setApprovedBy(item.approvedBy || "");
      setReviewedDate(item.reviewedDate || "");
      setApprovedDate(item.approvedDate || "");
      setNotes(item.notes || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Change Order not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: "#2563eb" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    setLoading(true);
    try {
      await updateChangeOrder(id as string, {
        title: title.trim(),
        coNumber: coNumber.trim() || undefined,
        description: description.trim() || undefined,
        reason: reason.trim() || undefined,
        status,
        type,
        originalCost: originalCost ? parseFloat(originalCost) : undefined,
        proposedCost: proposedCost ? parseFloat(proposedCost) : undefined,
        originalScheduleDays: originalScheduleDays ? parseInt(originalScheduleDays, 10) : undefined,
        proposedScheduleDays: proposedScheduleDays ? parseInt(proposedScheduleDays, 10) : undefined,
        impactCost: impactCost ? parseFloat(impactCost) : undefined,
        impactDays: impactDays ? parseInt(impactDays, 10) : undefined,
        reviewedBy: reviewedBy.trim() || undefined,
        approvedBy: approvedBy.trim() || undefined,
        reviewedDate: reviewedDate.trim() || undefined,
        approvedDate: approvedDate.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert("Success", "Change order updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update change order");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Change Order",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteChangeOrder(id as string);
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Change Order</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Title" placeholderTextColor={mutedColor} value={title} onChangeText={setTitle} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>CO Number</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="CO-001" placeholderTextColor={mutedColor} value={coNumber} onChangeText={setCoNumber} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Type</Text>
          {renderOptions(TYPES, type, setType, typeColor, typeLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Description</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Describe the change..." placeholderTextColor={mutedColor} multiline value={description} onChangeText={setDescription} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Reason</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Why is this change needed?" placeholderTextColor={mutedColor} multiline value={reason} onChangeText={setReason} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Original Cost</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0.00" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={originalCost} onChangeText={setOriginalCost} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Proposed Cost</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0.00" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={proposedCost} onChangeText={setProposedCost} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Impact Cost</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0.00" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={impactCost} onChangeText={setImpactCost} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Original Schedule (days)</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0" placeholderTextColor={mutedColor} keyboardType="number-pad" value={originalScheduleDays} onChangeText={setOriginalScheduleDays} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Proposed Schedule (days)</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0" placeholderTextColor={mutedColor} keyboardType="number-pad" value={proposedScheduleDays} onChangeText={setProposedScheduleDays} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Impact Days</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0" placeholderTextColor={mutedColor} keyboardType="number-pad" value={impactDays} onChangeText={setImpactDays} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Reviewed By</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Reviewer" placeholderTextColor={mutedColor} value={reviewedBy} onChangeText={setReviewedBy} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Approved By</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Approver" placeholderTextColor={mutedColor} value={approvedBy} onChangeText={setApprovedBy} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Notes</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Additional notes..." placeholderTextColor={mutedColor} multiline value={notes} onChangeText={setNotes} />
        </View>

        <TouchableOpacity className="p-4 rounded-xl items-center mb-4" style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }} onPress={handleUpdate} disabled={loading || !title.trim()}>
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Change Order"}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 rounded-xl items-center" style={{ backgroundColor: "#dc2626" }} onPress={handleDelete}>
          <Text className="text-white font-semibold">Delete Change Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
