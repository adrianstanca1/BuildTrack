import { View, Text, FlatList, Pressable, RefreshControl, useColorScheme, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimesheetsStore } from '../../stores/timesheetsStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import type { TimesheetStatus } from '../../types/field';

const FILTERS: { label: string; value: TimesheetStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Paid', value: 'paid' },
];

const statusColor = (status: TimesheetStatus) => {
  switch (status) {
    case 'approved': return colors.success;
    case 'submitted': return colors.info;
    case 'rejected': return colors.danger;
    case 'paid': return '#8b5cf6';
    default: return colors.gray;
  }
};

const categoryColor = (cat: string) => {
  switch (cat) {
    case 'overtime': return '#f97316';
    case 'weekend': return '#8b5cf6';
    case 'holiday': return '#ec4899';
    case 'sick': return '#ef4444';
    case 'leave': return '#3b82f6';
    default: return colors.success;
  }
};

export default function TimesheetsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    timesheets,
    fetchTimesheets,
    loading,
    getTotalHoursForDate,
    getTotalPayForDate,
  } = useTimesheetsStore();

  const [filterStatus, setFilterStatus] = useState<TimesheetStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'today'>('week');
  const [refreshing, setRefreshing] = useState(false);

  // Filter by status and date range
  const filteredTimesheets = timesheets.filter((t) => {
    const statusMatch = filterStatus === 'all' || t.status === filterStatus;
    let dateMatch = true;
    if (dateRange === 'today') {
      const today = new Date().toISOString().split('T')[0];
      dateMatch = t.date === today;
    } else if (dateRange === 'week') {
      const d = new Date(t.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateMatch = d >= weekAgo && d <= now;
    }
    return statusMatch && dateMatch;
  });

  const today = new Date().toISOString().split('T')[0];
  const todayHours = getTotalHoursForDate(today);
  const todayPay = getTotalPayForDate(today);
  const weekHours = timesheets
    .filter((t) => {
      const d = new Date(t.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo && d <= now;
    })
    .reduce((sum, t) => sum + t.hoursWorked + t.overtimeHours, 0);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTimesheets();
    setRefreshing(false);
  }, [fetchTimesheets]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Timesheet', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => useTimesheetsStore.getState().deleteTimesheet(id),
        },
      ]);
    },
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
        {/* Header */}
        <View style={{ padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: isDark ? COLORS.dark.text : COLORS.light.text }}>
            Timesheets
          </Text>
          <Pressable
            onPress={() => router.push('/timesheets/create')}
            style={{
              backgroundColor: COLORS.primary[600],
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: RADIUS.md,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>New</Text>
          </Pressable>
        </View>

        {/* Summary Cards */}
        <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row', gap: SPACING.sm }}>
          <Card style={{ flex: 1, padding: SPACING.md, backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }}>Today</Text>
            <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>
              {todayHours.toFixed(1)}h
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: COLORS.success, fontWeight: '600' }}>
              £{todayPay.toFixed(2)}
            </Text>
          </Card>
          <Card style={{ flex: 1, padding: SPACING.md, backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface, borderRadius: RADIUS.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }}>This Week</Text>
            <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>
              {weekHours.toFixed(1)}h
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: colors.info, fontWeight: '600' }}>
              {timesheets.filter((t) => t.status === 'approved').length} approved
            </Text>
          </Card>
        </View>

        {/* Date range filters */}
        <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, flexDirection: 'row' }}>
          {(['week', 'today', 'all'] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => setDateRange(r)}
              style={{
                marginRight: SPACING.sm,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.xs,
                borderRadius: RADIUS.full,
                backgroundColor: dateRange === r ? COLORS.primary[600] : isDark ? COLORS.dark.surface : '#e2e8f0',
              }}
            >
              <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: dateRange === r ? 'white' : isDark ? COLORS.dark.textSecondary : '#475569', fontWeight: '600' }}>
                {r === 'week' ? 'This Week' : r === 'today' ? 'Today' : 'All Time'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Status filters */}
        <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, flexDirection: 'row', flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              onPress={() => setFilterStatus(f.value)}
              style={{
                marginRight: SPACING.sm,
                marginBottom: SPACING.xs,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.xs,
                borderRadius: RADIUS.full,
                backgroundColor: filterStatus === f.value ? COLORS.primary[600] : isDark ? COLORS.dark.surface : '#e2e8f0',
              }}
            >
              <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: filterStatus === f.value ? 'white' : isDark ? COLORS.dark.textSecondary : '#475569', fontWeight: '600' }}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filteredTimesheets}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}
          renderItem={({ item }) => (
            <Card
              style={{
                marginBottom: SPACING.sm,
                backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
                borderRadius: RADIUS.lg,
              }}
            >
              <Pressable
                onLongPress={() => handleDelete(item.id)}
                style={{ padding: SPACING.md }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: TYPOGRAPHY.bodyMedium.fontSize, fontWeight: '600', color: isDark ? COLORS.dark.text : COLORS.light.text }}>
                      {item.workerName}
                    </Text>
                    {item.workerRole && (
                      <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, marginTop: 2 }}>
                        {item.workerRole}
                      </Text>
                    )}
                    <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary, marginTop: 2 }}>
                      {item.projectName}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View
                      style={{
                        paddingHorizontal: SPACING.sm,
                        paddingVertical: 2,
                        borderRadius: RADIUS.full,
                        backgroundColor: statusColor(item.status) + '20',
                      }}
                    >
                      <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, fontWeight: '600', color: statusColor(item.status), textTransform: 'capitalize' }}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, fontWeight: '700', color: COLORS.success, marginTop: 4 }}>
                      £{item.totalPay.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={14} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
                    <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, marginLeft: 4 }}>
                      {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time-outline" size={14} color={COLORS.primary[500]} />
                      <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary, marginLeft: 4 }}>
                        {item.hoursWorked}h
                        {item.overtimeHours > 0 && (
                          <Text style={{ color: '#f97316' }}> +{item.overtimeHours}h OT</Text>
                        )}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: SPACING.sm,
                        paddingVertical: 2,
                        borderRadius: RADIUS.sm,
                        backgroundColor: categoryColor(item.category) + '15',
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '600', color: categoryColor(item.category), textTransform: 'capitalize' }}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                </View>

                {item.workDescription && (
                  <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, marginTop: SPACING.xs }} numberOfLines={2}>
                    {item.workDescription}
                  </Text>
                )}

                {item.notes && (
                  <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, marginTop: SPACING.xs }} numberOfLines={1}>
                    📝 {item.notes}
                  </Text>
                )}

                {/* Rate row */}
                <View style={{ flexDirection: 'row', marginTop: SPACING.sm, gap: SPACING.md }}>
                  <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }}>
                    Rate: £{item.hourlyRate}/h
                  </Text>
                  {item.overtimeHours > 0 && (
                    <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }}>
                      OT: £{item.overtimeRate}/h
                    </Text>
                  )}
                </View>
              </Pressable>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: SPACING['2xl'] }}>
              <Ionicons name="time-outline" size={48} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
              <Text style={{ fontSize: TYPOGRAPHY.body.fontSize, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, marginTop: SPACING.md, textAlign: 'center' }}>
                {filterStatus !== 'all'
                  ? `No ${filterStatus} timesheets`
                  : dateRange !== 'all'
                    ? `No timesheets for ${dateRange === 'today' ? 'today' : 'this week'}`
                    : 'No timesheets yet.\nTap "New" to create one.'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
