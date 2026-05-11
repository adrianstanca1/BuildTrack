import React from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/constants/theme";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  action?: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, signOut } = useAuth();
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const cardBg = isDark ? COLORS.dark.surface : COLORS.light.surface;
  const iconColor = isDark ? "#60a5fa" : "#2563eb";

  const menuItems: MenuItem[] = [
    { icon: "person-outline", label: "Edit Profile", route: "/settings" },
    { icon: "notifications-outline", label: "Notifications", route: "/notifications" },
    { icon: "shield-checkmark-outline", label: "Security", route: "/settings" },
    { icon: "help-circle-outline", label: "Help & Support", route: "/settings" },
    { icon: "document-text-outline", label: "Terms of Service", route: "/settings" },
    { icon: "log-out-outline", label: "Sign Out", action: () => signOut?.() },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <View style={{
        alignItems: "center",
        paddingTop: 32,
        paddingBottom: 24,
        backgroundColor: isDark ? "#1e3a5f" : "#eff6ff",
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: iconColor,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 32, fontWeight: "700", color: "#fff" }}>
            {user?.email?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: textColor }}>
          {user?.email || "Profile"}
        </Text>
        <Text style={{ fontSize: 14, color: mutedColor, marginTop: 4 }}>
          {user?.email || ""}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => {
              if (item.action) item.action();
              else if (item.route) router.push(item.route);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 12,
              backgroundColor: cardBg,
              marginBottom: 12,
            }}
          >
            <Ionicons name={item.icon} size={22} color={iconColor} style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 16, fontWeight: "500", color: textColor }}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={mutedColor} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
