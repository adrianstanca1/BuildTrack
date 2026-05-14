import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/db';

export default function CreateSitePhotoScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string | null>(null);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('projects').select('id, name').order('name');
        if (error) throw error;
        const list = (data as { id: string; name: string }[]) || [];
        setProjects(list);
        if (list.length > 0) setProjectId(list[0].id);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to continue.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setPhotoMime(result.assets[0].mimeType || 'image/jpeg');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setPhotoMime(result.assets[0].mimeType || 'image/jpeg');
    }
  };

  const handleCreate = async () => {
    if (!caption.trim()) {
      Alert.alert('Required', 'Please enter a caption.');
      return;
    }
    if (!projectId) {
      Alert.alert('Required', 'Please select a project.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    try {
      let photo_url: string | undefined;

      if (photoUri) {
        setUploadProgress(30);
        const { url } = await uploadFile('buildtrack-photos', photoUri, photoMime || undefined);
        setUploadProgress(70);
        photo_url = url;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      const project = projects.find((p) => p.id === projectId);

      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const { error } = await supabase.from('site_photos').insert({
        caption: caption.trim(),
        project_id: projectId,
        project_name: project?.name || '',
        location: location.trim() || null,
        tags: tagList.length > 0 ? tagList : null,
        photo_url: photo_url || null,
        uploaded_by: user?.email || user?.id || 'Unknown',
      });

      if (error) throw error;

      setUploadProgress(100);
      Alert.alert('Success', 'Site photo created');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create photo.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text className="text-xl font-bold ml-4" style={{ color: theme.text }}>New Site Photo</Text>
        </View>

        {photoUri ? (
          <View className="relative mb-4">
            <Image source={{ uri: photoUri }} className="w-full h-56 rounded-xl" resizeMode="cover" />
            <Pressable
              onPress={() => { setPhotoUri(null); setPhotoMime(null); }}
              className="absolute top-2 right-2 rounded-full p-1.5"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <Ionicons name="close" size={18} color="white" />
            </Pressable>
          </View>
        ) : (
          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={takePhoto}
              className="flex-1 items-center justify-center p-6 rounded-xl border-2 border-dashed"
              style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg }}
            >
              <Ionicons name="camera" size={28} color={theme.textMuted} />
              <Text className="text-sm mt-2 font-medium" style={{ color: theme.textMuted }}>Camera</Text>
            </Pressable>
            <Pressable
              onPress={pickImage}
              className="flex-1 items-center justify-center p-6 rounded-xl border-2 border-dashed"
              style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg }}
            >
              <Ionicons name="images" size={28} color={theme.textMuted} />
              <Text className="text-sm mt-2 font-medium" style={{ color: theme.textMuted }}>Gallery</Text>
            </Pressable>
          </View>
        )}

        <View className="rounded-xl mb-4" style={{ backgroundColor: theme.surface }}>
          <View className="p-4">
            <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>Project *</Text>
            {loadingProjects ? (
              <ActivityIndicator color={COLORS.primary[600]} />
            ) : projects.length === 0 ? (
              <Text style={{ color: theme.textMuted }}>No projects available</Text>
            ) : (
              <View className="flex-row flex-wrap">
                {projects.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setProjectId(p.id)}
                    className="mr-2 mb-2 px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: selectedProject?.id === p.id ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: selectedProject?.id === p.id ? '#fff' : theme.textSecondary }}
                    >
                      {p.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        <View className="rounded-xl mb-4" style={{ backgroundColor: theme.surface }}>
          <View className="p-4">
            <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>Caption *</Text>
            <TextInput
              className="p-3 rounded-lg border text-base"
              style={{ borderColor: theme.inputBorder, color: theme.text, backgroundColor: theme.inputBg }}
              placeholder="Caption / title"
              placeholderTextColor={theme.placeholder}
              value={caption}
              onChangeText={setCaption}
            />
          </View>
        </View>

        <View className="rounded-xl mb-4" style={{ backgroundColor: theme.surface }}>
          <View className="p-4">
            <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>Location</Text>
            <TextInput
              className="p-3 rounded-lg border text-base"
              style={{ borderColor: theme.inputBorder, color: theme.text, backgroundColor: theme.inputBg }}
              placeholder="e.g. Level 3, East Wing"
              placeholderTextColor={theme.placeholder}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <View className="rounded-xl mb-4" style={{ backgroundColor: theme.surface }}>
          <View className="p-4">
            <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>Tags (comma separated)</Text>
            <TextInput
              className="p-3 rounded-lg border text-base"
              style={{ borderColor: theme.inputBorder, color: theme.text, backgroundColor: theme.inputBg }}
              placeholder="Progress, Safety, Quality..."
              placeholderTextColor={theme.placeholder}
              value={tags}
              onChangeText={setTags}
            />
          </View>
        </View>

        {submitting && (
          <View className="mb-4">
            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${uploadProgress}%`, backgroundColor: COLORS.primary[600] }}
              />
            </View>
            <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              {uploadProgress < 100 ? 'Uploading...' : 'Saving...'}
            </Text>
          </View>
        )}

        <Pressable
          className="p-4 rounded-xl items-center mb-8"
          style={{
            backgroundColor: submitting || !caption.trim() ? '#9ca3af' : COLORS.primary[600],
          }}
          onPress={handleCreate}
          disabled={submitting || !caption.trim()}
        >
          <Text className="text-white font-semibold">
            {submitting ? 'Creating...' : 'Create Site Photo'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
