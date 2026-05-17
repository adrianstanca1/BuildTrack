import React from 'react';
import { View, Text, Pressable , useColorScheme } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Project, ProjectStatus } from '../../types';
import { colors } from '../../constants/colors';
import { useRouter } from 'expo-router';

interface ProjectMarkerProps {
  project: Project;
  latitude: number;
  longitude: number;
  onPress?: () => void;
}

const statusColors: Record<ProjectStatus, string> = {
  planning: '#0891b2',   // info / cyan
  active: '#16a34a',     // success / green
  'on-hold': '#ca8a04',  // warning / amber
  completed: '#2563eb',  // primary / blue
  cancelled: '#dc2626',  // danger / red
};

export default function ProjectMarker({ project, latitude, longitude, onPress }: ProjectMarkerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const pinColor = statusColors[project.status] || colors.gray;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      pinColor={pinColor}
      onPress={onPress}
    >
      <Callout
        tooltip
        onPress={() => router.push(`/(modals)/project-details?id=${project.id}`)}
      >
        <View
          className="rounded-xl overflow-hidden shadow-lg"
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            width: 240,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          {/* Header bar with status colour */}
          <View
            className="px-3 py-2"
            style={{ backgroundColor: pinColor }}
          >
            <Text className="text-white text-sm font-bold" numberOfLines={1}>
              {project.name}
            </Text>
          </View>

          {/* Body */}
          <View className="px-3 py-2">
            <View className="flex-row items-center mb-1">
              <Ionicons name="location" size={12} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text
                className="text-xs ml-1 flex-1"
                style={{ color: isDark ? '#d1d5db' : '#374151' }}
                numberOfLines={1}
              >
                {project.location}
              </Text>
            </View>

            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={12} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text
                className="text-xs ml-1"
                style={{ color: isDark ? '#d1d5db' : '#374151' }}
              >
                {new Date(project.endDate).toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Ionicons name="people" size={12} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text
                className="text-xs ml-1"
                style={{ color: isDark ? '#d1d5db' : '#374151' }}
              >
                {project.teamSize} workers
              </Text>
            </View>

            {/* Progress bar */}
            <View className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
              <View
                className="h-full rounded-full"
                style={{ width: `${project.progress}%`, backgroundColor: pinColor }}
              />
            </View>
            <Text
              className="text-xs text-right"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
            >
              {project.progress}% complete
            </Text>
          </View>

          {/* Footer / CTA */}
          <Pressable
            onPress={() => router.push(`/(modals)/project-details?id=${project.id}` as any)}
            className="px-3 py-2 border-t"
            style={{ borderTopColor: isDark ? '#374151' : '#e5e7eb' }}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-xs font-semibold mr-1" style={{ color: colors.primary }}>
                View Details
              </Text>
              <Ionicons name="arrow-forward" size={12} color={colors.primary} />
            </View>
          </Pressable>
        </View>
      </Callout>
    </Marker>
  );
}
