import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/theme';

interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  budget: number;
  team_size: number;
  start_date: string;
  end_date: string;
  user_id: string;
}

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.log('[ProjectsScreen] Error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    let result = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    setFiltered(result);
  }, [projects, search, statusFilter]);

  const statusColors: Record<string, string> = {
    planning: '#f59e0b',
    active: '#22c55e',
    on_hold: '#ef4444',
    completed: '#3b82f6',
    cancelled: '#64748b',
  };

  const statusLabels: Record<string, string> = {
    planning: 'Planning',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Done',
    cancelled: 'Cancelled',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, flex: 1 }}>Projects</Text>
          <TouchableOpacity onPress={() => router.push('/project/create')} style={{ padding: 8, backgroundColor: COLORS.primary[600], borderRadius: 12 }}>
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search projects..."
              placeholderTextColor={theme.textMuted}
              style={{ flex: 1, marginLeft: 8, color: theme.text, fontSize: 16 }}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16, paddingBottom: 8 }}>
          {['all', 'planning', 'active', 'on_hold', 'completed', 'cancelled'].map((s) => {
            const active = statusFilter === (s === 'all' ? null : s);
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setStatusFilter(s === 'all' ? null : s)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: active ? COLORS.primary[600] : isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <Text style={{ color: active ? '#fff' : theme.textSecondary, fontWeight: active ? '600' : '400', fontSize: 13 }}>
                  {statusLabels[s] || 'All'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProjects().finally(() => setRefreshing(false)); }} />}
      >
        {filtered.length === 0 && !loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Ionicons name="folder-open" size={56} color={theme.textMuted} />
            <Text style={{ color: theme.textMuted, marginTop: 16, fontSize: 16 }}>No projects found.</Text>
            <TouchableOpacity onPress={() => router.push('/project/create')} style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.primary[600], borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Create Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ padding: 16, paddingTop: 8 }}>
            {filtered.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => router.push(`/project/${p.id}`)} style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.04, shadowRadius: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{p.name}</Text>
                    <Text style={{ color: theme.textSecondary, marginTop: 2, fontSize: 13 }}>{p.location || 'No location'}</Text>
                  </View>
                  <View style={{ backgroundColor: (statusColors[p.status] || '#64748b') + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: statusColors[p.status] || '#64748b' }}>{statusLabels[p.status] || p.status}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: theme.textMuted }}>Progress</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary[600] }}>{p.progress || 0}%</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: isDark ? '#334155' : '#e2e8f0', borderRadius: 3 }}>
                    <View style={{ height: 6, width: `${Math.min(p.progress || 0, 100)}%`, backgroundColor: COLORS.primary[600], borderRadius: 3 }} />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
                  <Ionicons name="people" size={14} color={theme.textMuted} />
                  <Text style={{ marginLeft: 4, color: theme.textSecondary, fontSize: 13 }}>{p.team_size || 0} members</Text>
                  <View style={{ width: 1, height: 12, backgroundColor: theme.border, marginHorizontal: 10 }} />
                  <Ionicons name="calendar" size={14} color={theme.textMuted} />
                  <Text style={{ marginLeft: 4, color: theme.textSecondary, fontSize: 13 }}>
                    {new Date(p.start_date).toLocaleDateString()} – {new Date(p.end_date).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
