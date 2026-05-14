import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type DocumentItem = {
  id: string;
  title: string;
  project_id: string;
  project_name: string;
  file_url: string;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

const FILE_TYPE_META: Record<string, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: '#ef4444' },
  doc: { label: 'DOC', color: '#2563eb' },
  docx: { label: 'DOC', color: '#2563eb' },
  txt: { label: 'TXT', color: '#6b7280' },
  png: { label: 'IMG', color: '#22c55e' },
  jpg: { label: 'IMG', color: '#22c55e' },
  jpeg: { label: 'IMG', color: '#22c55e' },
  webp: { label: 'IMG', color: '#22c55e' },
};

function getFileMeta(fileType: string | null) {
  if (!fileType) return { label: 'FILE', color: '#64748b' };
  const ext = fileType.toLowerCase().replace(/^.*\//, '').replace(/^.*\./, '');
  return FILE_TYPE_META[ext] || { label: ext.toUpperCase().slice(0, 4), color: '#64748b' };
}

export default function DocumentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, project_id, project_name, file_url, file_type, uploaded_by, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocuments((data as DocumentItem[]) || []);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = useCallback((doc: DocumentItem) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const path = doc.file_url.split('/').pop();
              const folder = doc.file_url.includes('/buildtrack-documents/') ? doc.file_url.split('buildtrack-documents/')[1]?.split('?')[0] : undefined;
              if (folder) {
                await supabase.storage.from('buildtrack-documents').remove([folder]);
              } else if (path) {
                await supabase.storage.from('buildtrack-documents').remove([`documents/${path}`]);
              }
            } catch (e) {
              // ignore storage delete errors
            }
            try {
              const { error } = await supabase.from('documents').delete().eq('id', doc.id);
              if (error) throw error;
              setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete document');
            }
          },
        },
      ]
    );
  }, []);

  const filtered = documents.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) ||
      d.project_name?.toLowerCase().includes(q) ||
      d.uploaded_by?.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View className="flex-1" style={{ backgroundColor: theme.bg }}>
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>Documents</Text>
            <Pressable
              onPress={() => router.push('/documents/create')}
              className="px-4 py-2 rounded-lg flex-row items-center"
              style={{ backgroundColor: COLORS.primary[600] }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">Upload</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View
            className="flex-row items-center px-3 py-2 rounded-lg border mb-4"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
          >
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              className="flex-1 ml-2 text-base"
              style={{ color: theme.text }}
              placeholder="Search title, project, uploader..."
              placeholderTextColor={theme.placeholder}
              value={search}
              onChangeText={setSearch}
            />
            {search !== '' && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator className="mt-8" color={COLORS.primary[600]} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
              }
              renderItem={({ item }) => {
                const meta = getFileMeta(item.file_type);
                const date = new Date(item.created_at).toLocaleDateString();
                return (
                  <Card className="mb-3">
                    <View className="p-4">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-row flex-1">
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: meta.color + '22' }}
                          >
                            <Ionicons
                              name={meta.label === 'PDF' ? 'document' : meta.label === 'IMG' ? 'image' : 'document-text'}
                              size={18}
                              color={meta.color}
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-semibold" style={{ color: theme.text }}>{item.title}</Text>
                            <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>{item.project_name || 'No project'}</Text>
                            <View className="flex-row items-center mt-1">
                              <Ionicons name="person-outline" size={12} color={theme.textMuted} />
                              <Text className="text-xs ml-1" style={{ color: theme.textMuted }}>{item.uploaded_by || 'Unknown'}</Text>
                              <Text className="text-xs mx-1" style={{ color: theme.textMuted }}>·</Text>
                              <Text className="text-xs" style={{ color: theme.textMuted }}>{date}</Text>
                            </View>
                          </View>
                        </View>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: meta.color + '22' }}
                        >
                          <Text className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center mt-3">
                        <Pressable
                          onPress={() => {
                            if (item.file_url) Linking.openURL(item.file_url);
                          }}
                          className="flex-row items-center px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}
                        >
                          <Ionicons name="open-outline" size={14} color={theme.textSecondary} />
                          <Text className="text-xs ml-1 font-medium" style={{ color: theme.textSecondary }}>Open</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => handleDelete(item)}
                          className="flex-row items-center px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: isDark ? '#3b1515' : '#fef2f2' }}
                        >
                          <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                          <Text className="text-xs ml-1 font-medium" style={{ color: COLORS.danger }}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Card>
                );
              }}
              ListEmptyComponent={
                <View className="items-center py-12">
                  <Ionicons name="document-outline" size={48} color={theme.textMuted} />
                  <Text className="mt-4 text-center" style={{ color: theme.textSecondary }}>
                    {search
                      ? 'No documents match your search.'
                      : 'No documents yet.\nTap "Upload" to add one.'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
