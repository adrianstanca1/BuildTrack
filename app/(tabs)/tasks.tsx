import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/theme';

interface Task {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  project_name: string;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
}

export default function TasksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');

  const loadTasks = useCallback(async () => {
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) { setTasks([]); return; }
      let q = supabase.from('tasks').select('*').eq('user_id', uid).order('created_at', { ascending: false });
      if (statusFilter && statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      setTasks(data || []);
    } catch (e: any) {
      console.error('[TasksScreen]', e.message);
    }
  }, [statusFilter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(q) ||
      (t.project_name || '').toLowerCase().includes(q)
    );
  });

  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedTasks = [...filteredTasks].sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));

  const priorityColors: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    completed: '#22c55e',
    overdue: '#ef4444',
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === 'completed' ? 'pending' : 'completed';
    await supabase.from('tasks').update({ status: next }).eq('id', task.id);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => router.push(`/tasks/${item.id}`)}
      style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.04, shadowRadius: 6 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{item.title}</Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{item.project_name || 'No project'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={{ backgroundColor: (priorityColors[item.priority] || '#64748b') + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: priorityColors[item.priority] || '#64748b' }}>{item.priority}</Text>
          </View>
          <View style={{ backgroundColor: (statusColors[item.status] || '#64748b') + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: statusColors[item.status] || '#64748b' }}>{item.status}</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="calendar" size={12} color={theme.textMuted} />
          <Text style={{ marginLeft: 4, color: theme.textMuted, fontSize: 12 }}>{item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleStatus(item)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={item.status === 'completed' ? 'checkbox' : 'square-outline'} size={18} color={item.status === 'completed' ? '#22c55e' : '#94a3b8'} />
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 4 }}>{item.status === 'completed' ? 'Done' : 'Mark done'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, flex: 1 }}>Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/task/create')} style={{ padding: 8, backgroundColor: '#3b82f6', borderRadius: 12 }}>
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 }}>
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks..."
            placeholderTextColor={theme.textMuted}
            style={{ flex: 1, marginLeft: 8, color: theme.text, fontSize: 16 }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {['all', 'pending', 'in-progress', 'completed', 'overdue'].map((s) => {
            const active = statusFilter === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setStatusFilter(s)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: active ? '#3b82f6' : isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <Text style={{ color: active ? '#fff' : theme.textSecondary, fontWeight: active ? '600' : '400', fontSize: 13 }}>
                  {s === 'in-progress' ? 'In Progress' : s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTasks().finally(() => setRefreshing(false)); }} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Ionicons name="list" size={56} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, marginTop: 12, fontSize: 16 }}>No tasks found</Text>
              <TouchableOpacity onPress={() => router.push('/tasks/create')} style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#3b82f6', borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Create Task</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
