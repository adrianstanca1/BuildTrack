import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';
import { Building2, ClipboardList, AlertTriangle, Users, Bell, TrendingUp, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';

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

  const onRefresh = useCallback(() => {
    refetchProjects();
    refetchTasks();
    refetchNotifications();
  }, [refetchProjects, refetchTasks, refetchNotifications]);

  const activeProjects = projects?.data?.filter((p: any) => p.status === 'active')?.length || 0;
  const pendingTasks = tasks?.data?.filter((t: any) => t.status === 'pending')?.length || 0;
  const unreadNotifications = notifications?.data?.unreadCount || 0;
  const totalWorkers = projects?.data?.reduce((acc: number, p: any) => acc + (p.worker_count || 0), 0) || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: SPACING.md }}
        refreshControl={<RefreshControl refreshing={projectsLoading} onRefresh={onRefresh} tintColor={COLORS.dark.text} />}
      >
        {/* Header */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text style={{ fontSize: 13, color: COLORS.dark.textMuted, marginBottom: 2 }}>Welcome back,</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.dark.text }}>
            {user?.firstName || user?.email?.split('@')[0] || 'User'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg }}>
          <StatCard icon={Building2} label="Active" value={activeProjects} color={COLORS.dark.primary} onPress={() => router.push('/projects')} />
          <StatCard icon={ClipboardList} label="Pending" value={pendingTasks} color={COLORS.dark.accent} onPress={() => router.push('/tasks')} />
          <StatCard icon={Users} label="Workers" value={totalWorkers} color={COLORS.dark.success} onPress={() => router.push('/workers')} />
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

        {/* Quick Actions */}
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text, marginBottom: SPACING.md }}>Quick Actions</Text>
          <QuickAction icon={Building2} label="New Project" color={COLORS.dark.primary} onPress={() => router.push('/project/create')} />
          <QuickAction icon={ClipboardList} label="Add Task" color={COLORS.dark.accent} onPress={() => router.push('/task/create')} />
          <QuickAction icon={AlertTriangle} label="Report Incident" color={COLORS.dark.danger} onPress={() => router.push('/safety/report')} />
          <QuickAction icon={Bell} label={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications})` : ''}`} color={COLORS.dark.warning} onPress={() => router.push('/notifications')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
