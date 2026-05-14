import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/theme';

interface Project {
  id: string;
  name: string;
  location: string;
  description: string | null;
  budget: number;
  progress: number;
  status: string;
  start_date: string;
  end_date: string;
  team_size: number;
}

interface Task {
  id: string;
  title: string;
  assigned_to: string | null;
  priority: string;
  status: string;
  due_date: string;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  status: string;
  project_assignments: string[] | null;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  category: string;
}

interface Drawing {
  id: string;
  name: string;
  url: string | null;
  sheet_number: string | null;
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'files'>('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [projRes, tasksRes, workersRes, photosRes, drawingsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase
          .from('tasks')
          .select('id,title,assigned_to,priority,status,due_date')
          .eq('project_id', id)
          .order('created_at', { ascending: false }),
        supabase.from('workers').select('id,name,role,status,project_assignments'),
        supabase.from('photos').select('id,url,caption,category').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('drawings').select('id,name,url,sheet_number').eq('project_id', id).order('created_at', { ascending: false }),
      ]);

      if (projRes.error) throw projRes.error;
      setProject(projRes.data);

      if (tasksRes.error) throw tasksRes.error;
      setTasks(tasksRes.data || []);

      if (workersRes.error) throw workersRes.error;
      const allWorkers: Worker[] = (workersRes.data || []) as Worker[];
      const matched = allWorkers.filter(
        (w) => Array.isArray(w.project_assignments) && w.project_assignments.includes(id)
      );
      setWorkers(matched);

      if (photosRes.error) throw photosRes.error;
      setPhotos(photosRes.data || []);

      if (drawingsRes.error) throw drawingsRes.error;
      setDrawings(drawingsRes.data || []);
    } catch (err: any) {
      console.log('[ProjectDetail] fetch error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'planning':
        return '#f59e0b';
      case 'completed':
        return '#3b82f6';
      case 'on-hold':
        return '#ef4444';
      case 'cancelled':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}
      >
        <Ionicons name="construct-outline" size={48} color={theme.textMuted} />
        <Text style={{ color: theme.textMuted, marginTop: 12 }}>Project not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }} numberOfLines={1}>
              {project.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        {(['overview', 'tasks', 'team', 'files'] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: active ? '600' : '400',
                  color: active ? COLORS.primary[600] : theme.textSecondary,
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </Text>
              {active && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    height: 2,
                    width: '60%',
                    backgroundColor: COLORS.primary[600],
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary[600]} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {activeTab === 'overview' && (
          <View>
            {/* Status & Progress */}
            <View
              style={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    backgroundColor: statusColor(project.status) + '20',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: statusColor(project.status),
                      textTransform: 'capitalize',
                    }}
                  >
                    {project.status}
                  </Text>
                </View>
                <Text
                  style={{
                    marginLeft: 'auto',
                    fontSize: 14,
                    fontWeight: '700',
                    color: COLORS.primary[600],
                  }}
                >
                  {project.progress || 0}%
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: 8,
                    width: `${Math.min(project.progress || 0, 100)}%`,
                    backgroundColor: statusColor(project.status),
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            {/* Details */}
            <View
              style={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 }}>
                Details
              </Text>
              <DetailRow icon="location" label="Location" value={project.location || '—'} theme={theme} />
              <DetailRow
                icon="calendar"
                label="Start Date"
                value={new Date(project.start_date).toLocaleDateString()}
                theme={theme}
              />
              <DetailRow
                icon="flag"
                label="End Date"
                value={new Date(project.end_date).toLocaleDateString()}
                theme={theme}
              />
              <DetailRow
                icon="cash"
                label="Budget"
                value={`$${(project.budget || 0).toLocaleString()}`}
                theme={theme}
              />
              <DetailRow
                icon="people"
                label="Team Size"
                value={`${project.team_size || 0} workers`}
                theme={theme}
              />
            </View>

            {/* Description */}
            {project.description ? (
              <View
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
                  Description
                </Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 20 }}>
                  {project.description}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {activeTab === 'tasks' && (
          <View>
            <TouchableOpacity
              onPress={() => router.push('/task/create')}
              style={{
                backgroundColor: COLORS.primary[600],
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>+ Add Task</Text>
            </TouchableOpacity>
            {tasks.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="clipboard-outline" size={40} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, marginTop: 8 }}>No tasks found</Text>
              </View>
            ) : (
              tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => router.push(`/task/${task.id}`)}
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: theme.text,
                        flex: 1,
                        marginRight: 8,
                      }}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    <View
                      style={{
                        backgroundColor: priorityColor(task.priority) + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: priorityColor(task.priority),
                          textTransform: 'capitalize',
                        }}
                      >
                        {task.priority}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                    <Ionicons name="person-outline" size={13} color={theme.textMuted} />
                    <Text style={{ fontSize: 13, color: theme.textSecondary, marginLeft: 4, flex: 1 }}>
                      {task.assigned_to || 'Unassigned'}
                    </Text>
                    <View
                      style={{
                        backgroundColor:
                          (task.status === 'completed'
                            ? '#22c55e'
                            : task.status === 'in-progress'
                              ? '#3b82f6'
                            : '#f59e0b') + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color:
                            task.status === 'completed'
                              ? '#22c55e'
                              : task.status === 'in-progress'
                                ? '#3b82f6'
                              : '#f59e0b',
                          textTransform: 'capitalize',
                        }}
                      >
                        {(task.status || '').replace('-', ' ')}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={13} color={theme.textMuted} />
                    <Text style={{ fontSize: 12, color: theme.textMuted, marginLeft: 4 }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'team' && (
          <View>
            {workers.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="people-outline" size={40} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, marginTop: 8 }}>No workers assigned</Text>
              </View>
            ) : (
              workers.map((w) => (
                <View
                  key={w.id}
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: theme.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: COLORS.primary[500] + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.primary[600] }}>
                      {(w.name || '?').charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{w.name}</Text>
                    <Text style={{ fontSize: 13, color: theme.textSecondary, textTransform: 'capitalize' }}>
                      {w.role}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor:
                        (w.status === 'active' ? '#22c55e' : '#f59e0b') + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: w.status === 'active' ? '#22c55e' : '#f59e0b',
                        textTransform: 'capitalize',
                      }}
                    >
                      {w.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'files' && (
          <View>
            <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
              <TouchableOpacity
                onPress={() => router.push('/site-photos/create')}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.primary[600],
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>+ Site Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/drawings/create')}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>+ Drawing</Text>
              </TouchableOpacity>
            </View>

            {drawings.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 10 }}>
                  Drawings
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {drawings.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      onPress={() => router.push(`/drawings/${d.id}`)}
                      style={{
                        width: '47%',
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        borderRadius: 12,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <View
                        style={{
                          height: 100,
                          backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <Ionicons name="document-text-outline" size={28} color={theme.textMuted} />
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }} numberOfLines={1}>
                        {d.name}
                      </Text>
                      {d.sheet_number ? (
                        <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                          Sheet {d.sheet_number}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {photos.length > 0 && (
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 10 }}>
                  Site Photos
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {photos.map((ph) => (
                    <TouchableOpacity
                      key={ph.id}
                      onPress={() => router.push(`/site-photos/${ph.id}`)}
                      style={{
                        width: '47%',
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        borderRadius: 12,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      {ph.url ? (
                        <Image
                          source={{ uri: ph.url }}
                          style={{
                            height: 100,
                            borderRadius: 8,
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            marginBottom: 8,
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            height: 100,
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8,
                          }}
                        >
                          <Ionicons name="image-outline" size={28} color={theme.textMuted} />
                        </View>
                      )}
                      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }} numberOfLines={1}>
                        {ph.caption || 'Untitled'}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: theme.textMuted,
                          marginTop: 2,
                          textTransform: 'capitalize',
                        }}
                      >
                        {ph.category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {drawings.length === 0 && photos.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="images-outline" size={40} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, marginTop: 8 }}>No files found</Text>
                <TouchableOpacity
                  onPress={() => router.push('/site-photos/create')}
                  style={{
                    marginTop: 16,
                    backgroundColor: COLORS.primary[600],
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Add First Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  theme,
}: {
  icon: string;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + '40',
      }}
    >
      <Ionicons name={icon as any} size={16} color={theme.textSecondary} />
      <Text style={{ fontSize: 14, color: theme.textSecondary, marginLeft: 8, width: 90 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: theme.text }}>{value}</Text>
    </View>
  );
}
