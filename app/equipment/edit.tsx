import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEquipmentStore } from "../../stores/equipmentStore";
import { COLORS } from "@/constants/theme";
import type { EquipmentType, EquipmentStatus } from "../../types/field";

const STATUSES: EquipmentStatus[] = ["available", "rented", "on_site", "under_maintenance", "out_of_service", "retired"];
const TYPES: EquipmentType[] = ["excavator", "bulldozer", "crane", "loader", "dump_truck", "mixer", "generator", "scaffold", "scissor_lift", "forklift", "compactor", "other"];
const statusLabel = (s: EquipmentStatus) => s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
const typeLabel = (t: EquipmentType) => t.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
const statusColor = (s: EquipmentStatus) => {
  switch (s) {
    case "available": return "#059669";
    case "rented": return "#2563eb";
    case "on_site": return "#7c3aed";
    case "under_maintenance": return "#d97706";
    case "out_of_service": return "#dc2626";
    case "retired": return "#6b7280";
    default: return "#9ca3af";
  }
};

export default function EditEquipmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { equipment, updateEquipment, deleteEquipment } = useEquipmentStore();
  const item = equipment.find((e) => e.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [name, setName] = useState("");
  const [type, setType] = useState<EquipmentType>("other");
  const [status, setStatus] = useState<EquipmentStatus>("available");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setType(item.type);
      setStatus(item.status);
      setMake(item.make || "");
      setModel(item.model || "");
      setSerialNumber(item.serialNumber || "");
      setYear(item.year?.toString() || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Equipment not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: "#2563eb" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!name.trim()) { Alert.alert("Error", "Name is required"); return; }
    setLoading(true);
    try {
      await updateEquipment(id as string, {
        name: name.trim(),
        type,
        status,
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        year: year ? parseInt(year, 10) : undefined,
      });
      Alert.alert("Success", "Equipment updated");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update equipment");
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert("Delete Equipment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteEquipment(id as string); router.back(); } },
    ]);
  };

  const renderOptions = <T extends string>(options: readonly T[], selected: T, setter: (v: T) => void, colorFn: (v: T) => string, labelFn: (v: T) => string) => (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <TouchableOpacity key={opt} onPress={() => setter(opt)} className="px-3 py-2 rounded-lg border" style={{ borderColor: active ? colorFn(opt) : isDark ? "#374151" : "#e5e7eb", backgroundColor: active ? colorFn(opt) + "20" : "transparent" }}>
            <Text style={{ color: active ? colorFn(opt) : textColor, fontWeight: active ? "600" : "400" }}>{labelFn(opt)}</Text>
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
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Equipment</Text>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Name</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Equipment name" placeholderTextColor={mutedColor} value={name} onChangeText={setName} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Type</Text>
          {renderOptions(TYPES, type, setType, () => "#2563eb", typeLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Status</Text>
          {renderOptions(STATUSES, status, setStatus, statusColor, statusLabel)}
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Make</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Manufacturer" placeholderTextColor={mutedColor} value={make} onChangeText={setMake} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Model</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Model" placeholderTextColor={mutedColor} value={model} onChangeText={setModel} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Serial Number</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="Serial number" placeholderTextColor={mutedColor} value={serialNumber} onChangeText={setSerialNumber} />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Year</Text>
          <TextInput className="p-3 rounded-lg border" style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }} placeholder="2024" placeholderTextColor={mutedColor} keyboardType="number-pad" value={year} onChangeText={setYear} />
        </View>

        <TouchableOpacity className="p-4 rounded-xl items-center mb-4" style={{ backgroundColor: loading || !name.trim() ? "#9ca3af" : "#2563eb" }} onPress={handleUpdate} disabled={loading || !name.trim()}>
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Equipment"}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-4 rounded-xl items-center" style={{ backgroundColor: "#dc2626" }} onPress={handleDelete}>
          <Text className="text-white font-semibold">Delete Equipment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
