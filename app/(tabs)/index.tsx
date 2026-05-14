import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, useColorScheme, ActivityIndicator } from 'react-native';
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
}

export default function DashboardScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [tasksPending, setTasksPending] = useState(0);
  const [workersTotal, setWorkersTotal] = useState(0);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data: p } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      const projs = p || [];
      setProjects(projs);
      setFiltered(projs);

      setActiveProjectsCount(projs.filter((x) => x.status === 'active').length);

      if (projs.length > 0) {
        const pids = projs.map((x) => x.id);
        const [{ data: t }, { data: w }] = await Promise.all([
          supabase.from('tasks').select('status').in('project_id', pids),
          supabase.from('workers').select('id').in('project_id', pids),
        ]);
        setTasksTotal(t?.length ?? 0);
        setTasksPending(t?.filter((x) => x.status === 'pending').length ?? 0);
        setWorkersTotal(w?.length ?? 0);
      }
    } catch (e: any) {
      console.error('Dashboard load error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let res = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((p) => p.name.toLowerCase().includes(q) || (p.location && p.location.toLowerCase().includes(q)));
    }
    if (statusFilter) res = res.filter((p) => p.status === statusFilter);
    setFiltered(res);
  }, [projects, search, statusFilter]);

  const statusColors: Record<string, string> = {
    planning: '#f59e0b',
    active: '#22c55e',
    on_hold: '#ef4444',
    completed: '#3b82f6',
    cancelled: '#64748b',
  };

  const avgProgress = projects.length ? Math.round(projects.reduce((a, b) => a + (b.progress || 0), 0) / projects.length) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, flex: 1 }}>Dashboard</Text>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={{ padding: 8, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 12 }}>
            <Ionicons name="notifications-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
        <Text style={{ paddingHorizontal: 16, color: theme.textSecondary, fontSize: 14, paddingBottom: 8 }}>Welcome back to BuildTrack</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Projects', value: projects.length, color: '#3b82f6' },
            { label: 'Active', value: activeProjectsCount, color: '#22c55e' },
            { label: 'Tasks', value: tasksPending, color: '#f59e0b' },
            { label: 'Progress', value: `${avgProgress}%`, color: '#8b5cf6' },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.04, shadowRadius: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
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

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16, paddingBottom: 8 }}>
          {['all', 'planning', 'active', 'on_hold', 'completed', 'cancelled'].map((s) => {
            const active = statusFilter === (s === 'all' ? null : s);
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setStatusFilter(s === 'all' ? null : s)}
                style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: active ? '#3b82f6' : isDark ? '#1e293b' : '#e2e8f0' }}
              >
                <Text style={{ color: active ? '#fff' : theme.textSecondary, fontWeight: active ? '600' : '400', fontSize: 13 }}>
                  {s === 'on_hold' ? 'On Hold' : s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Project List */}
        <View style={{ paddingHorizontal: 16 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginTop: 40 }} />
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Ionicons name="folder-open" size={56} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, marginTop: 12 }}>No projects found</Text>
              <TouchableOpacity onPress={() => router.push('/project/create')} style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#3b82f6', borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Create Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => router.push(`/project/${p.id}`)} style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.04, shadowRadius: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{p.name}</Text>
                    <Text style={{ color: theme.textSecondary, marginTop: 2, fontSize: 13 }}>{p.location || 'No location'}</Text>
                  </View>
                  <View style={{ backgroundColor: (statusColors[p.status] || '#64748b') + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: statusColors[p.status] || '#64748b' }}>
                      {p.status === 'on_hold' ? 'On Hold' : p.status}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: theme.textMuted }}>Progress</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6' }}>{p.progress || 0}%</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: isDark ? '#334155' : '#e2e8f0', borderRadius: 3 }}>
                    <View style={{ height: 6, width: `${Math.min(p.progress || 0, 100)}%`, backgroundColor: '#3b82f6', borderRadius: 3 }} />
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
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
