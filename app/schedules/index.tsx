import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

export default function SchedulesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const cardBg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: textColor }}>Schedules</Text>
        <Text style={{ fontSize: 14, color: mutedColor, marginTop: 4 }}>Work schedules and shift planning</Text>
      </View>

      <View style={{
        marginHorizontal: 16,
        padding: 24,
        borderRadius: 12,
        backgroundColor: cardBg,
        alignItems: "center",
      }}>
        <Ionicons name="calendar" size={48} color={mutedColor} />
        <Text style={{
          fontSize: 18,
          fontWeight: "600",
          color: textColor,
          marginTop: 16,
          marginBottom: 8,
        }}>Coming Soon</Text>
        <Text style={{ fontSize: 14, color: mutedColor, textAlign: "center" }}>
          Schedule management will be available in a future update.
        </Text>
      </View>
    </ScrollView>
  );
}
