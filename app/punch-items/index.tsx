import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePunchItemsStore } from '../../stores/punchItemsStore';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../constants/theme';

const STATUS_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

const SEVERITY_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'major', label: 'Major' },
  { key: 'minor', label: 'Minor' },
  { key: 'cosmetic', label: 'Cosmetic' },
];

export default function PunchItemsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const { punchItems, fetchPunchItems, loading } = usePunchItemsStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPunchItems();
  }, [fetchPunchItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPunchItems();
    setRefreshing(false);
  }, [fetchPunchItems]);

  const filtered = punchItems.filter((item) => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const severityMatch = filterSeverity === 'all' || item.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'resolved': return COLORS.success;
      case 'closed': return theme.textMuted;
      case 'in-progress': return COLORS.warning;
      case 'open': return COLORS.danger;
      default: return theme.textMuted;
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return COLORS.danger;
      case 'major': return '#f97316';
      case 'minor': return COLORS.warning;
      case 'cosmetic': return COLORS.success;
      default: return theme.textMuted;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View className="flex-1" style={{ backgroundColor: theme.bg }}>
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>Punch Items</Text>
            <Pressable
              onPress={() => router.push('/punch-items/create')}
              className="px-4 py-2 rounded-lg flex-row items-center"
              style={{ backgroundColor: COLORS.primary[600] }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">New</Text>
            </Pressable>
          </View>

          <Text className="text-xs font-semibold mb-2" style={{ color: theme.textMuted }}>Status</Text>
          <View className="flex-row mb-3 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setFilterStatus(s.key)}
                className="mr-2 mb-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: filterStatus === s.key ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: filterStatus === s.key ? '#fff' : theme.textSecondary }}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-xs font-semibold mb-2" style={{ color: theme.textMuted }}>Severity</Text>
          <View className="flex-row mb-4 flex-wrap">
            {SEVERITY_OPTIONS.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setFilterSeverity(s.key)}
                className="mr-2 mb-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: filterSeverity === s.key ? COLORS.primary[600] : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: filterSeverity === s.key ? '#fff' : theme.textSecondary }}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
            }
            renderItem={({ item }) => (
              <Card className="mb-3">
                <Pressable
                  onPress={() => router.push(`/punch-items/${item.id}`)}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold" style={{ color: theme.text }}>
                        {item.title}
                      </Text>
                      <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                        {item.projectName}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View
                        className="px-2 py-1 rounded-full mb-1"
                        style={{ backgroundColor: statusColor(item.status) + '20' }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: statusColor(item.status) }}
                        >
                          {item.status}
                        </Text>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: severityColor(item.severity) + '20' }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: severityColor(item.severity) }}
                        >
                          {item.severity}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {item.location ? (
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="location-outline" size={14} color={theme.textMuted} />
                      <Text className="text-xs ml-1" style={{ color: theme.textMuted }}>
                        {item.location}
                      </Text>
                    </View>
                  ) : null}

                  {item.assignee ? (
                    <Text className="text-xs mt-1" style={{ color: theme.textMuted }}>
                      Assigned to: <Text style={{ color: theme.textSecondary }}>{item.assignee}</Text>
                    </Text>
                  ) : null}
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Ionicons name="list-outline" size={48} color={theme.textMuted} />
                <Text className="mt-4 text-center" style={{ color: theme.textSecondary }}>
                  {filterStatus !== 'all' || filterSeverity !== 'all'
                    ? 'No punch items match your filters.'
                    : 'No punch items yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
