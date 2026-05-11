import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePermitsStore } from "../../stores/permitsStore";
import { COLORS } from "@/constants/theme";
import type { PermitStatus, PermitType } from "../../types/field";

const STATUSES: PermitStatus[] = ["draft", "submitted", "approved", "rejected", "expired"];
const TYPES: PermitType[] = ["building", "electrical", "plumbing", "demolition", "scaffolding", "general"];

const statusLabel = (s: PermitStatus) => s.charAt(0).toUpperCase() + s.slice(1);
const typeLabel = (t: PermitType) => t.charAt(0).toUpperCase() + t.slice(1);

const statusColor = (s: PermitStatus) => {
  switch (s) {
    case "draft": return "#6b7280";
    case "submitted": return "#2563eb";
    case "approved": return "#059669";
    case "rejected": return "#dc2626";
    case "expired": return "#d97706";
    default: return "#9ca3af";
  }
};
const typeColor = (t: PermitType) => "#2563eb";

export default function EditPermitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { permits, updatePermit, deletePermit } = usePermitsStore();
  const item = permits.find((p) => p.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PermitType>("building");
  const [status, setStatus] = useState<PermitStatus>("draft");
  const [description, setDescription] = useState("");
  const [issuer, setIssuer] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setType(item.type);
      setStatus(item.status);
      setDescription(item.description || "");
      setIssuer(item.issuer || "");
      setReferenceNumber(item.referenceNumber || "");
      setIssuedDate(item.issuedDate || "");
      setExpiryDate(item.expiryDate || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Permit not found</Text>
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
      await updatePermit(id as string, {
        title: title.trim(),
        type,
        status,
        description: description.trim() || undefined,
        issuer: issuer.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        issuedDate: issuedDate.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
      });
      Alert.alert("Success", "Permit updated");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update permit");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Permit",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePermit(id as string);
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Permit</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Permit title"
            placeholderTextColor={mutedColor}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Type</Text>
          {renderOptions(TYPES, type, setType, typeColor, typeLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Description</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Permit description..."
            placeholderTextColor={mutedColor}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Issuer</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Authority name"
            placeholderTextColor={mutedColor}
            value={issuer}
            onChangeText={setIssuer}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Reference Number</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="e.g. PERM-2024-001"
            placeholderTextColor={mutedColor}
            value={referenceNumber}
            onChangeText={setReferenceNumber}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Issued Date</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mutedColor}
            value={issuedDate}
            onChangeText={setIssuedDate}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Expiry Date</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mutedColor}
            value={expiryDate}
            onChangeText={setExpiryDate}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Permit"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete Permit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
