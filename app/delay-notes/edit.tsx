import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useDelayNotesStore } from '../../stores/delayNotesStore';

// Edit form for an existing delay note. Mirrors delay-notes/create.tsx
// but loads the current values from useDelayNotesStore() by id, hydrates
// the form state once, then calls updateDelayNote(id, …) on submit.
//
// Wired in via expo-router file-based routing → /delay-notes/edit?id=<uuid>.

const STATUSES = ['open', 'resolved', 'closed'] as const;

export default function EditDelayNoteScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';

  const { delayNotes, fetchDelayNotes, updateDelayNote, loading } = useDelayNotesStore();
  const existing = delayNotes.find((n: any) => n.id === id);

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('open');
  const [linkedRfiId, setLinkedRfiId] = useState('');
  const [hydrated, setHydrated] = useState(false);

  // First mount: trigger a list-fetch so the store has data if the user
  // landed here via a deep-link/refresh.
  useEffect(() => {
    if (!delayNotes || delayNotes.length === 0) fetchDelayNotes();
  }, [delayNotes, fetchDelayNotes]);

  // Hydrate the form once the row materialises in the store.
  useEffect(() => {
    if (hydrated || !existing) return;
    setReason(existing.reason ?? '');
    setDescription(existing.description ?? '');
    setStatus(existing.status ?? 'open');
    setLinkedRfiId(existing.linkedRfiId ?? '');
    setHydrated(true);
  }, [existing, hydrated]);

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
        <View style={{ padding: 24 }}>
          <Text style={{ color: theme.text, fontSize: 16 }}>
            No delay-note id provided in the route.
          </Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: '#3b82f6', fontWeight: '600' }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!existing && !loading) {
    // Store has loaded but the id isn't present — record may have been
    // deleted, or the deep-link is stale.
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
        <View style={{ padding: 24 }}>
          <Text style={{ color: theme.text, fontSize: 16 }}>
            Delay note not found.
          </Text>
          <Pressable onPress={() => router.replace('/delay-notes')} style={{ marginTop: 16 }}>
            <Text style={{ color: '#3b82f6', fontWeight: '600' }}>Back to delay delayNotes</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Reason is required');
      return;
    }
    try {
      await updateDelayNote(id, {
        reason: reason.trim(),
        description: description.trim() || undefined,
        status: status as any,
        linkedRfiId: linkedRfiId.trim() || undefined,
      } as any);
      Alert.alert('Saved', 'Delay note updated', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update delay note');
    }
  };

  const inputStyle = {
    backgroundColor: theme.inputBg,
    borderRadius: 12,
    padding: 14,
    color: theme.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.inputBorder,
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.textMuted,
    marginBottom: 6,
    marginTop: 16,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView className="px-4 py-4">
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginLeft: 12 }}>
            Edit delay note
          </Text>
        </View>

        <Text style={labelStyle}>Reason *</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="What caused the delay"
          placeholderTextColor={theme.textMuted}
          style={inputStyle}
        />

        <Text style={labelStyle}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Additional context"
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={4}
          style={[inputStyle, { minHeight: 96, textAlignVertical: 'top' }]}
        />

        <Text style={labelStyle}>Status</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          {STATUSES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: status === s ? '#3b82f6' : theme.inputBg,
                borderWidth: 1,
                borderColor: status === s ? '#3b82f6' : theme.inputBorder,
              }}
            >
              <Text style={{ color: status === s ? '#fff' : theme.text, fontWeight: '600', textTransform: 'capitalize' }}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={labelStyle}>Linked RFI ID</Text>
        <TextInput
          value={linkedRfiId}
          onChangeText={setLinkedRfiId}
          placeholder="Optional"
          placeholderTextColor={theme.textMuted}
          style={inputStyle}
          autoCapitalize="none"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 24,
            backgroundColor: '#3b82f6',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Save changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
