import { View, Text, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const quickActions = [
  { key: 'punch', label: 'Punch Item', icon: 'hammer' as const, color: COLORS.danger, path: '/quick-actions/punch' },
  { key: 'photo', label: 'Photo', icon: 'camera' as const, color: COLORS.primary[500], path: '/quick-actions/photo' },
  { key: 'delay', label: 'Delay Note', icon: 'time' as const, color: COLORS.warning, path: '/quick-actions/delay' },
  { key: 'safety', label: 'Safety', icon: 'shield-checkmark' as const, color: COLORS.success, path: '/quick-actions/safety' },
  { key: 'rfi', label: 'Quick RFI', icon: 'chatbox-ellipses' as const, color: COLORS.info, path: '/quick-actions/rfi' },
];

export default function QuickActionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <ScrollView style={{ padding: SPACING.md }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text, marginBottom: SPACING.md }}>
          Quick Actions
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, marginBottom: SPACING.lg }}>
          Capture field events in under 30 seconds
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
          {quickActions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => router.push(action.path as any)}
              style={{
                width: '47%',
                aspectRatio: 1,
                borderRadius: RADIUS.lg,
                backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
                borderWidth: 1,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                alignItems: 'center',
                justifyContent: 'center',
                padding: SPACING.md,
              }}
            >
              <View style={{
                width: 56,
                height: 56,
                borderRadius: RADIUS.md,
                backgroundColor: action.color + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.sm,
              }}>
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: isDark ? COLORS.dark.text : COLORS.light.text, textAlign: 'center' }}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
