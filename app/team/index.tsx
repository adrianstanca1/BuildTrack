import { View, Text, FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

const STATUS_FILTERS = ['all', 'active', 'off-duty', 'on-leave'] as const;

type StatusFilter = typeof STATUS_FILTERS[number];

export default function TeamListScreen() {
  const router = useRouter();
  const { workers, loading, error, fetchWorkers } = useTeamStore();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWorkers();
    setRefreshing(false);
  }, [fetchWorkers]);

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
                          w.role?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'all' || w.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return '#22c55e';
      case 'off-duty': return '#f97316';
      case 'on-leave': return '#3b82f6';
      default: return COLORS.dark.textMuted;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={{ fontSize: TYPOGRAPHY.h1.fontSize, fontWeight: TYPOGRAPHY.h1.fontWeight, color: COLORS.dark.text }}>Team</Text>
          <Pressable
            onPress={() => router.push('/team/create')}
            style={{
              width: 40, height: 40, borderRadius: RADIUS.full,
              backgroundColor: COLORS.dark.primary,
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: COLORS.dark.surface,
          borderRadius: RADIUS.lg,
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          borderWidth: 1, borderColor: COLORS.dark.border,
        }}>
          <Ionicons name="search" size={18} color={COLORS.dark.textMuted} />
          <TextInput
            placeholder="Search team members..."
            placeholderTextColor={COLORS.dark.textMuted}
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm,
              color: COLORS.dark.text, fontSize: TYPOGRAPHY.body.fontSize,
            }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.dark.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Filters */}
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          {STATUS_FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              style={{
                paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
                borderRadius: RADIUS.full,
                backgroundColor: activeFilter === f ? COLORS.dark.primary + '20' : COLORS.dark.elevated,
                borderWidth: 1, borderColor: activeFilter === f ? COLORS.dark.primary : COLORS.dark.border,
              }}
            >
              <Text style={{
                color: activeFilter === f ? COLORS.dark.primary : COLORS.dark.textMuted,
                fontWeight: '600', fontSize: 12, textTransform: 'capitalize',
              }}>
                {f === 'off-duty' ? 'Off-duty' : f}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Error */}
      {error && (
        <View style={{ padding: SPACING.md }}>
          <Text style={{ color: '#ef4444', textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredWorkers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.dark.primary} />}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING['3xl'] }}>
            <Ionicons name="people-outline" size={48} color={COLORS.dark.textMuted} />
            <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.md, fontSize: TYPOGRAPHY.body.fontSize }}>
              {search ? 'No team members found' : 'No team members yet'}
            </Text>
            <Pressable onPress={() => router.push('/team/create')} style={{ marginTop: SPACING.md }}>
              <Text style={{ color: COLORS.dark.primary, fontWeight: '600' }}>Add your first team member</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/team/${item.id}`)}
            style={{ marginBottom: SPACING.md }}
          >
            <Card className="p-4" style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 44, height: 44, borderRadius: RADIUS.full,
                  backgroundColor: COLORS.dark.primary + '20',
                  justifyContent: 'center', alignItems: 'center',
                  marginRight: SPACING.md,
                }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark.primary }}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, fontWeight: '600', color: COLORS.dark.text }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: COLORS.dark.textSecondary, marginTop: 2 }}>
                    {item.role || 'No role'}
                  </Text>
                  {item.phone && (
                    <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: COLORS.dark.textMuted, marginTop: 2 }}>
                      {item.phone}
                    </Text>
                  )}
                </View>

                <View style={{
                  paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
                  borderRadius: RADIUS.full,
                  backgroundColor: statusColor(item.status || 'active') + '20',
                }}>
                  <Text style={{ color: statusColor(item.status || 'active'), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                    {item.status || 'active'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={COLORS.dark.textMuted} />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
