import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/theme';

interface Worker {
  id: string;
  name: string;
  full_name?: string;
  role: string;
  status: string;
  email?: string;
  phone?: string;
  hourly_rate?: number;
  created_at?: string;
}

export default function TeamScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      const { data, error } = await supabase
        .from('workers')
        .select('id, name, role, status, avatar, phone, email, project_assignments')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWorkers(data || []);
    } catch (e: any) {
      console.error('[Team]', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkers(); }, [loadWorkers]);

  const filteredWorkers = workers.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (w.name || w.full_name || '').toLowerCase().includes(q) ||
      w.role.toLowerCase().includes(q) ||
      (w.email || '').toLowerCase().includes(q)
    );
  });

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const bgColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, flex: 1 }}>Team</Text>
          <TouchableOpacity onPress={() => router.push('/team/create')} style={{ padding: 8, backgroundColor: '#3b82f6', borderRadius: 12 }}>
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search team members..."
            placeholderTextColor={theme.textMuted}
            style={{ flex: 1, marginLeft: 8, color: theme.text, fontSize: 16 }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadWorkers().finally(() => setRefreshing(false)); }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : filteredWorkers.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="people" size={56} color={theme.textMuted} />
            <Text style={{ color: theme.textMuted, marginTop: 12 }}>No team members found</Text>
            <TouchableOpacity onPress={() => router.push('/team/create')} style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#3b82f6', borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Add Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredWorkers.map((w, i) => (
            <TouchableOpacity
              key={w.id}
              onPress={() => router.push(`/team/${w.id}`)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#1e293b' : '#fff',
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
                shadowColor: '#000',
                shadowOpacity: isDark ? 0 : 0.04,
                shadowRadius: 6,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: bgColors[i % bgColors.length],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{initials(w.full_name || w.name || '')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{w.full_name || w.name}</Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>{w.role}</Text>
                {(w.email || w.phone) && (
                  <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{w.email || w.phone}</Text>
                )}
              </View>
              <View style={{ backgroundColor: w.status === 'active' ? '#22c55e' : '#64748b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{w.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
