import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';
import { useIncidents } from '@/hooks/useSafety';
import SyncStatusBar from '@/components/SyncStatusBar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Building2, ClipboardList, AlertTriangle, Users, Bell, TrendingUp, ArrowRight, ShieldAlert, Bug, FileText, Clock, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';

function StatCard({ icon: Icon, label, value, color, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: COLORS.dark.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
      }}
    >
      <View style={{ backgroundColor: color + '20', borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm }}>
        <Icon size={20} color={color} />
      </View>
      <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.dark.text, marginBottom: 2 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: COLORS.dark.textMuted }}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({ icon: Icon, label, color, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.dark.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
      }}
    >
      <View style={{ backgroundColor: color + '20', borderRadius: RADIUS.md, padding: SPACING.sm, marginRight: SPACING.md }}>
        <Icon size={20} color={color} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.dark.text }}>{label}</Text>
      <ArrowRight size={16} color={COLORS.dark.textMuted} />
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useProjects();
  const { data: tasks, refetch: refetchTasks } = useTasks();
  const { data: notifications, refetch: refetchNotifications } = useNotifications();
  const { data: incidents } = useIncidents();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const onRefresh = useCallback(() => {
    refetchProjects();
    refetchTasks();
    refetchNotifications();
  }, [refetchProjects, refetchTasks, refetchNotifications]);

  const activeProjects = projects?.data?.filter((p: any) => p.status === 'active')?.length || 0;
  const pendingTasks = tasks?.data?.filter((t: any) => t.status === 'pending')?.length || 0;
  const unreadNotifications = notifications?.data?.unreadCount || 0;
  const totalWorkers = projects?.data?.reduce((acc: number, p: any) => acc + (p.worker_count || 0), 0) || 0;

  // Chart data
  const projectProgressData = useMemo(() => {
    return (projects?.data || [])
      .slice(0, 5)
      .map((p: any) => ({
        label: p.name?.length > 10 ? p.name.slice(0, 10) + '...' : p.name || 'Untitled',
        value: Math.round(p.progress || 0),
        color: p.color || COLORS.primary[500],
      }));
  }, [projects]);

  const taskStatusData = useMemo(() => {
    const all = tasks?.data || [];
    const completed = all.filter((t: any) => t.status === 'completed').length;
    const inProgress = all.filter((t: any) => t.status === 'in-progress').length;
    const pending = all.filter((t: any) => t.status === 'pending').length;
    return [
      { label: 'Completed', value: completed, color: COLORS.success },
      { label: 'In Progress', value: inProgress, color: COLORS.info },
      { label: 'Pending', value: pending, color: COLORS.warning },
    ];
  }, [tasks]);

  const safetySeverityData = useMemo(() => {
    const sevCounts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    incidents?.forEach((inc: any) => {
      const sev = inc.severity || 'low';
      sevCounts[sev] = (sevCounts[sev] || 0) + 1;
    });
    return [
      { label: 'Low', value: sevCounts.low, color: COLORS.success },
      { label: 'Medium', value: sevCounts.medium, color: COLORS.warning },
      { label: 'High', value: sevCounts.high, color: '#f97316' },
      { label: 'Critical', value: sevCounts.critical, color: COLORS.danger },
    ];
  }, [incidents]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark.background }} edges={['top']}>
      <SyncStatusBar />
      <ScrollView
        contentContainerStyle={{ padding: SPACING.md }}
        refreshControl={<RefreshControl refreshing={projectsLoading} onRefresh={onRefresh} tintColor={COLORS.dark.text} />}
      >
        {/* Header */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: 13, color: COLORS.dark.textMuted, marginBottom: 2 }}>Welcome back,</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.dark.text }}>
            {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg }}>
          <StatCard icon={Building2} label="Active" value={activeProjects} color={COLORS.dark.primary} onPress={() => router.push('/projects')} />
          <StatCard icon={ClipboardList} label="Pending" value={pendingTasks} color={COLORS.dark.accent} onPress={() => router.push('/tasks')} />
          <StatCard icon={Users} label="Workers" value={totalWorkers} color={COLORS.dark.success} onPress={() => router.push('/team')} />
        </View>

        {/* Recent Projects */}
        <View style={{ marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>Recent Projects</Text>
            <TouchableOpacity onPress={() => router.push('/projects')}>
              <Text style={{ fontSize: 13, color: COLORS.dark.primary }}>See all</Text>
            </TouchableOpacity>
          </View>
          {projects?.data?.slice(0, 3).map((project: any) => (
            <TouchableOpacity
              key={project.id}
              onPress={() => router.push(`/project/${project.id}`)}
              style={{
                backgroundColor: COLORS.dark.surface,
                borderRadius: RADIUS.lg,
                padding: SPACING.md,
                marginBottom: SPACING.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 40, borderRadius: RADIUS.sm, backgroundColor: project.color || COLORS.dark.primary, marginRight: SPACING.md }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.dark.text }}>{project.name}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.dark.textMuted, marginTop: 2 }}>{project.location || 'No location'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.dark.primary }}>{project.progress || 0}%</Text>
                  <Text style={{ fontSize: 11, color: COLORS.dark.textMuted }}>complete</Text>
                </View>
              </View>
              <View style={{ height: 4, backgroundColor: COLORS.dark.border, borderRadius: RADIUS.sm, marginTop: SPACING.sm }}>
                <View style={{ height: 4, backgroundColor: project.color || COLORS.dark.primary, borderRadius: RADIUS.sm, width: `${project.progress || 0}%` }} />
              </View>
            </TouchableOpacity>
          )) || (
            <View style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' }}>
              <Text style={{ color: COLORS.dark.textMuted }}>No projects yet</Text>
            </View>
          )}
        </View>

        {/* Charts */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text, marginBottom: SPACING.md }}>Analytics</Text>

          {/* Project Progress Bar Chart */}
          {projectProgressData.length > 0 && (
            <View style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md }}>
              <Text style={{ fontSize: TYPOGRAPHY.captionMedium.size, fontWeight: TYPOGRAPHY.captionMedium.weight, color: COLORS.dark.textSecondary, marginBottom: SPACING.sm }}>
                Project Progress (%)
              </Text>
              <BarChart data={projectProgressData} height={160} barWidth={24} />
            </View>
          )}

          {/* Task Status Donut */}
          <View style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md }}>
            <Text style={{ fontSize: TYPOGRAPHY.captionMedium.size, fontWeight: TYPOGRAPHY.captionMedium.weight, color: COLORS.dark.textSecondary, marginBottom: SPACING.sm }}>
              Task Completion
            </Text>
            <DonutChart
              data={taskStatusData}
              size={180}
              strokeWidth={18}
              centerValue={`${tasks?.data?.length || 0}`}
              centerLabel="Total Tasks"
            />
          </View>

          {/* Safety Incidents Bar Chart */}
          {incidents && incidents.length > 0 && (
            <View style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg, padding: SPACING.md }}>
              <Text style={{ fontSize: TYPOGRAPHY.captionMedium.size, fontWeight: TYPOGRAPHY.captionMedium.weight, color: COLORS.dark.textSecondary, marginBottom: SPACING.sm }}>
                Safety Incidents by Severity
              </Text>
              <BarChart data={safetySeverityData} height={120} barWidth={20} horizontal />
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text, marginBottom: SPACING.md }}>Quick Actions</Text>
          <TouchableOpacity
            onPress={() => router.push('/quick-actions')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.primary[600],
              borderRadius: RADIUS.lg,
              padding: SPACING.md,
              marginBottom: SPACING.md,
            }}
          >
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.md, padding: SPACING.sm, marginRight: SPACING.md }}>
              <Zap size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff' }}>Quick Actions Hub</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>Punch, photo, delay, safety, RFI — fast</Text>
            </View>
            <ArrowRight size={18} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <QuickAction icon={Building2} label="New Project" color={COLORS.dark.primary} onPress={() => router.push('/project/create')} />
          <QuickAction icon={ClipboardList} label="Add Task" color={COLORS.dark.accent} onPress={() => router.push('/task/create')} />
          <QuickAction icon={AlertTriangle} label="Report Incident" color={COLORS.dark.danger} onPress={() => router.push('/safety/report')} />
          <QuickAction icon={Bug} label="Log Defect" color={COLORS.dark.warning} onPress={() => router.push('/defects/create')} />
          <QuickAction icon={FileText} label="New Permit" color={COLORS.dark.info} onPress={() => router.push('/permits/create')} />
          <QuickAction icon={Clock} label="Add Timesheet" color={COLORS.dark.success} onPress={() => router.push('/timesheets/create')} />
          <QuickAction icon={Bell} label={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications})` : ''}`} color={COLORS.dark.warning} onPress={() => router.push('/notifications')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
