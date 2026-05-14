import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/db';
import * as ImagePicker from 'expo-image-picker';

type Project = { id: string; name: string };

function detectFileType(uri: string, mimeType?: string | null): string {
  if (mimeType) {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('msword') || mimeType.includes('wordprocessingml')) return 'docx';
    if (mimeType.includes('text/plain')) return 'txt';
    if (mimeType.includes('image/png')) return 'png';
    if (mimeType.includes('image/jpeg') || mimeType.includes('image/jpg')) return 'jpg';
    if (mimeType.includes('image/webp')) return 'webp';
  }
  const ext = (uri.match(/\\.([a-zA-Z0-9]+)(\\?.*)?$/)?.[1] || '').toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc') return 'doc';
  if (ext === 'docx') return 'docx';
  if (ext === 'txt') return 'txt';
  if (ext === 'png') return 'png';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'webp') return 'webp';
  return 'file';
}

let DocumentPicker: any;
try {
  DocumentPicker = require('expo-document-picker');
} catch {
  DocumentPicker = null;
}

export default function CreateDocumentScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('projects').select('id, name').order('name');
        if (error) throw error;
        const list = (data as Project[]) || [];
        setProjects(list);
        if (list.length > 0) setProjectId(list[0].id);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, []);

  const pickDocument = async () => {
    if (DocumentPicker) {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'],
          copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setFileUri(asset.uri);
          setFileName(asset.name || '');
          const mime = asset.mimeType || '';
          setFileMime(mime);
          setFileType(detectFileType(asset.uri, mime));
          if (!title.trim() && asset.name) {
            const baseName = asset.name.replace(/\\.[^/.]+$/, '');
            setTitle(baseName);
          }
        }
        return;
      } catch (e) {
        console.log('DocumentPicker error', e);
      }
    }
    // fallback to image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFileUri(asset.uri);
      setFileName(asset.uri.split('/').pop() || '');
      const mime = asset.mimeType || '';
      setFileMime(mime);
      setFileType(detectFileType(asset.uri, mime));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    if (!projectId) {
      Alert.alert('Error', 'Please select a project');
      return;
    }
    if (!fileUri) {
      Alert.alert('Error', 'Please pick a file');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    try {
      setUploadProgress(20);
      const { url } = await uploadFile('buildtrack-documents', fileUri, fileMime || undefined);
      setUploadProgress(70);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      const project = projects.find((p) => p.id === projectId);

      const { error } = await supabase.from('documents').insert({
        title: title.trim(),
        project_id: projectId,
        project_name: project?.name || '',
        file_url: url,
        file_type: fileType || detectFileType(fileUri, fileMime),
        uploaded_by: user?.email || user?.id || 'Unknown',
      });

      if (error) throw error;

      setUploadProgress(100);
      Alert.alert('Success', 'Document uploaded');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === projectId);
  const isImage = fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg' || fileType === 'webp';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View className="flex-1" style={{ backgroundColor: theme.bg }}>
        {/* Header */}
        <View className="p-4 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <Text className="text-xl font-bold" style={{ color: theme.text }}>New Document</Text>
        </View>

        <ScrollView className="px-4 pb-8">
          <Card className="p-4">
            {/* Title */}
            <Text className="text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Title *</Text>
            <TextInput
              className="border rounded-lg p-3 mb-3 text-base"
              style={{ borderColor: theme.inputBorder, color: theme.text, backgroundColor: theme.inputBg }}
              value={title}
              onChangeText={setTitle}
              placeholder="Document title"
              placeholderTextColor={theme.placeholder}
            />

            {/* Project */}
            <Text className="text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Project *</Text>
            {loadingProjects ? (
              <ActivityIndicator className="mb-3" color={COLORS.primary[600]} />
            ) : projects.length === 0 ? (
              <Text className="mb-3" style={{ color: theme.textMuted }}>No projects available</Text>
            ) : (
              <View className="flex-row flex-wrap mb-3">
                {projects.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setProjectId(p.id)}
                    className="mr-2 mb-2 px-3 py-2 rounded-full"
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

            {/* File Type (read-only) */}
            <Text className="text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Detected Type</Text>
            <View
              className="border rounded-lg p-3 mb-3 flex-row items-center"
              style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg }}
            >
              <Ionicons
                name={isImage ? 'image' : 'document'}
                size={16}
                color={theme.textMuted}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: fileType ? theme.text : theme.placeholder }}>
                {fileType ? fileType.toUpperCase() : 'No file selected'}
              </Text>
            </View>

            {/* File picker */}
            <Text className="text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>File *</Text>
            {fileUri ? (
              <View className="mb-3">
                {isImage && (
                  <Image
                    source={{ uri: fileUri }}
                    className="w-full h-40 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                )}
                <Text className="text-sm mb-1" style={{ color: theme.textSecondary }}>
                  Selected: {fileName || fileUri.split('/').pop()}
                </Text>
                <Pressable onPress={() => { setFileUri(null); setFileMime(null); setFileType(''); setFileName(''); }}>
                  <Text className="text-sm" style={{ color: COLORS.danger }}>Remove file</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={pickDocument}
                className="border-2 border-dashed rounded-lg p-4 items-center justify-center mb-3"
                style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg }}
              >
                <Ionicons name="cloud-upload-outline" size={24} color={theme.textMuted} />
                <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                  {DocumentPicker ? 'Pick a document or image' : 'Pick an image'}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: theme.textMuted }}>PDF, Word, TXT, PNG, JPG</Text>
              </Pressable>
            )}

            {/* Upload progress */}
            {submitting && (
              <View className="mb-3">
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
          </Card>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className="p-4 rounded-lg items-center mt-4 mb-8"
            style={{ backgroundColor: COLORS.primary[600], opacity: submitting ? 0.6 : 1 }}
          >
            <Text className="text-white font-semibold text-base">
              {submitting ? 'Uploading...' : 'Upload Document'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
