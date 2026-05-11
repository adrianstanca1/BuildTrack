import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { usePunchItemsStore } from "@/stores/punchItemsStore";
import { useProjectsStore } from "@/stores/projectsStore";
import type { PunchItemStatus, PunchItemSeverity } from "@/types/field";

const STATUSES: PunchItemStatus[] = ["open", "in-progress", "resolved", "closed"];
const SEVERITIES: PunchItemSeverity[] = ["cosmetic", "minor", "major", "critical"];

export default function CreatePunchItemScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PunchItemStatus>("open");
  const [severity, setSeverity] = useState<PunchItemSeverity>("minor");
  const [location, setLocation] = useState("");
  const [assignee, setAssignee] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);

  const { createPunchItem } = usePunchItemsStore();
  const { projects } = useProjectsStore();

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title.");
      return;
    }
    setLoading(true);
    try {
      await createPunchItem({
        title: title.trim(),
        projectId: projectId || undefined,
        projectName: projects.find((p) => p.id === projectId)?.name || "",
        status,
        severity,
        location: location.trim() || undefined,
        assignee: assignee.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create punch item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>New Punch Item</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setProjectId("")}
                className={`px-3 py-1.5 rounded-lg ${projectId === "" ? "bg-blue-600" : "bg-gray-700"}`}
              >
                <Text className="text-white text-sm">None</Text>
              </TouchableOpacity>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setProjectId(p.id)}
                  className={`px-3 py-1.5 rounded-lg ${projectId === p.id ? "bg-blue-600" : "bg-gray-700"}`}
                >
                  <Text className="text-white text-sm">{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title *</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Punch item title"
            placeholderTextColor={mutedColor}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Severity</Text>
          {SEVERITIES.map((s) => (
            <TouchableOpacity
              key={s}
              className="flex-row items-center p-3 rounded-lg mb-2 border"
              style={{ borderColor: severity === s ? "#2563eb" : isDark ? "#374151" : "#e5e7eb", backgroundColor: severity === s ? "#eff6ff" : bg }}
              onPress={() => setSeverity(s)}
            >
              <Ionicons name={severity === s ? "radio-button-on" : "radio-button-off"} size={20} color="#2563eb" />
              <Text className="ml-2 capitalize" style={{ color: textColor }}>{s.replace(/-/g, " ")}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              className="flex-row items-center p-3 rounded-lg mb-2 border"
              style={{ borderColor: status === s ? "#2563eb" : isDark ? "#374151" : "#e5e7eb", backgroundColor: status === s ? "#eff6ff" : bg }}
              onPress={() => setStatus(s)}
            >
              <Ionicons name={status === s ? "radio-button-on" : "radio-button-off"} size={20} color="#2563eb" />
              <Text className="ml-2 capitalize" style={{ color: textColor }}>{s.replace(/-/g, " ")}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Location</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="e.g. Level 2, Room 204"
            placeholderTextColor={mutedColor}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Assignee</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Name or email"
            placeholderTextColor={mutedColor}
            value={assignee}
            onChangeText={setAssignee}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Description</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Add details..."
            placeholderTextColor={mutedColor}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleCreate}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Creating..." : "Create Punch Item"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
