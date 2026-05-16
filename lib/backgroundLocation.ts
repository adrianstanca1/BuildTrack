import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ─── Constants ────────────────────────────────────────────────────────────
export const BACKGROUND_LOCATION_TASK = 'buildtrack-background-location';
const OFFLINE_QUEUE_KEY = '@buildtrack/checkin_queue';
const ACTIVE_CHECKIN_KEY = '@buildtrack/active_checkin';
const DEFAULT_RADIUS_METERS = 200;
const DISTANCE_WARN_METERS = 500;

// ─── Types ────────────────────────────────────────────────────────────────
interface OfflineCheckInItem {
  id: string;
  type: 'checkin' | 'checkout';
  user_id: string;
  project_id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

interface ActiveCheckIn {
  id: string;
  project_id: string;
  checkInTime: string;
  checkInLat: number;
  checkInLng: number;
}

// ─── Haversine Distance ─────────────────────────────────────────────────
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinGeofence(
  userLat: number,
  userLng: number,
  siteLat: number,
  siteLng: number,
  radius = DEFAULT_RADIUS_METERS
): boolean {
  return getDistanceMeters(userLat, userLng, siteLat, siteLng) <= radius;
}

// ─── Offline Queue Helpers ───────────────────────────────────────────────
async function getOfflineQueue(): Promise<OfflineCheckInItem[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveOfflineQueue(queue: OfflineCheckInItem[]) {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

async function addToOfflineQueue(item: OfflineCheckInItem) {
  const queue = await getOfflineQueue();
  queue.push(item);
  await saveOfflineQueue(queue);
}

export async function syncOfflineQueue(): Promise<boolean> {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return true;

  const failed: OfflineCheckInItem[] = [];
  for (const item of queue) {
    try {
      if (item.type === 'checkin') {
        await supabase.from('check_ins').insert({
          user_id: item.user_id,
          project_id: item.project_id,
          checkInTime: item.timestamp,
          checkInLat: item.lat,
          checkInLng: item.lng,
          gpsVerified: true,
        }).select().single();
      } else {
        await performCheckout(item.project_id, item.lat, item.lng, item.timestamp);
      }
    } catch {
      failed.push(item);
    }
  }

  await saveOfflineQueue(failed);
  return failed.length === 0;
}

// ─── Active Check-in Persistence ──────────────────────────────────────────
async function getActiveCheckIn(): Promise<ActiveCheckIn | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_CHECKIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function setActiveCheckIn(value: ActiveCheckIn | null) {
  if (value) {
    await AsyncStorage.setItem(ACTIVE_CHECKIN_KEY, JSON.stringify(value));
  } else {
    await AsyncStorage.removeItem(ACTIVE_CHECKIN_KEY);
  }
}

// ─── Supabase Helpers ───────────────────────────────────────────────────
async function fetchProjectsWithCoords() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, latitude, longitude, geofence_radius')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id as string,
    name: p.name as string,
    lat: Number(p.latitude),
    lng: Number(p.longitude),
    radius: Number(p.geofence_radius || DEFAULT_RADIUS_METERS),
  }));
}

async function performCheckIn(
  userId: string,
  projectId: string,
  lat: number,
  lng: number,
  timestamp: string = new Date().toISOString()
) {
  const projects = await fetchProjectsWithCoords();
  const project = projects.find((p) => p.id === projectId);
  let distance: number | null = null;
  if (project) {
    distance = getDistanceMeters(lat, lng, project.lat, project.lng);
    if (distance > DISTANCE_WARN_METERS) {
      console.warn(`[BuildTrack] Check-in distance from site is ${Math.round(distance)}m (> ${DISTANCE_WARN_METERS}m)`);
    }
  }

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: userId,
      project_id: projectId,
      checkInTime: timestamp,
      checkInLat: lat,
      checkInLng: lng,
      gpsVerified: true,
      distanceFromSite: distance,
    })
    .select()
    .single();

  if (error) {
    console.error('[BuildTrack] Check-in insert failed, queuing offline:', error.message);
    await addToOfflineQueue({ id: `${Date.now()}_in`, type: 'checkin', user_id: userId, project_id: projectId, lat, lng, timestamp });
    throw error;
  }

  const active: ActiveCheckIn = {
    id: (data as any).id,
    project_id: projectId,
    checkInTime: timestamp,
    checkInLat: lat,
    checkInLng: lng,
  };
  await setActiveCheckIn(active);
  return active;
}

async function performCheckout(
  projectId: string,
  lat: number,
  lng: number,
  timestamp: string = new Date().toISOString()
) {
  const active = await getActiveCheckIn();
  if (!active || active.project_id !== projectId) {
    console.warn('[BuildTrack] No active check-in for project', projectId);
    return;
  }

  const projects = await fetchProjectsWithCoords();
  const project = projects.find((p) => p.id === projectId);
  let distance: number | null = null;
  if (project) {
    distance = getDistanceMeters(lat, lng, project.lat, project.lng);
    if (distance > DISTANCE_WARN_METERS) {
      console.warn(`[BuildTrack] Check-out distance from site is ${Math.round(distance)}m (> ${DISTANCE_WARN_METERS}m)`);
    }
  }

  const checkInTime = new Date(active.checkInTime).getTime();
  const checkOutTime = new Date(timestamp).getTime();
  const durationMinutes = Math.max(0, Math.round((checkOutTime - checkInTime) / 60000));

  const { error } = await supabase
    .from('check_ins')
    .update({
      checkOutTime: timestamp,
      checkOutLat: lat,
      checkOutLng: lng,
      gpsVerified: true,
      distanceFromSite: distance,
      durationMinutes,
    })
    .eq('id', active.id);

  if (error) {
    console.error('[BuildTrack] Check-out update failed, queuing offline:', error.message);
    // For offline checkout queue we need to record project_id + lat/lng only.
    // A background task may not easily know userId; we'll read from auth session.
    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData.user?.id ?? 'unknown';
    await addToOfflineQueue({ id: `${Date.now()}_out`, type: 'checkout', user_id: userId, project_id: projectId, lat, lng, timestamp });
    throw error;
  }

  await setActiveCheckIn(null);
}

// ─── Exported API ───────────────────────────────────────────────────────
export async function manualCheckIn(userId: string, projectId: string): Promise<ActiveCheckIn> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }
  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
  return performCheckIn(userId, projectId, loc.coords.latitude, loc.coords.longitude);
}

export async function manualCheckOut(projectId: string) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }
  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
  return performCheckout(projectId, loc.coords.latitude, loc.coords.longitude);
}

export async function getTodayCheckIns(userId?: string, projectId?: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let query = supabase
    .from('check_ins')
    .select('*')
    .gte('checkInTime', todayStart.toISOString())
    .order('checkInTime', { ascending: false });

  if (userId) query = query.eq('user_id', userId);
  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getRecentCheckIns(userId?: string, projectId?: string, limit = 20) {
  let query = supabase
    .from('check_ins')
    .select('*')
    .order('checkInTime', { ascending: false })
    .limit(limit);

  if (userId) query = query.eq('user_id', userId);
  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getActiveCheckInAPI(): Promise<ActiveCheckIn | null> {
  return getActiveCheckIn();
}

// ─── Background Task ──────────────────────────────────────────────────────
// Note: requires `expo-location` and `expo-task-manager` installed.
// If not available this file gracefully degrades (guarded by typeof checks).

if (typeof TaskManager !== 'undefined' && TaskManager.defineTask) {
  TaskManager.defineTask<{
    locations?: Location.LocationObject[];
  }>(
    BACKGROUND_LOCATION_TASK,
    async (taskBody: {
      data?: { locations?: Location.LocationObject[] };
      error?: any;
    }) => {
      if (taskBody.error) {
        console.error('[BuildTrack] Background location task error:', taskBody.error);
        return;
      }
      const locations = taskBody.data?.locations;
      if (!locations || locations.length === 0) return;

      const loc = locations[0];
      const userLat = loc.coords.latitude;
      const userLng = loc.coords.longitude;

      try {
        const projects = await fetchProjectsWithCoords();
        const active = await getActiveCheckIn();

        // Check for entering any geofence
        for (const p of projects) {
          const inside = isWithinGeofence(userLat, userLng, p.lat, p.lng, p.radius);
          if (inside && (!active || active.project_id !== p.id)) {
            const { data: sessionData } = await supabase.auth.getUser();
            const userId = sessionData.user?.id;
            if (!userId) continue;
            await performCheckIn(userId, p.id, userLat, userLng);
          }
        }

        // Check for exiting current active geofence
        if (active) {
          const activeProject = projects.find((p) => p.id === active.project_id);
          if (activeProject) {
            const stillInside = isWithinGeofence(userLat, userLng, activeProject.lat, activeProject.lng, activeProject.radius);
            if (!stillInside) {
              await performCheckout(active.project_id, userLat, userLng);
            }
          }
        }
      } catch (e: any) {
        console.error('[BuildTrack] Geofence processing error:', e.message);
      }
    }
  );
}

export async function registerBackgroundLocationTask(): Promise<boolean> {
  try {
    if (typeof TaskManager === 'undefined') {
      console.warn('[BuildTrack] expo-task-manager not installed; background location disabled');
      return false;
    }
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (hasStarted) return true;

    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[BuildTrack] Background location permission denied');
      return false;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000, // 60s
      distanceInterval: 50, // 50m
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'BuildTrack Location',
        notificationBody: 'Tracking site presence for automatic check-in/out',
      },
    });
    return true;
  } catch (e: any) {
    console.error('[BuildTrack] Failed to register background location:', e.message);
    return false;
  }
}

export async function unregisterBackgroundLocationTask(): Promise<void> {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch (e: any) {
    console.error('[BuildTrack] Failed to unregister background location:', e.message);
  }
}

// ─── Network Reconnect Listener ───────────────────────────────────────────
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function listenForNetworkReconnect() {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        syncOfflineQueue();
      }, 3000);
    });
  }
}
