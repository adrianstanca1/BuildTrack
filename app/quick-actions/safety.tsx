import { View, Text, TextInput, Pressable, Alert, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function QuickSafetyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ observation: '', severity: 'low' });

  const handleSubmit = async () => {
    if (!form.observation) {
      Alert.alert('Error', 'Please describe the safety observation');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Recorded', 'Safety observation captured');
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
          <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>Safety Observation</Text>
        </View>

        <ScrollView>
          <Text style={labelStyle}>Severity</Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
            {['low', 'medium', 'high', 'critical'].map((s) => (
              <Pressable
                key={s}
                onPress={() => setForm((p) => ({ ...p, severity: s }))}
                style={{
                  flex: 1,
                  padding: SPACING.sm,
                  borderRadius: RADIUS.md,
                  backgroundColor: form.severity === s ? COLORS.success + '20' : isDark ? COLORS.dark.surface : COLORS.light.surface,
                  borderWidth: 1,
                  borderColor: form.severity === s ? COLORS.success : isDark ? COLORS.dark.border : COLORS.light.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: form.severity === s ? COLORS.success : isDark ? COLORS.dark.text : COLORS.light.text, textTransform: 'capitalize' }}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={labelStyle}>Observation *</Text>
          <TextInput
            style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
            multiline
            value={form.observation}
            onChangeText={(v) => setForm((p) => ({ ...p, observation: v }))}
            placeholder="Describe what you observed..."
            placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: COLORS.success,
              padding: SPACING.md,
              borderRadius: RADIUS.md,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{loading ? 'Saving...' : 'Record Safety Observation'}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
