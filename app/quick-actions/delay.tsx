import { View, Text, TextInput, Pressable, Alert, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function QuickDelayScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ reason: '', linkedRfi: '', impact: '' });

  const handleSubmit = async () => {
    if (!form.reason) {
      Alert.alert('Error', 'Please describe the delay');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Recorded', 'Delay note captured');
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
          <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>Delay Note</Text>
        </View>

        <ScrollView>
          <Text style={labelStyle}>Delay Reason *</Text>
          <TextInput
            style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
            multiline
            value={form.reason}
            onChangeText={(v) => setForm((p) => ({ ...p, reason: v }))}
            placeholder="e.g. Material delivery delayed by 2 days..."
            placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
          />

          <Text style={labelStyle}>Impact</Text>
          <TextInput style={inputStyle} value={form.impact} onChangeText={(v) => setForm((p) => ({ ...p, impact: v }))} placeholder="e.g. 2 days schedule impact" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

          <Text style={labelStyle}>Link to RFI (optional)</Text>
          <TextInput style={inputStyle} value={form.linkedRfi} onChangeText={(v) => setForm((p) => ({ ...p, linkedRfi: v }))} placeholder="RFI-014" placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />

          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: COLORS.warning,
                padding: SPACING.md,
                borderRadius: RADIUS.md,
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{loading ? 'Saving...' : 'Record Delay'}</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/quick-actions/rfi' as any)}
              style={{
                backgroundColor: COLORS.info + '20',
                padding: SPACING.md,
                borderRadius: RADIUS.md,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: COLORS.info, fontWeight: '600', fontSize: 14 }}>Create RFI →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
