import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRfisStore } from "../../stores/rfisStore";
import { COLORS } from "@/constants/theme";
import type { RfiStatus } from "../../types/field";

const STATUSES: RfiStatus[] = ["draft", "submitted", "open", "answered", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

const statusLabel = (s: RfiStatus) => s.charAt(0).toUpperCase() + s.slice(1);
const priorityLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const statusColor = (s: RfiStatus) => {
  switch (s) {
    case "draft": return "#6b7280";
    case "submitted": return "#2563eb";
    case "open": return "#d97706";
    case "answered": return "#059669";
    case "closed": return "#7c3aed";
    default: return "#9ca3af";
  }
};
const priorityColor = (s: string) => {
  switch (s) {
    case "low": return "#6b7280";
    case "medium": return "#d97706";
    case "high": return "#dc2626";
    case "urgent": return "#7f1d1d";
    default: return "#9ca3af";
  }
};

export default function EditRfiScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rfis, updateRfi, deleteRfi } = useRfisStore();
  const item = rfis.find((i) => i.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<RfiStatus>("draft");
  const [priority, setPriority] = useState<string>("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setQuestion(item.question || "");
      setAnswer(item.answer || "");
      setStatus(item.status);
      setPriority(item.priority);
      setAssignedTo(item.assignedTo || "");
      setDueDate(item.dueDate || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>RFI not found</Text>
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
      await updateRfi(id as string, {
        title: title.trim(),
        question: question.trim() || undefined,
        answer: answer.trim() || undefined,
        status,
        priority: priority as "low" | "medium" | "high" | "urgent",
        assignedTo: assignedTo.trim() || undefined,
        dueDate: dueDate.trim() || undefined,
      });
      Alert.alert("Success", "RFI updated");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update RFI");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete RFI",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteRfi(id as string);
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit RFI</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="RFI title"
            placeholderTextColor={mutedColor}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Question</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="What is the question?"
            placeholderTextColor={mutedColor}
            multiline
            value={question}
            onChangeText={setQuestion}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Answer</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Response..."
            placeholderTextColor={mutedColor}
            multiline
            value={answer}
            onChangeText={setAnswer}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Priority</Text>
          {renderOptions(PRIORITIES, priority as any, (v) => setPriority(v), priorityColor, priorityLabel)}
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

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading || !title.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update RFI"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete RFI</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
