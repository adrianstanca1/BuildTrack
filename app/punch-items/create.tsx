import React, { useState } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

export default function CreatePunchItemScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    // API call placeholder
    setLoading(false);
    router.back();
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

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Severity</Text>
          {["minor", "major", "critical"].map((s) => (
            <TouchableOpacity
              key={s}
              className="flex-row items-center p-3 rounded-lg mb-2 border"
              style={{ borderColor: severity === s ? "#2563eb" : isDark ? "#374151" : "#e5e7eb", backgroundColor: severity === s ? "#eff6ff" : bg }}
              onPress={() => setSeverity(s)}
            >
              <Ionicons name={severity === s ? "radio-button-on" : "radio-button-off"} size={20} color="#2563eb" />
              <Text className="ml-2 capitalize" style={{ color: textColor }}>{s}</Text>
            </TouchableOpacity>
          ))}
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
          style={{ backgroundColor: loading ? "#9ca3af" : "#2563eb" }}
          onPress={handleCreate}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Creating..." : "Create Punch Item"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
