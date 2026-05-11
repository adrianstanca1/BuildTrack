import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTeamStore } from "../../stores/teamStore";
import { COLORS } from "@/constants/theme";
import type { WorkerRole, WorkerStatus } from "../../types/index";

const ROLES: WorkerRole[] = ["foreman", "electrician", "plumber", "carpenter", "mason", "laborer", "engineer", "safety-officer"];
const STATUSES: WorkerStatus[] = ["active", "off-duty", "on-leave"];

const roleLabel = (r: WorkerRole) => r.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
const statusLabel = (s: WorkerStatus) => s.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());

const roleColor = (r: WorkerRole) => "#2563eb";
const statusColor = (s: WorkerStatus) => {
  switch (s) {
    case "active": return "#059669";
    case "off-duty": return "#6b7280";
    case "on-leave": return "#d97706";
    default: return "#9ca3af";
  }
};

export default function EditTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workers, updateWorker, deleteWorker } = useTeamStore();
  const item = workers.find((w) => w.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [name, setName] = useState("");
  const [role, setRole] = useState<WorkerRole>("laborer");
  const [status, setStatus] = useState<WorkerStatus>("active");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setRole(item.role);
      setStatus(item.status);
      setPhone(item.phone || "");
      setEmail(item.email || "");
      setWeeklyHours(item.weeklyHours?.toString() || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Worker not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: "#2563eb" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setLoading(true);
    try {
      await updateWorker(id as string, {
        name: name.trim(),
        role,
        status,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        weeklyHours: weeklyHours ? parseFloat(weeklyHours) : undefined,
      });
      Alert.alert("Success", "Worker updated");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update worker");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Worker",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteWorker(id as string);
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Worker</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Name</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Full name"
            placeholderTextColor={mutedColor}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Role</Text>
          {renderOptions(ROLES, role, setRole, roleColor, roleLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Phone</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Phone number"
            placeholderTextColor={mutedColor}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Email</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Email address"
            placeholderTextColor={mutedColor}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Weekly Hours</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="40"
            placeholderTextColor={mutedColor}
            keyboardType="decimal-pad"
            value={weeklyHours}
            onChangeText={setWeeklyHours}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: loading || !name.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleUpdate}
          disabled={loading || !name.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Worker"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: "#dc2626" }}
          onPress={handleDelete}
        >
          <Text className="text-white font-semibold">Delete Worker</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
