import { View, Text, Pressable, Alert, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function QuickPhotoScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Captured', 'Photo uploaded');
      router.back();
    }, 800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }} edges={['top']}>
      <View style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: SPACING.sm }}>
            <Ionicons name="arrow-back" size={24} color={isDark ? COLORS.dark.text : COLORS.light.text} />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? COLORS.dark.text : COLORS.light.text }}>Quick Photo</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 200,
            height: 200,
            borderRadius: RADIUS.lg,
            backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
            borderWidth: 2,
            borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: SPACING.lg,
          }}>
            <Ionicons name="camera" size={48} color={COLORS.primary[500]} />
            <Text style={{ marginTop: SPACING.sm, color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted, fontSize: 14 }}>Tap to capture</Text>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: COLORS.primary[500],
              paddingHorizontal: SPACING.xl,
              paddingVertical: SPACING.md,
              borderRadius: RADIUS.md,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{loading ? 'Uploading...' : 'Capture Photo'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
