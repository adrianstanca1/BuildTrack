import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasksStore } from '../../stores/tasksStore';
import { useEffect } from 'react';
import type { TaskStatus, TaskPriority } from '../../types';

function statusColor(status: TaskStatus) {
  switch (status) {
    case 'completed': return '#10b981';
    case 'in-progress': return '#3b82f6';
    case 'pending': return '#f59e0b';
    default: return '#6b7280';
  }
}

function priorityColor(priority: TaskPriority) {
  switch (priority) {
    case 'urgent': return '#dc2626';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const card = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#e2e8f0' : '#1e293b';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  const { tasks, toggleTaskStatus, deleteTask } = useTasksStore();
  const task = tasks.find((t) => t.id === id);

  useEffect(() => {
    if (!task) router.back();
  }, [task]);

  if (!task) return null;

  const handleComplete = () => {
    if (task.status === 'completed') return;
    Alert.alert('Mark Complete?', 'This task will be marked as completed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: () => toggleTaskStatus(task.id) },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Task?', `"${task.title}" will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteTask(task.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: text, flex: 1 }}>Task Details</Text>
        <TouchableOpacity onPress={() => router.push(`/task/edit?id=${task.id}`)}>
          <Ionicons name="create-outline" size={22} color={text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Title */}
        <View style={{ backgroundColor: card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: border }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: text }}>{task.title}</Text>
          {task.description ? (
            <Text style={{ fontSize: 14, color: muted, marginTop: 8 }}>{task.description}</Text>
          ) : null}
        </View>

        {/* Status & Priority */}
        <View style={{ backgroundColor: card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Status</Text>
              <View style={{ backgroundColor: statusColor(task.status) + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: statusColor(task.status) }}>{task.status.replace('-', ' ')}</Text>
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Priority</Text>
              <View style={{ backgroundColor: priorityColor(task.priority) + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: priorityColor(task.priority) }}>{task.priority}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details grid */}
        <View style={{ backgroundColor: card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: border }}>
          <DetailRow label="Project" value={task.projectName || '—'} text={text} muted={muted} />
          <DetailRow label="Assigned To" value={task.assignedTo || '—'} text={text} muted={muted} />
          <DetailRow label="Due Date" value={task.dueDate || '—'} text={text} muted={muted} />
          <DetailRow label="Created" value={new Date(task.createdAt).toLocaleDateString()} text={text} muted={muted} />
          {task.completedAt ? (
            <DetailRow label="Completed" value={new Date(task.completedAt).toLocaleDateString()} text={text} muted={muted} />
          ) : null}
        </View>

        {/* Complete button */}
        {task.status !== 'completed' && (
          <TouchableOpacity
            onPress={handleComplete}
            style={{ backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Mark as Complete</Text>
          </TouchableOpacity>
        )}

        {/* Delete */}
        <TouchableOpacity onPress={handleDelete} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: '#ef4444', fontSize: 14 }}>Delete Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, text, muted }: { label: string; value: string; text: string; muted: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#00000010' }}>
      <Text style={{ fontSize: 14, color: muted }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '500', color: text }}>{value}</Text>
    </View>
  );
}
