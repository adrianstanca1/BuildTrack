import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../stores/teamStore';
import { useEffect } from 'react';
import type { WorkerStatus, WorkerRole } from '../../types';

function statusColor(status: WorkerStatus) {
  switch (status) {
    case 'active': return '#10b981';
    case 'off-duty': return '#f59e0b';
    case 'on-leave': return '#3b82f6';
    default: return '#6b7280';
  }
}

function roleIcon(role: WorkerRole): string {
  const map: Record<string, string> = {
    foreman: 'construct', electrician: 'flash', plumber: 'water', carpenter: 'hammer',
    mason: 'cube', laborer: 'body', engineer: 'settings', 'safety-officer': 'shield-checkmark',
  };
  return map[role] || 'person';
}

export default function TeamMemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const card = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#e2e8f0' : '#1e293b';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  const { workers, toggleActive, deleteWorker } = useTeamStore();
  const worker = workers.find((w) => w.id === id);

  useEffect(() => {
    if (!worker) router.back();
  }, [worker]);

  if (!worker) return null;

  const handleToggleStatus = () => {
    const next = worker.status === 'active' ? 'off-duty' : 'active';
    Alert.alert('Change Status?', `Set ${worker.name} to ${next}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => toggleActive(worker.id) },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Remove Team Member?', `"${worker.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteWorker(worker.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: text, flex: 1 }}>Team Member</Text>
        <TouchableOpacity onPress={() => router.push(`/team/edit?id=${worker.id}`)}>
          <Ionicons name="create-outline" size={22} color={text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header card */}
        <View style={{ backgroundColor: card, borderRadius: 12, padding: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: border }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#3b82f620', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Ionicons name={roleIcon(worker.role) as any} size={28} color="#3b82f6" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: text }}>{worker.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={{ backgroundColor: statusColor(worker.status) + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: statusColor(worker.status) }}>{worker.status}</Text>
            </View>
            <Text style={{ fontSize: 13, color: muted, marginLeft: 10 }}>{worker.role}</Text>
          </View>
        </View>

        {/* Contact info */}
        <View style={{ backgroundColor: card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: border }}>
          <DetailRow label="Phone" value={worker.phone || '—'} text={text} muted={muted} />
          <DetailRow label="Email" value={worker.email || '—'} text={text} muted={muted} />
          <DetailRow label="Weekly Hours" value={`${worker.weeklyHours}h`} text={text} muted={muted} />
        </View>

        {/* Certifications */}
        {worker.certifications && worker.certifications.length > 0 && (
          <View style={{ backgroundColor: card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: border }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: text, marginBottom: 10 }}>Certifications</Text>
            {worker.certifications.map((cert, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, color: text }}>{cert}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Project assignments */}
        {worker.projectAssignments && worker.projectAssignments.length > 0 && (
          <View style={{ backgroundColor: card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: border }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: text, marginBottom: 10 }}>Project Assignments</Text>
            {worker.projectAssignments.map((proj, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                <Ionicons name="business" size={16} color="#3b82f6" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, color: text }}>{proj}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Toggle status */}
        <TouchableOpacity
          onPress={handleToggleStatus}
          style={{ backgroundColor: statusColor(worker.status) + '15', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: statusColor(worker.status) + '40' }}
        >
          <Text style={{ color: statusColor(worker.status), fontSize: 16, fontWeight: '600' }}>
            Toggle Status ({worker.status === 'active' ? 'Set Off-Duty' : 'Set Active'})
          </Text>
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity onPress={handleDelete} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: '#ef4444', fontSize: 14 }}>Remove Team Member</Text>
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
