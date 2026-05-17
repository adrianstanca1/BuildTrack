import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubmittalsStore } from "../../stores/submittalsStore";
import { COLORS } from "@/constants/theme";
import type { SubmittalStatus } from "../../types/field";

const STATUSES: SubmittalStatus[] = ["draft", "submitted", "under-review", "approved", "rejected"];
const TYPES = ["material", "shop-drawing", "product-data", "sample", "mockup", "other"] as const;

const statusLabel = (s: SubmittalStatus) => {
  switch (s) {
    case "under-review": return "Under Review";
    default: return s.charAt(0).toUpperCase() + s.slice(1);
  }
};
const typeLabel = (s: string) => s.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());

const statusColor = (s: SubmittalStatus) => {
  switch (s) {
    case "draft": return "#6b7280";
    case "submitted": return "#2563eb";
    case "under-review": return "#d97706";
    case "approved": return "#059669";
    case "rejected": return "#dc2626";
    default: return "#9ca3af";
  }
};
const typeColor = (s: string) => "#2563eb";

export default function EditSubmittalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { submittals, updateSubmittal, deleteSubmittal } = useSubmittalsStore();
  const item = submittals.find((i) => i.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<SubmittalStatus>("draft");
  const [type, setType] = useState<string>("material");
  const [specSection, setSpecSection] = useState("");
  const [reviewedBy, setReviewedBy] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setStatus(item.status);
      setType(item.type);
      setSpecSection(item.specSection || "");
      setReviewedBy(item.reviewedBy || "");
      setReviewDate(item.reviewDate || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Submittal not found</Text>
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
      await updateSubmittal(id as string, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        type: type as "material" | "shop-drawing" | "product-data" | "sample" | "mockup" | "other",
        specSection: specSection.trim() || undefined,
        reviewedBy: reviewedBy.trim() || undefined,
        reviewDate: reviewDate.trim() || undefined,
      });
      Alert.alert("Success", "Submittal updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update submittal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Submittal",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteSubmittal(id as string);
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Submittal</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Submittal title"
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
            placeholder="Describe the submittal..."
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
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Type</Text>
          {renderOptions(TYPES, type as any, (v) => setType(v), typeColor, typeLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Spec Section</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="e.g. 033000"
            placeholderTextColor={mutedColor}
            value={specSection}
            onChangeText={setSpecSection}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Reviewed By</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Reviewer name"
            placeholderTextColor={mutedColor}
            value={reviewedBy}
            onChangeText={setReviewedBy}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Review Date</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mutedColor}
            value={reviewDate}
            onChangeText={setReviewDate}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Submittal"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete Submittal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
