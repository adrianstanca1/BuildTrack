import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDelayNotesStore } from '../../stores/delayNotesStore';
import { useEffect } from 'react';
import type { DelayNoteStatus } from '../../types/field';

function statusColor(status: DelayNoteStatus) {
  switch (status) {
    case 'open': return '#ef4444';
    case 'resolved': return '#10b981';
    case 'closed': return '#6b7280';
    default: return '#6b7280';
  }
}

function statusLabel(status: DelayNoteStatus) {
  switch (status) {
    case 'open': return 'Open';
    case 'resolved': return 'Resolved';
    case 'closed': return 'Closed';
    default: return status;
  }
}

export default function DelayNoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';

  const { delayNotes, fetchDelayNotes, updateDelayNote: _updateDelayNote, deleteDelayNote } = useDelayNotesStore();
  const note = delayNotes.find((n) => n.id === id);

  useEffect(() => {
    if (!note) {
      fetchDelayNotes();
    }
  }, [note, id, fetchDelayNotes]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Delay Note',
      'Are you sure you want to delete this delay note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDelayNote(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!note) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="timer-outline" size={48} color={mutedColor} />
        <Text style={{ color: mutedColor, marginTop: 12, fontSize: 16 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: textColor, flex: 1 }} numberOfLines={1}>
            Delay Note
          </Text>
          <TouchableOpacity onPress={() => router.push(`/delay-notes/edit?id=${note.id}`)} style={{ marginRight: 8 }}>
            <Ionicons name="create-outline" size={22} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              backgroundColor: statusColor(note.status) + '20',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <Text style={{ color: statusColor(note.status), fontSize: 12, fontWeight: '600' }}>
                {statusLabel(note.status)}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '700', color: textColor, marginBottom: 8 }}>
            {note.reason}
          </Text>

          {note.description && (
            <Text style={{ fontSize: 14, color: mutedColor, lineHeight: 20, marginBottom: 12 }}>
              {note.description}
            </Text>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="business-outline" size={16} color={mutedColor} />
            <Text style={{ fontSize: 14, color: mutedColor, marginLeft: 8 }}>{note.projectName}</Text>
          </View>

          {note.linkedRfiId && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Ionicons name="link-outline" size={16} color="#3b82f6" />
              <Text style={{ fontSize: 14, color: '#3b82f6', marginLeft: 8 }}>Linked RFI</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Ionicons name="calendar-outline" size={16} color={mutedColor} />
            <Text style={{ fontSize: 14, color: mutedColor, marginLeft: 8 }}>
              {new Date(note.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
