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

interface Incident {
  id: string;
  type: string;
  severity: string;
  description?: string;
  location?: string;
  date?: string;
  project_id?: string;
  project_name: string;
  reporter: string;
  status: string;
  created_at: string;
}

interface Inspection {
  id: string;
  inspection_type: string;
  status: string;
  result: string;
  inspector_name: string;
  project_id?: string;
  project_name: string;
  inspected_at?: string;
  created_at: string;
}

export default function SafetyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'incidents' | 'inspections'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      const [{ data: inc }, { data: insp }] = await Promise.all([
        supabase.from('incidents').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('inspections').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      ]);
      setIncidents(inc || []);
      setInspections(insp || []);
    } catch (e: any) {
      console.error('[Safety]', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const severityColors: Record<string, string> = {
    low: '#22c55e',
    minor: '#f59e0b',
    moderate: '#f97316',
    high: '#ef4444',
    critical: '#dc2626',
  };

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    resolved: '#22c55e',
    under_review: '#3b82f6',
  };

  const stats = {
    totalIncidents: incidents.length,
    totalInspections: inspections.length,
    openIncidents: incidents.filter((i) => i.status !== 'resolved').length,
    passRate: inspections.length
      ? Math.round((inspections.filter((i) => i.result === 'pass').length / inspections.length) * 100)
      : 0,
  };

  const filteredItems = [
    ...(filter !== 'inspections' ? incidents.map((i) => ({ ...i, _type: 'incident' as const })) : []),
    ...(filter !== 'incidents' ? inspections.map((i) => ({ ...i, _type: 'inspection' as const })) : []),
  ].filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ((item as any).description || '').toLowerCase().includes(q) ||
      ((item as any).project_name || '').toLowerCase().includes(q)
    );
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData().finally(() => setRefreshing(false)); }} />}
      >
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, flex: 1 }}>Safety</Text>
            <TouchableOpacity onPress={() => router.push('/safety/create')} style={{ padding: 8, backgroundColor: '#ef4444', borderRadius: 12 }}>
              <Ionicons name="warning" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'Incidents', value: stats.totalIncidents, color: '#ef4444' },
              { label: 'Open', value: stats.openIncidents, color: '#f59e0b' },
              { label: 'Insp.', value: stats.totalInspections, color: '#3b82f6' },
              { label: 'Pass Rate', value: `${stats.passRate}%`, color: '#22c55e' },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 14, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: s.color }}>{s.value}</Text>
                <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 }}>
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search safety records..."
              placeholderTextColor={theme.textMuted}
              style={{ flex: 1, marginLeft: 8, color: theme.text, fontSize: 16 }}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {(['all', 'incidents', 'inspections'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setFilter(s)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: filter === s ? '#ef4444' : isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <Text style={{ color: filter === s ? '#fff' : theme.textSecondary, fontWeight: filter === s ? '600' : '400', fontSize: 13 }}>
                  {s === 'all' ? 'All' : s === 'incidents' ? 'Incidents' : 'Inspections'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ef4444" style={{ marginTop: 40 }} />
        ) : (
          <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            {filteredItems.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Ionicons name="shield-checkmark" size={56} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, marginTop: 12 }}>No records found</Text>
              </View>
            ) : (
              filteredItems.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/${item._type}s/${item.id}`)}
                  style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.04, shadowRadius: 6 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>
                        {(item._type === 'incident' ? item.type : item.inspection_type) || 'Record'}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                        {(item.project_name || 'No project')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {item._type === 'incident' && item.severity && (
                        <View style={{ backgroundColor: (severityColors[item.severity] || '#64748b') + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: severityColors[item.severity] || '#64748b' }}>{item.severity}</Text>
                        </View>
                      )}
                      <View style={{ backgroundColor: (statusColors[item.status] || '#64748b') + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: statusColors[item.status] || '#64748b' }}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={{ marginTop: 6, fontSize: 13, color: theme.textSecondary }}>
                    {item.description || item.notes || ''}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
