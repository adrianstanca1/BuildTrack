import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTimesheetsStore } from "../../stores/timesheetsStore";
import { COLORS } from "@/constants/theme";
import type { TimesheetStatus } from "../../types/field";

const STATUSES: TimesheetStatus[] = ["submitted", "approved", "rejected", "paid"];
const statusLabel = (s: TimesheetStatus) => s.charAt(0).toUpperCase() + s.slice(1);
const statusColor = (s: TimesheetStatus) => {
  switch (s) {
    case "submitted": return "#2563eb";
    case "approved": return "#059669";
    case "rejected": return "#dc2626";
    case "paid": return "#7c3aed";
    default: return "#9ca3af";
  }
};

export default function EditTimesheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { timesheets, updateTimesheet, deleteTimesheet } = useTimesheetsStore();
  const item = timesheets.find((t) => t.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [date, setDate] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [status, setStatus] = useState<TimesheetStatus>("submitted");
  const [workDescription, setWorkDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setWorkerName(item.workerName || "");
      setWorkerRole(item.workerRole || "");
      setDate(item.date || "");
      setHoursWorked(item.hoursWorked?.toString() || "");
      setOvertimeHours(item.overtimeHours?.toString() || "");
      setHourlyRate(item.hourlyRate?.toString() || "");
      setOvertimeRate(item.overtimeRate?.toString() || "");
      setStatus(item.status);
      setWorkDescription(item.workDescription || "");
      setNotes(item.notes || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Timesheet not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: "#2563eb" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!workerName.trim()) { Alert.alert("Error", "Worker name is required"); return; }
    setLoading(true);
    try {
      await updateTimesheet(id as string, {
        workerName: workerName.trim(),
        workerRole: workerRole.trim() || undefined,
        date: date.trim() || undefined,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : undefined,
        overtimeHours: overtimeHours ? parseFloat(overtimeHours) : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
        status,
        workDescription: workDescription.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert("Success", "Timesheet updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update timesheet");
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert("Delete Timesheet", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteTimesheet(id as string); router.back(); } },
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={textColor} /></TouchableOpacity>
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Timesheet</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Worker Name</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Worker name" placeholderTextColor={mutedColor} value={workerName} onChangeText={setWorkerName} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Worker Role</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="e.g. Electrician" placeholderTextColor={mutedColor} value={workerRole} onChangeText={setWorkerRole} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Date</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="YYYY-MM-DD" placeholderTextColor={mutedColor} value={date} onChangeText={setDate} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Hours Worked</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="8" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={hoursWorked} onChangeText={setHoursWorked} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Overtime Hours</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="0" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={overtimeHours} onChangeText={setOvertimeHours} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Hourly Rate</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="25.00" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={hourlyRate} onChangeText={setHourlyRate} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Overtime Rate</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="37.50" placeholderTextColor={mutedColor} keyboardType="decimal-pad" value={overtimeRate} onChangeText={setOvertimeRate} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderStatusOptions()}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Work Description</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Describe work performed..." placeholderTextColor={mutedColor} multiline value={workDescription} onChangeText={setWorkDescription} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Notes</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }} placeholder="Notes..." placeholderTextColor={mutedColor} multiline value={notes} onChangeText={setNotes} />
        </View>

        <TouchableOpacity className="p-4 rounded-xl items-center mb-4" style={{ backgroundColor: loading || !workerName.trim() ? "#9ca3af" : "#2563eb" }} onPress={handleUpdate} disabled={loading || !workerName.trim()}>
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Timesheet"}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-4 rounded-xl items-center" style={{ backgroundColor: "#dc2626" }} onPress={handleDelete}>
          <Text className="text-white font-semibold">Delete Timesheet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
