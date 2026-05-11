import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDrawingsStore } from "../../stores/drawingsStore";
import { COLORS } from "@/constants/theme";
import type { DrawingStatus } from "../../types/field";

const STATUSES: DrawingStatus[] = ["active", "superseded", "archived"];

const statusLabel = (s: DrawingStatus) => s.charAt(0).toUpperCase() + s.slice(1);

const statusColor = (s: DrawingStatus) => {
  switch (s) {
    case "active": return "#059669";
    case "superseded": return "#d97706";
    case "archived": return "#6b7280";
    default: return "#9ca3af";
  }
};

const DISCIPLINES = ["architectural", "structural", "mechanical", "electrical", "plumbing", "civil"] as const;

export default function EditDrawingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { drawings, updateDrawing, deleteDrawing } = useDrawingsStore();
  const item = drawings.find((i) => i.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<DrawingStatus>("active");
  const [revision, setRevision] = useState("");
  const [discipline, setDiscipline] = useState<string>("architectural");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setStatus(item.status);
      setRevision(item.revision || "");
      setDiscipline(item.discipline);
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Drawing not found</Text>
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
      await updateDrawing(id as string, {
        title: title.trim(),
        status,
        revision: revision.trim() || undefined,
        discipline: discipline as "architectural" | "structural" | "mechanical" | "electrical" | "plumbing" | "civil",
      });
      Alert.alert("Success", "Drawing updated");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update drawing");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Drawing",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDrawing(id as string);
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Drawing</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Drawing title"
            placeholderTextColor={mutedColor}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Discipline</Text>
          {renderOptions(DISCIPLINES, discipline as any, (v) => setDiscipline(v), () => "#2563eb", (v) => v.charAt(0).toUpperCase() + v.slice(1))}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Revision</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="A, B, C..."
            placeholderTextColor={mutedColor}
            value={revision}
            onChangeText={setRevision}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Drawing"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete Drawing</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
