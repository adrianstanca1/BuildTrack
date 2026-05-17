import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePunchItemsStore } from "../../stores/punchItemsStore";
import { COLORS } from "@/constants/theme";
import type { PunchItemStatus, PunchItemSeverity } from "../../types/field";

const STATUSES: PunchItemStatus[] = ["open", "in-progress", "resolved", "closed"];
const SEVERITIES: PunchItemSeverity[] = ["cosmetic", "minor", "major", "critical"];

const statusLabel = (s: PunchItemStatus) =>
  s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
const severityLabel = (s: PunchItemSeverity) =>
  s.charAt(0).toUpperCase() + s.slice(1);

const statusColor = (s: PunchItemStatus) => {
  switch (s) {
    case "open": return "#2563eb";
    case "in-progress": return "#d97706";
    case "resolved": return "#059669";
    case "closed": return "#6b7280";
    default: return "#9ca3af";
  }
};
const severityColor = (s: PunchItemSeverity) => {
  switch (s) {
    case "cosmetic": return "#6b7280";
    case "minor": return "#d97706";
    case "major": return "#dc2626";
    case "critical": return "#7f1d1d";
  }
};

export default function EditPunchItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { punchItems, updatePunchItem, deletePunchItem } = usePunchItemsStore();
  const item = punchItems.find((i) => i.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<PunchItemStatus>("open");
  const [severity, setSeverity] = useState<PunchItemSeverity>("minor");
  const [location, setLocation] = useState("");
  const [assignee, setAssignee] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setStatus(item.status);
      setSeverity(item.severity);
      setLocation(item.location || "");
      setAssignee(item.assignee || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Punch Item not found</Text>
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
      await updatePunchItem(id as string, {
        title: title.trim(),
        status,
        severity,
        location: location.trim() || undefined,
        assignee: assignee.trim() || undefined,
      });
      Alert.alert("Success", "Punch item updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update punch item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Punch Item",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePunchItem(id as string);
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
            <Text
              style={{
                color: active ? colorFn(opt) : textColor,
                fontWeight: active ? "600" : "400",
              }}
            >
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Punch Item</Text>
        </View>

        {/* Title */}
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Punch item title"
            placeholderTextColor={mutedColor}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Status */}
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        {/* Severity */}
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Severity</Text>
          {renderOptions(SEVERITIES, severity, setSeverity, severityColor, severityLabel)}
        </View>

        {/* Location */}
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Location</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Where is the issue?"
            placeholderTextColor={mutedColor}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Assignee */}
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Assignee</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Assigned to"
            placeholderTextColor={mutedColor}
            value={assignee}
            onChangeText={setAssignee}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Punch Item"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete Punch Item</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
