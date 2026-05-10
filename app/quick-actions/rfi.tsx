import { View, Text, TextInput, Pressable, Alert, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function QuickRFIScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ projectId: '', subject: '', question: '', priority: 'normal' });

  const handleSubmit = async () => {
    if (!form.projectId || !form.subject || !form.question) {
      Alert.alert('Error', 'Project, subject, and question are required');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Created', 'RFI submitted');
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
          <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>Quick RFI</Text>
        </View>

        <ScrollView>
          <Text style={labelStyle}>Project ID *</Text>
          <TextInput style={inputStyle} value={form.projectId} onChangeText={(v) => setForm((p) => ({ ...p, projectId: v }))} placeholder="Enter project ID" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

          <Text style={labelStyle}>Subject *</Text>
          <TextInput style={inputStyle} value={form.subject} onChangeText={(v) => setForm((p) => ({ ...p, subject: v }))} placeholder="e.g. Clarification on foundation depth" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

          <Text style={labelStyle}>Question *</Text>
          <TextInput
            style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
            multiline
            value={form.question}
            onChangeText={(v) => setForm((p) => ({ ...p, question: v }))}
            placeholder="Enter your question..."
            placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
          />

          <Text style={labelStyle}>Priority</Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
            {['low', 'normal', 'high', 'urgent'].map((s) => (
              <Pressable
                key={s}
                onPress={() => setForm((p) => ({ ...p, priority: s }))}
                style={{
                  flex: 1,
                  padding: SPACING.sm,
                  borderRadius: RADIUS.md,
                  backgroundColor: form.priority === s ? COLORS.info + '20' : isDark ? COLORS.dark.surface : COLORS.light.surface,
                  borderWidth: 1,
                  borderColor: form.priority === s ? COLORS.info : isDark ? COLORS.dark.border : COLORS.light.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: form.priority === s ? COLORS.info : isDark ? COLORS.dark.text : COLORS.light.text, textTransform: 'capitalize' }}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: COLORS.info,
              padding: SPACING.md,
              borderRadius: RADIUS.md,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{loading ? 'Submitting...' : 'Submit RFI'}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
