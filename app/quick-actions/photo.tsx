import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useProjectsStore } from '@/stores/projectsStore';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/api';

const TAGS = ['Progress', 'Issue', 'Before', 'After', 'Safety', 'Quality', 'Delivery'];

export default function QuickPhotoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { projects } = useProjectsStore();

  const [projectId, setProjectId] = useState<string>('');
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!photoUri) {
      Alert.alert('Required', 'Please add a photo');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.createSitePhoto({
        projectId: projectId || undefined,
        location: location.trim() || undefined,
        tags: selectedTags,
        caption: caption.trim() || undefined,
        photoUrl: photoUri,
      });
      Alert.alert('Saved', 'Photo uploaded', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload photo');
    } finally {
      setSubmitting(false);
    }
  }, [photoUri, projectId, location, selectedTags, caption, router]);

  const inputBase = {
    backgroundColor: COLORS.dark.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.dark.text,
    fontSize: TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      <View className="px-4 pt-2 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="close-outline" size={28} color={COLORS.dark.textMuted} />
        </Pressable>
        <Text className="text-white text-lg font-bold flex-1 text-center mr-11">Site Photo</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}>
        {/* Meta */}
        <View className="mb-4 flex-row items-center">
          <Ionicons name="time-outline" size={14} color={COLORS.dark.textMuted} />
          <Text className="text-[#64748b] text-xs ml-1.5">{now}</Text>
          <Text className="text-[#64748b] text-xs mx-2">·</Text>
          <Ionicons name="person-outline" size={14} color={COLORS.dark.textMuted} />
          <Text className="text-[#64748b] text-xs ml-1.5">
            {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
          </Text>
        </View>

        {/* Photo capture area */}
        <Pressable
          onPress={() => setPhotoUri(photoUri ? null : 'placeholder')}
          className="bg-[#1e293b] border-2 border-dashed border-[#334155] rounded-2xl items-center justify-center mb-5"
          style={{ height: 220 }}
        >
          {photoUri ? (
            <View className="items-center">
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
              <Text className="text-[#22c55e] mt-2 text-sm font-semibold">Photo captured</Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="bg-[#334155] rounded-full p-4 mb-3">
                <Ionicons name="camera" size={32} color={COLORS.dark.text} />
              </View>
              <Text className="text-white font-semibold text-base">Tap to capture photo</Text>
              <Text className="text-[#64748b] text-sm mt-1">Camera will open</Text>
            </View>
          )}
        </Pressable>

        {/* Project */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setProjectId('')}
              className={`px-4 py-2 rounded-xl border ${projectId === '' ? 'border-[#8b5cf6] bg-[#8b5cf6]/10' : 'border-[#334155] bg-[#1e293b]'}`}
            >
              <Text className={projectId === '' ? 'text-[#8b5cf6] font-semibold' : 'text-[#64748b]'}>None</Text>
            </Pressable>
            {projects.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setProjectId(p.id)}
                className={`px-4 py-2 rounded-xl border ${projectId === p.id ? 'border-[#8b5cf6] bg-[#8b5cf6]/10' : 'border-[#334155] bg-[#1e293b]'}`}
              >
                <Text className={projectId === p.id ? 'text-[#8b5cf6] font-semibold' : 'text-[#64748b]'} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Location */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Location</Text>
        <View className="flex-row items-center mb-4" style={[inputBase, { padding: 0 }]}>
          <Ionicons name="location-outline" size={16} color={COLORS.dark.textMuted} style={{ marginLeft: SPACING.md, marginRight: SPACING.sm }} />
          <TextInput
            className="flex-1 text-white py-3 pr-3"
            style={{ fontSize: TYPOGRAPHY.body.fontSize }}
            value={location}
            onChangeText={setLocation}
            placeholder="Where on site?"
            placeholderTextColor={COLORS.dark.textMuted}
          />
        </View>

        {/* Tags */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Tags</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full border ${active ? 'border-[#8b5cf6] bg-[#8b5cf6]/10' : 'border-[#334155] bg-[#1e293b]'}`}
              >
                <Text className={`text-xs font-semibold ${active ? 'text-[#8b5cf6]' : 'text-[#64748b]'}`}>{tag}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Caption */}
        <Text className="text-[#94a3b8] text-xs font-semibold mb-2 uppercase tracking-wide">Caption</Text>
        <TextInput
          style={[inputBase, { height: 80, textAlignVertical: 'top' }]}
          value={caption}
          onChangeText={setCaption}
          placeholder="Add a short caption..."
          placeholderTextColor={COLORS.dark.textMuted}
          multiline
        />

        <Button
          title="Upload Photo"
          onPress={handleSubmit}
          loading={submitting}
          variant="primary"
          style={{ marginTop: SPACING.lg }}
          iconLeft="cloud-upload"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
