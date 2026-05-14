import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/theme';

export default function CreateTaskScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
  });

  useEffect(() => {
    supabase.from('projects').select('id, name').then(({ data }) => {
      setProjects(data || []);
      if (data && data.length > 0) setForm((f) => ({ ...f, projectId: data[0].id }));
    });
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      const { error } = await supabase.from('tasks').insert({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        project_id: form.projectId || undefined,
        project_name: projects.find((p) => p.id === form.projectId)?.name || '',
        priority: form.priority,
        due_date: form.dueDate || undefined,
        assigned_to: form.assignedTo.trim() || undefined,
        status: 'pending',
        user_id: uid,
      });
      if (error) throw error;
      router.back();
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginLeft: 12 }}>New Task</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>Title *</Text>
        <TextInput
          value={form.title}
          onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
          placeholder="Task title"
          placeholderTextColor={theme.textMuted}
          style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: theme.text, padding: 12, borderRadius: 10, marginBottom: 16 }}
        />

        <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>Project</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setForm((f) => ({ ...f, projectId: p.id }))}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: form.projectId === p.id ? '#3b82f6' : isDark ? '#1e293b' : '#e2e8f0',
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: form.projectId === p.id ? '#fff' : theme.textSecondary, fontSize: 13 }}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>Priority</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {['urgent', 'high', 'medium', 'low'].map((pr) => (
            <TouchableOpacity key={pr} onPress={() => setForm((f) => ({ ...f, priority: pr }))}
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
                backgroundColor: form.priority === pr ? '#3b82f6' : isDark ? '#1e293b' : '#e2e8f0',
                marginRight: 8, marginBottom: 8,
              }}
            >
              <Text style={{ color: form.priority === pr ? '#fff' : theme.textSecondary, fontSize: 13, textTransform: 'capitalize' }}>{pr}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>Due Date (YYYY-MM-DD)</Text>
        <TextInput
          value={form.dueDate}
          onChangeText={(t) => setForm((f) => ({ ...f, dueDate: t }))}
          placeholder="2026-12-31"
          placeholderTextColor={theme.textMuted}
          style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: theme.text, padding: 12, borderRadius: 10, marginBottom: 16 }}
        />

        <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>Description</Text>
        <TextInput
          value={form.description}
          onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
          placeholder="Task details..."
          placeholderTextColor={theme.textMuted}
          multiline
          style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: theme.text, padding: 12, borderRadius: 10, marginBottom: 16, minHeight: 80 }}
        />

        <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>Assigned To</Text>
        <TextInput
          value={form.assignedTo}
          onChangeText={(t) => setForm((f) => ({ ...f, assignedTo: t }))}
          placeholder="Worker name"
          placeholderTextColor={theme.textMuted}
          style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: theme.text, padding: 12, borderRadius: 10, marginBottom: 24 }}
        />

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading || !form.title.trim()}
          style={{
            padding: 14,
            borderRadius: 12,
            alignItems: 'center',
            backgroundColor: form.title.trim() ? '#3b82f6' : '#9ca3af',
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>Create Task</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
