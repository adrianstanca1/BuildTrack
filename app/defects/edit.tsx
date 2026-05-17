import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDefectsStore } from "../../stores/defectsStore";
import { COLORS } from "@/constants/theme";
import type { DefectStatus, DefectSeverity } from "../../types/field";

const STATUSES: DefectStatus[] = ["open", "in-progress", "resolved", "closed"];
const SEVERITIES: DefectSeverity[] = ["cosmetic", "minor", "major", "critical"];

const statusLabel = (s: DefectStatus) =>
  s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
const severityLabel = (s: DefectSeverity) => s.charAt(0).toUpperCase() + s.slice(1);

const statusColor = (s: DefectStatus) => {
  switch (s) {
    case "open": return "#2563eb";
    case "in-progress": return "#d97706";
    case "resolved": return "#059669";
    case "closed": return "#6b7280";
    default: return "#9ca3af";
  }
};
const severityColor = (s: DefectSeverity) => {
  switch (s) {
    case "cosmetic": return "#6b7280";
    case "minor": return "#d97706";
    case "major": return "#dc2626";
    case "critical": return "#7f1d1d";
    default: return "#9ca3af";
  }
};

export default function EditDefectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { defects, updateDefect, deleteDefect } = useDefectsStore();
  const item = defects.find((i) => i.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<DefectStatus>("open");
  const [severity, setSeverity] = useState<DefectSeverity>("minor");
  const [location, setLocation] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setStatus(item.status);
      setSeverity(item.severity);
      setLocation(item.location || "");
      setAssignedTo(item.assignedTo || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Defect not found</Text>
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
      await updateDefect(id as string, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        severity,
        location: location.trim() || undefined,
        assignedTo: assignedTo.trim() || undefined,
      });
      Alert.alert("Success", "Defect updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update defect");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Defect",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDefect(id as string);
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Defect</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Defect title"
            placeholderTextColor={mutedColor}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Description</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Describe the defect..."
            placeholderTextColor={mutedColor}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Severity</Text>
          {renderOptions(SEVERITIES, severity, setSeverity, severityColor, severityLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Location</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Where is the defect?"
            placeholderTextColor={mutedColor}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Assigned To</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Assignee name"
            placeholderTextColor={mutedColor}
            value={assignedTo}
            onChangeText={setAssignedTo}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Defect"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete Defect</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
