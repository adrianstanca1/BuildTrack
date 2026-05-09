import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjectsStore } from '../../stores/projectsStore';
import { Project } from '../../types';
import { colors } from '../../constants/colors';
import ProjectMarker from '../../components/map/ProjectMarker';

// ------------------------------------------------------------------
// Geocoding helpers — mock lat/lng generation keyed by location text
// so markers stay stable across renders. Replace with real geocoding
// when Supabase / API integration is ready.
// ------------------------------------------------------------------

const locationCache = new Map<string, { latitude: number; longitude: number }>();

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getMockCoordinates(location: string): { latitude: number; longitude: number } {
  if (locationCache.has(location)) {
    return locationCache.get(location)!;
  }
  const hash = hashString(location);
  // Downtown-ish spread around ~37.7749, -122.4194 (San Francisco)
  // You can adjust the base coordinates to your region.
  const baseLat = 37.7749;
  const baseLng = -122.4194;
  const lat = baseLat + ((hash % 1000) / 1000 - 0.5) * 0.15;
  const lng = baseLng + ((hash % 10000) / 10000 - 0.5) * 0.3;
  const coords = { latitude: lat, longitude: lng };
  locationCache.set(location, coords);
  return coords;
}

// ------------------------------------------------------------------
// Status filter config
// ------------------------------------------------------------------

type FilterKey = 'all' | Project['status'];

const filterOptions: { key: FilterKey; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: colors.gray },
  { key: 'planning', label: 'Planning', color: '#0891b2' },
  { key: 'active', label: 'Active', color: '#16a34a' },
  { key: 'on-hold', label: 'On Hold', color: '#ca8a04' },
  { key: 'completed', label: 'Completed', color: '#2563eb' },
  { key: 'cancelled', label: 'Cancelled', color: '#dc2626' },
];

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function MapScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mapRef = useRef<MapView>(null);

  const { projects } = useProjectsStore();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [mapReady, setMapReady] = useState(false);

  // Enrich projects with mock coordinates
  const projectsWithCoords = useMemo(
    () =>
      projects.map((p) => ({
        ...p,
        coords: getMockCoordinates(p.location),
      })),
    [projects]
  );

  // Filtered list
  const visibleProjects = useMemo(() => {
    if (activeFilter === 'all') return projectsWithCoords;
    return projectsWithCoords.filter((p) => p.status === activeFilter);
  }, [projectsWithCoords, activeFilter]);

  // Compute initial region from visible projects
  const initialRegion = useMemo((): Region => {
    if (visibleProjects.length === 0) {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.15,
        longitudeDelta: 0.3,
      };
    }
    const lats = visibleProjects.map((p) => p.coords.latitude);
    const lngs = visibleProjects.map((p) => p.coords.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latDelta = Math.max((maxLat - minLat) * 1.4, 0.02);
    const lngDelta = Math.max((maxLng - minLng) * 1.4, 0.02);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [visibleProjects]);

  // Recenter to fit all visible markers
  const recenter = useCallback(() => {
    if (!mapRef.current || visibleProjects.length === 0) return;
    const coords = visibleProjects.map((p) => p.coords);
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 100, right: 60, bottom: 200, left: 60 },
      animated: true,
    });
  }, [visibleProjects]);

  // On map ready, fit to coordinates once
  const handleMapReady = useCallback(() => {
    setMapReady(true);
    if (visibleProjects.length > 0) {
      setTimeout(() => recenter(), 300);
    }
  }, [visibleProjects, recenter]);

  // Navigate to project details
  const handleProjectPress = useCallback(
    (projectId: string) => {
      router.push(`/(modals)/project-details?id=${projectId}` as any);
    },
    [router]
  );

  // Count badge per status
  const statusCount = useCallback(
    (key: FilterKey) => {
      if (key === 'all') return projects.length;
      return projects.filter((p) => p.status === key).length;
    },
    [projects]
  );

  return (
    <View className="flex-1 relative">
      {/* Map */}
      <MapView
        ref={mapRef}
        className="flex-1"
        initialRegion={initialRegion}
        onMapReady={handleMapReady}
        mapType={isDark ? 'mutedStandard' : 'standard'}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        userInterfaceStyle={isDark ? 'dark' : 'light'}
      >
        {visibleProjects.map((project) => (
          <ProjectMarker
            key={project.id}
            project={project}
            latitude={project.coords.latitude}
            longitude={project.coords.longitude}
            onPress={() => handleProjectPress(project.id)}
          />
        ))}
      </MapView>

      {/* Loading overlay */}
      {!mapReady && (
        <View className="absolute inset-0 items-center justify-center bg-black/20">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Top filter bar */}
      <View
        className="absolute top-12 left-4 right-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isDark ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.92)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <View className="px-3 py-2">
          <Text
            className="text-sm font-bold mb-2"
            style={{ color: isDark ? '#ffffff' : '#111827' }}
          >
            Projects ({visibleProjects.length})
          </Text>
          <View className="flex-row flex-wrap -mx-1">
            {filterOptions.map((opt) => {
              const active = activeFilter === opt.key;
              const count = statusCount(opt.key);
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setActiveFilter(opt.key)}
                  className="mx-1 mb-2 px-3 py-1.5 rounded-full flex-row items-center"
                  style={{
                    backgroundColor: active ? opt.color : isDark ? '#374151' : '#f3f4f6',
                  }}
                >
                  <View
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: active ? '#ffffff' : opt.color }}
                  />
                  <Text
                    className="text-xs font-medium"
                    style={{ color: active ? '#ffffff' : isDark ? '#d1d5db' : '#374151' }}
                  >
                    {opt.label}
                  </Text>
                  <View
                    className="ml-1.5 px-1.5 rounded-full"
                    style={{
                      backgroundColor: active ? 'rgba(255,255,255,0.25)' : isDark ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Text
                      className="text-[10px] font-bold"
                      style={{ color: active ? '#ffffff' : isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Recenter button */}
      <Pressable
        onPress={recenter}
        className="absolute bottom-8 right-4 w-12 h-12 rounded-full items-center justify-center"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Ionicons name="locate" size={22} color={colors.primary} />
      </Pressable>

      {/* Project count pill (bottom-left) */}
      <View
        className="absolute bottom-8 left-4 px-3 py-2 rounded-full flex-row items-center"
        style={{
          backgroundColor: isDark ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.92)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Ionicons name="construct" size={14} color={colors.primary} />
        <Text
          className="text-xs font-semibold ml-1.5"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {visibleProjects.length} shown
        </Text>
      </View>
    </View>
  );
}
