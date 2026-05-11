import React from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const item = { id } as any;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-4">
        <Text className="text-2xl font-bold mb-4">Detail {id}</Text>
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-gray-500">Detail view placeholder</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
