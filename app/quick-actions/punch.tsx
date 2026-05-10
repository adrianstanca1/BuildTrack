import { View, Text, TextInput, Pressable, Alert, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProjectsStore } from '../../stores/projectsStore';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function QuickPunchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { projects } = useProjectsStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    location: '',
    severity: 'medium',
    assignee: '',
  });

  const handleSubmit = async () => {
    if (!form.projectId || !form.title) {
      Alert.alert('Error', 'Project and title are required');
      return;
    }
    setLoading(true);
    // TODO: call API
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Created', 'Punch item recorded');
      router.back();
    }, 800);
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    color: isDark ? COLORS.dark.text : COLORS.light.text,
    backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
    marginBottom: SPACING.md,
  };

  const labelStyle = { fontSize: 14, fontWeight: '500' as const, color: isDark ? COLORS.dark.text : COLORS.light.text, marginBottom: 4 };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <View style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: SPACING.sm }}>
            <Ionicons name="arrow-back" size={24} color={isDark ? COLORS.dark.text : COLORS.light.text} />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>Quick Punch</Text>
        </View>

        <ScrollView>
          <Text style={labelStyle}>Project *</Text>
          <View style={inputStyle}>
            <Text style={{ color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }}>Select project...</Text>
          </View>

          <Text style={labelStyle}>Title *</Text>
          <TextInput style={inputStyle} value={form.title} onChangeText={(v) => setForm((p) => ({ ...p, title: v }))} placeholder="e.g. Cracked tile in lobby" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

          <Text style={labelStyle}>Location</Text>
          <TextInput style={inputStyle} value={form.location} onChangeText={(v) => setForm((p) => ({ ...p, location: v }))} placeholder="e.g. Level 2, West Wing" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

          <Text style={labelStyle}>Severity</Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
            {['low', 'medium', 'high', 'critical'].map((s) => (
              <Pressable
                key={s}
                onPress={() => setForm((p) => ({ ...p, severity: s }))}
                style={{
                  flex: 1,
                  padding: SPACING.sm,
                  borderRadius: RADIUS.md,
                  backgroundColor: form.severity === s ? COLORS.danger + '20' : isDark ? COLORS.dark.surface : COLORS.light.surface,
                  borderWidth: 1,
                  borderColor: form.severity === s ? COLORS.danger : isDark ? COLORS.dark.border : COLORS.light.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: form.severity === s ? COLORS.danger : isDark ? COLORS.dark.text : COLORS.light.text, textTransform: 'capitalize' }}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: COLORS.danger,
              padding: SPACING.md,
              borderRadius: RADIUS.md,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{loading ? 'Creating...' : 'Create Punch Item'}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
