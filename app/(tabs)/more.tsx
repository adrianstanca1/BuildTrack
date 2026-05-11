import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  badge?: number;
  color?: string;
}

const FEATURES: MenuItem[] = [
  { icon: "wallet", label: "Budget", route: "/budget" },
  { icon: "clipboard", label: "Daily Reports", route: "/daily-reports" },
  { icon: "bug", label: "Defects", route: "/defects" },
  { icon: "document", label: "Drawings", route: "/drawings" },
  { icon: "construct", label: "Equipment", route: "/equipment" },
  { icon: "receipt", label: "Invoices", route: "/invoices" },
  { icon: "cube", label: "Materials", route: "/materials" },
  { icon: "people", label: "Meetings", route: "/meetings" },
  { icon: "shield-checkmark", label: "Permits", route: "/permits" },
  { icon: "hammer", label: "Punch Items", route: "/punch-items" },
  { icon: "cart", label: "Purchase Orders", route: "/purchase-orders" },
  { icon: "chatbubble-ellipses", label: "RFIs", route: "/rfis" },
  { icon: "image", label: "Site Photos", route: "/site-photos" },
  { icon: "archive", label: "Submittals", route: "/submittals" },
  { icon: "time", label: "Timesheets", route: "/timesheets" },
];

export default function MoreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: isDark ? "#111827" : "#f3f4f6" }}
    >
      <View className="px-4 pt-6 pb-4">
        <Text variant="h2" className="text-2xl font-bold mb-1">
          More
        </Text>
        <Text className="text-sm text-gray-500">
          {FEATURES.length} features
        </Text>
      </View>

      <View className="px-4">
        {FEATURES.map((item) => (
          <TouchableOpacity
            key={item.route}
            className="flex-row items-center mb-3 p-4 rounded-xl"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
            onPress={() => router.push(item.route)}
          >
            <View
              className="w-10 h-10 rounded-lg items-center justify-center mr-3"
              style={{
                backgroundColor: item.color || (isDark ? "#374151" : "#eff6ff"),
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.color ? "#ffffff" : isDark ? "#60a5fa" : "#2563eb"}
              />
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-base">{item.label}</Text>
            </View>

            <View className="flex-row items-center">
              {item.badge != null && item.badge > 0 && (
                <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center mr-2 px-1">
                  <Text className="text-white text-xs font-bold">
                    {item.badge > 99 ? "99+" : item.badge}
                  </Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
