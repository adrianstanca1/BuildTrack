import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

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
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const cardBg = isDark ? COLORS.dark.card : COLORS.light.card;
  const iconBg = isDark ? "#1e3a5f" : "#eff6ff";
  const iconColor = isDark ? "#60a5fa" : "#2563eb";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: textColor, marginBottom: 4 }}>More</Text>
        <Text style={{ fontSize: 14, color: mutedColor }}>{FEATURES.length} features</Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {FEATURES.map((item) => (
          <TouchableOpacity
            key={item.route}
            onPress={() => router.push(item.route)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 12,
              backgroundColor: cardBg,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: iconBg,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}>
              <Ionicons name={item.icon} size={20} color={iconColor} />
            </View>

            <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: textColor }}>{item.label}</Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {item.badge != null && item.badge > 0 && (
                <View style={{
                  backgroundColor: "#ef4444",
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                  paddingHorizontal: 4,
                }}>
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{item.badge > 99 ? "99+" : item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
