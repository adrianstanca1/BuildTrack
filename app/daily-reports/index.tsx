import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyReportsStore } from '../../stores/dailyReportsStore';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function DailyReportsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { reports, fetchReports, loading } = useDailyReportsStore();
  const [dateFilter, setDateFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredReports = dateFilter
    ? reports.filter((r) => r.reportDate.startsWith(dateFilter))
    : reports;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'draft': return COLORS.warning;
      case 'submitted': return COLORS.info;
      case 'approved': return COLORS.success;
      default: return COLORS.gray;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }}>
        <View style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>Daily Reports</Text>
            <Pressable
              onPress={() => router.push('/daily-reports/create')}
              style={{ backgroundColor: COLORS.primary[500], paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>New</Text>
            </Pressable>
          </View>

          {/* Date Filter */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Ionicons name="calendar-outline" size={18} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} style={{ marginRight: SPACING.sm }} />
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                borderRadius: RADIUS.md,
                padding: SPACING.sm,
                color: isDark ? COLORS.dark.text : COLORS.light.text,
                backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
              }}
              value={dateFilter}
              onChangeText={setDateFilter}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            />
            {dateFilter !== '' && (
              <Pressable onPress={() => setDateFilter('')} style={{ marginLeft: SPACING.sm }}>
                <Ionicons name="close-circle" size={20} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filteredReports}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? COLORS.dark.text : COLORS.light.text} />}
            renderItem={({ item }) => (
              <Card style={{ marginBottom: SPACING.sm, backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface }}>
                <Pressable style={{ padding: SPACING.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? COLORS.dark.text : COLORS.light.text }}>{item.projectName}</Text>
                        <View style={{ backgroundColor: statusColor(item.status) + '20', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: statusColor(item.status), textTransform: 'capitalize' }}>{item.status}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 13, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, marginTop: 4 }}>{formatDate(item.reportDate)}</Text>
                      {item.weather && (
                        <Text style={{ fontSize: 12, color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary, marginTop: 4 }}>
                          Weather: {item.weather}{item.temperature !== undefined ? ` • ${item.temperature}°C` : ''}
                        </Text>
                      )}
                      {item.workCompleted && (
                        <Text style={{ fontSize: 13, color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary, marginTop: 6 }} numberOfLines={2}>
                          {item.workCompleted}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                        <Text style={{ fontSize: 12, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }}>Workers: {item.workersOnSite}</Text>
                        {item.submittedBy && (
                          <>
                            <Text style={{ fontSize: 12, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }}>•</Text>
                            <Text style={{ fontSize: 12, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }}>By {item.submittedBy}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Card>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                <Ionicons name="clipboard-outline" size={48} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
                <Text style={{ color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, marginTop: 16, textAlign: 'center' }}>
                  {dateFilter ? 'No reports for selected date.' : 'No daily reports yet.\nTap "New" to create one.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
