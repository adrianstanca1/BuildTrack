import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "@/constants/theme";
import { useSitePhotosStore } from "@/stores/sitePhotosStore";
import { useProjectsStore } from "@/stores/projectsStore";

import { useAuth } from "@/contexts/AuthContext";

export default function CreateSitePhotoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const mutedColor = isDark ? COLORS.dark.textMuted : COLORS.light.textMuted;
  const cardBg = isDark ? COLORS.dark.surface : COLORS.light.surface;

  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const { createSitePhoto } = useSitePhotosStore();
  const { projects } = useProjectsStore();
  const [projectId, setProjectId] = useState("");

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to photos to continue.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow camera access to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const handleCreate = async () => {
    if (!caption.trim()) {
      Alert.alert("Required", "Please enter a photo title.");
      return;
    }
    setLoading(true);
    try {
      await createSitePhoto({
        caption: caption.trim(),
        location: location.trim() || undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        projectId: projectId || undefined,
        photoUrl: photoUri || "",
        uploadedBy: user?.id || "",
        projectName: projects.find((p) => p.id === projectId)?.name || "",
      });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4" style={{ color: textColor }}>New Site Photo</Text>
        </View>

        {photoUri ? (
          <View className="relative mb-4">
            <Image source={{ uri: photoUri }} className="w-full h-56 rounded-xl" resizeMode="cover" />
            <TouchableOpacity
              onPress={() => setPhotoUri(null)}
              className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
            >
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              onPress={takePhoto}
              className="flex-1 items-center justify-center p-6 rounded-xl border-2 border-dashed"
              style={{ borderColor: isDark ? "#334155" : "#cbd5e1", backgroundColor: cardBg }}
            >
              <Ionicons name="camera" size={28} color={mutedColor} />
              <Text className="text-sm mt-2 font-medium" style={{ color: mutedColor }}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickImage}
              className="flex-1 items-center justify-center p-6 rounded-xl border-2 border-dashed"
              style={{ borderColor: isDark ? "#334155" : "#cbd5e1", backgroundColor: cardBg }}
            >
              <Ionicons name="images" size={28} color={mutedColor} />
              <Text className="text-sm mt-2 font-medium" style={{ color: mutedColor }}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: cardBg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setProjectId("")}
                className={`px-3 py-1.5 rounded-lg ${projectId === "" ? "bg-blue-600" : "bg-gray-700"}`}
              >
                <Text className="text-white text-sm">None</Text>
              </TouchableOpacity>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setProjectId(p.id)}
                  className={`px-3 py-1.5 rounded-lg ${projectId === p.id ? "bg-blue-600" : "bg-gray-700"}`}
                >
                  <Text className="text-white text-sm">{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: cardBg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Caption *</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Caption / title"
            placeholderTextColor={mutedColor}
            value={caption}
            onChangeText={setCaption}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: cardBg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Location</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="e.g. Level 3, East Wing"
            placeholderTextColor={mutedColor}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: cardBg }}>
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>Tags (comma separated)</Text>
          <TextInput
            className="p-3 rounded-lg border"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: textColor }}
            placeholder="Progress, Safety, Quality..."
            placeholderTextColor={mutedColor}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        <TouchableOpacity
          className="p-4 rounded-xl items-center mb-6"
          style={{ backgroundColor: loading || !caption.trim() ? "#9ca3af" : "#2563eb" }}
          onPress={handleCreate}
          disabled={loading || !caption.trim()}
        >
          <Text className="text-white font-semibold">{loading ? "Creating..." : "Create Site Photo"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
