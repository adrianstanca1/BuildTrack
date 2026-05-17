import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDailyReportsStore } from "../../stores/dailyReportsStore";
import { COLORS } from "@/constants/theme";
import type { DailyReportStatus } from "../../stores/dailyReportsStore";

const STATUSES: DailyReportStatus[] = ["draft", "submitted", "approved"];
const statusLabel = (s: DailyReportStatus) => s.charAt(0).toUpperCase() + s.slice(1);
const statusColor = (s: DailyReportStatus) => {
  switch (s) {
    case "draft": return "#6b7280";
    case "submitted": return "#2563eb";
    case "approved": return "#059669";
    default: return "#9ca3af";
  }
};

export default function EditDailyReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reports, updateReport, deleteReport } = useDailyReportsStore();
  const item = reports.find((r) => r.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [status, setStatus] = useState<DailyReportStatus>("draft");
  const [weather, setWeather] = useState("");
  const [temperature, setTemperature] = useState("");
  const [workersOnSite, setWorkersOnSite] = useState("");
  const [workCompleted, setWorkCompleted] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [issuesDelays, setIssuesDelays] = useState("");
  const [safetyObservations, setSafetyObservations] = useState("");
  const [nextDayPlan, setNextDayPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setStatus(item.status);
      setWeather(item.weather || "");
      setTemperature(item.temperature?.toString() || "");
      setWorkersOnSite(item.workersOnSite?.toString() || "");
      setWorkCompleted(item.workCompleted || "");
      setMaterialsUsed(item.materialsUsed || "");
      setEquipmentUsed(item.equipmentUsed || "");
      setIssuesDelays(item.issuesDelays || "");
      setSafetyObservations(item.safetyObservations || "");
      setNextDayPlan(item.nextDayPlan || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Report not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: "#2563eb" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateReport(id as string, {
        status,
        weather: weather.trim() || undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        workersOnSite: workersOnSite ? parseInt(workersOnSite, 10) : undefined,
        workCompleted: workCompleted.trim() || undefined,
        materialsUsed: materialsUsed.trim() || undefined,
        equipmentUsed: equipmentUsed.trim() || undefined,
        issuesDelays: issuesDelays.trim() || undefined,
        safetyObservations: safetyObservations.trim() || undefined,
        nextDayPlan: nextDayPlan.trim() || undefined,
      });
      Alert.alert("Success", "Report updated");
      router.back();
    } catch (_err) {
      Alert.alert("Error", "Failed to update report");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Report",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteReport(id as string);
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Daily Report</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Weather</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="e.g. Sunny, 22°C"
            placeholderTextColor={mutedColor}
            value={weather}
            onChangeText={setWeather}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Temperature (°C)</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="22"
            placeholderTextColor={mutedColor}
            keyboardType="decimal-pad"
            value={temperature}
            onChangeText={setTemperature}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Workers On Site</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="12"
            placeholderTextColor={mutedColor}
            keyboardType="number-pad"
            value={workersOnSite}
            onChangeText={setWorkersOnSite}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Work Completed</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Describe work completed today..."
            placeholderTextColor={mutedColor}
            multiline
            value={workCompleted}
            onChangeText={setWorkCompleted}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Materials Used</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="List materials used..."
            placeholderTextColor={mutedColor}
            multiline
            value={materialsUsed}
            onChangeText={setMaterialsUsed}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Equipment Used</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="List equipment used..."
            placeholderTextColor={mutedColor}
            multiline
            value={equipmentUsed}
            onChangeText={setEquipmentUsed}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Issues / Delays</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Any issues or delays?"
            placeholderTextColor={mutedColor}
            multiline
            value={issuesDelays}
            onChangeText={setIssuesDelays}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Safety Observations</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Safety notes..."
            placeholderTextColor={mutedColor}
            multiline
            value={safetyObservations}
            onChangeText={setSafetyObservations}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Next Day Plan</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, height: 100, textAlignVertical: "top" }}
            placeholder="Plan for tomorrow..."
            placeholderTextColor={mutedColor}
            multiline
            value={nextDayPlan}
            onChangeText={setNextDayPlan}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Report"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
