import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/constants/theme';

const ACTIONS = [
  {
    key: 'punch',
    label: 'Punch Item',
    sublabel: 'Log a snag or incomplete work item',
    icon: 'construct-outline' as const,
    color: '#f97316',
    route: '/quick-actions/punch' as const,
  },
  {
    key: 'photo',
    label: 'Site Photo',
    sublabel: 'Snap and tag a photo with project context',
    icon: 'camera-outline' as const,
    color: '#8b5cf6',
    route: '/quick-actions/photo' as const,
  },
  {
    key: 'delay',
    label: 'Delay Note',
    sublabel: 'Record a delay reason with timestamp',
    icon: 'time-outline' as const,
    color: '#ef4444',
    route: '/quick-actions/delay' as const,
  },
  {
    key: 'safety',
    label: 'Safety Observation',
    sublabel: 'Report a hazard or near-miss fast',
    icon: 'warning-outline' as const,
    color: '#eab308',
    route: '/quick-actions/safety' as const,
  },
  {
    key: 'rfi',
    label: 'RFI',
    sublabel: 'Request for Information — ask a question',
    icon: 'chatbubble-ellipses-outline' as const,
    color: '#3b82f6',
    route: '/quick-actions/rfi' as const,
  },
];

export default function QuickActionsHub() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      <View className="px-4 pt-2 pb-4 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="close-outline" size={28} color={COLORS.dark.textMuted} />
        </Pressable>
        <Text className="text-white text-xl font-bold">Quick Actions</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.key}
            onPress={() => router.push(action.route)}
            className="bg-[#1e293b] rounded-2xl p-4 mb-3 flex-row items-center active:opacity-80"
            android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
          >
            <View
              className="rounded-xl p-3 mr-4"
              style={{ backgroundColor: action.color + '20' }}
            >
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">{action.label}</Text>
              <Text className="text-[#64748b] text-sm mt-0.5">{action.sublabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.dark.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
