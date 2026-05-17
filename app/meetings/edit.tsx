import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMeetingsStore } from "../../stores/meetingsStore";
import { COLORS } from "@/constants/theme";
import type { MeetingStatus } from "../../types/field";

const STATUSES: MeetingStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];
const TYPES = ["safety_toolbox", "standup", "client_walkthrough", "change_order", "quality_review", "progress_review", "closeout", "other"] as const;
const statusLabel = (s: MeetingStatus) => s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
const typeLabel = (t: string) => t.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
const statusColor = (s: MeetingStatus) => {
  switch (s) {
    case "scheduled": return "#2563eb";
    case "in_progress": return "#d97706";
    case "completed": return "#059669";
    case "cancelled": return "#dc2626";
    default: return "#9ca3af";
  }
};

export default function EditMeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meetings, updateMeeting, deleteMeeting } = useMeetingsStore();
  const item = meetings.find((m) => m.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState<string>("other");
  const [status, setStatus] = useState<MeetingStatus>("scheduled");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [location, setLocation] = useState("");
  const [agenda, setAgenda] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setMeetingType(item.meetingType || "other");
      setStatus(item.status);
      setScheduledAt(item.scheduledAt || "");
      setDurationMinutes(item.durationMinutes?.toString() || "");
      setLocation(item.location || "");
      setAgenda(item.agenda || "");
      setNotes(item.notes || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Meeting not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: "#2563eb" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!title.trim()) { Alert.alert("Error", "Title is required"); return; }
    setLoading(true);
    try {
      await updateMeeting(id as string, {
        title: title.trim(),
        meetingType: meetingType as any,
        status,
        scheduledAt: scheduledAt.trim() || undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        location: location.trim() || undefined,
        agenda: agenda.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert("Success", "Meeting updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update meeting");
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert("Delete Meeting", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteMeeting(id as string); router.back(); } },
    ]);
  };

  const renderStatusOptions = () => (
    <View className="flex-row flex-wrap gap-2">
      {STATUSES.map((opt) => {
        const active = status === opt;
        return (
          <TouchableOpacity key={opt} onPress={() => setStatus(opt)} className="px-3 py-2 rounded-lg border" style={{ borderColor: active ? statusColor(opt) : isDark ? "#374151" : "#e5e7eb", backgroundColor: active ? statusColor(opt) + "20" : "transparent" }}>
            <Text style={{ color: active ? statusColor(opt) : textColor, fontWeight: active ? "600" : "400" }}>{statusLabel(opt)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderTypeOptions = () => (
    <View className="flex-row flex-wrap gap-2">
      {TYPES.map((opt) => {
        const active = meetingType === opt;
        return (
          <TouchableOpacity key={opt} onPress={() => setMeetingType(opt)} className="px-3 py-2 rounded-lg border" style={{ borderColor: active ? "#2563eb" : isDark ? "#374151" : "#e5e7eb", backgroundColor: active ? "#2563eb20" : "transparent" }}>
            <Text style={{ color: active ? "#2563eb" : textColor, fontWeight: active ? "600" : "400" }}>{typeLabel(opt)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={textColor} /></TouchableOpacity>
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Meeting</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Title</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Meeting title" placeholderTextColor={mutedColor} value={title} onChangeText={setTitle} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Type</Text>
          {renderTypeOptions()}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderStatusOptions()}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Scheduled At</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="YYYY-MM-DD HH:MM" placeholderTextColor={mutedColor} value={scheduledAt} onChangeText={setScheduledAt} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Duration (min)</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="30" placeholderTextColor={mutedColor} keyboardType="number-pad" value={durationMinutes} onChangeText={setDurationMinutes} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Location</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Meeting location" placeholderTextColor={mutedColor} value={location} onChangeText={setLocation} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Agenda</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Meeting agenda..." placeholderTextColor={mutedColor} multiline value={agenda} onChangeText={setAgenda} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Notes</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Meeting notes..." placeholderTextColor={mutedColor} multiline value={notes} onChangeText={setNotes} />
        </View>

        <TouchableOpacity className="p-4 rounded-xl items-center mb-4" style={{ backgroundColor: loading || !title.trim() ? "#9ca3af" : "#2563eb" }} onPress={handleUpdate} disabled={loading || !title.trim()}>
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Meeting"}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-4 rounded-xl items-center" style={{ backgroundColor: "#dc2626" }} onPress={handleDelete}>
          <Text className="text-white font-semibold">Delete Meeting</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
