import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMaterialsStore } from "../../stores/materialsStore";
import { COLORS } from "@/constants/theme";

const CATEGORIES = ["concrete", "steel", "timber", "brick", "block", "insulation", "roofing", "electrical", "plumbing", "paint", "hardware", "aggregate", "other"] as const;
const catLabel = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

export default function EditMaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { materials, updateMaterial, deleteMaterial } = useMaterialsStore();
  const item = materials.find((m) => m.id === id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [quantityOnHand, setQuantityOnHand] = useState("");
  const [quantityOrdered, setQuantityOrdered] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [reorderQuantity, setReorderQuantity] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const bg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setCategory(item.category || "other");
      setUnit(item.unit || "");
      setUnitCost(item.unitCost?.toString() || "");
      setQuantityOnHand(item.quantityOnHand?.toString() || "");
      setQuantityOrdered(item.quantityOrdered?.toString() || "");
      setReorderLevel(item.reorderLevel?.toString() || "");
      setReorderQuantity(item.reorderQuantity?.toString() || "");
      setSupplierName(item.supplierName || "");
      setLocation(item.location || "");
      setNotes(item.notes || "");
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }} className="justify-center items-center">
        <Text style={{ color: mutedColor }}>Material not found</Text>
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
      await updateMaterial(id as string, {
        name: name.trim(),
        category: category as any,
        unit: unit.trim() || undefined,
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
        quantityOnHand: quantityOnHand ? parseFloat(quantityOnHand) : undefined,
        quantityOrdered: quantityOrdered ? parseFloat(quantityOrdered) : undefined,
        reorderLevel: reorderLevel ? parseFloat(reorderLevel) : undefined,
        reorderQuantity: reorderQuantity ? parseFloat(reorderQuantity) : undefined,
        supplierName: supplierName.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert("Success", "Material updated");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update material");
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert("Delete Material", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteMaterial(id as string); router.back(); } },
    ]);
  };

  const TextField = ({ label, value, onChange, placeholder, keyboard = "default", multiline = false }: any) => (
    <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
      <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>{label}</Text>
      <TextInput
        className="p-3 rounded-lg border"
        style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor, ...(multiline ? { height: 100, textAlignVertical: "top" } : {}) }}
        placeholder={placeholder}
        placeholderTextColor={mutedColor}
        keyboardType={keyboard}
        multiline={multiline}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={textColor} /></TouchableOpacity>
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>Edit Material</Text>
        </View>

        <TextField label="Name" value={name} onChange={setName} placeholder="Material name" />

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: bg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((opt) => {
              const active = category === opt;
              return (
                <TouchableOpacity key={opt} onPress={() => setCategory(opt)} className="px-3 py-2 rounded-lg border" style={{ borderColor: active ? "#2563eb" : isDark ? "#374151" : "#e5e7eb", backgroundColor: active ? "#2563eb20" : "transparent" }}>
                  <Text style={{ color: active ? "#2563eb" : textColor, fontWeight: active ? "600" : "400" }}>{catLabel(opt)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TextField label="Unit" value={unit} onChange={setUnit} placeholder="e.g. kg, m², units" />
        <TextField label="Unit Cost" value={unitCost} onChange={setUnitCost} placeholder="0.00" keyboard="decimal-pad" />
        <TextField label="Quantity On Hand" value={quantityOnHand} onChange={setQuantityOnHand} placeholder="0" keyboard="decimal-pad" />
        <TextField label="Quantity Ordered" value={quantityOrdered} onChange={setQuantityOrdered} placeholder="0" keyboard="decimal-pad" />
        <TextField label="Reorder Level" value={reorderLevel} onChange={setReorderLevel} placeholder="0" keyboard="decimal-pad" />
        <TextField label="Reorder Quantity" value={reorderQuantity} onChange={setReorderQuantity} placeholder="0" keyboard="decimal-pad" />
        <TextField label="Supplier" value={supplierName} onChange={setSupplierName} placeholder="Supplier name" />
        <TextField label="Location" value={location} onChange={setLocation} placeholder="Storage location" />
        <TextField label="Notes" value={notes} onChange={setNotes} placeholder="Additional notes..." multiline />

        <TouchableOpacity className="p-4 rounded-xl items-center mb-4" style={{ backgroundColor: loading || !name.trim() ? "#9ca3af" : "#2563eb" }} onPress={handleUpdate} disabled={loading || !name.trim()}>
          <Text className="text-white font-semibold">{loading ? "Saving..." : "Update Material"}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-4 rounded-xl items-center" style={{ backgroundColor: "#dc2626" }} onPress={handleDelete}>
          <Text className="text-white font-semibold">Delete Material</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
