import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useProjectsStore } from '../../stores/projectsStore';
import {
  manualCheckIn,
  manualCheckOut,
  getTodayCheckIns,
  getRecentCheckIns,
  getActiveCheckInAPI,
  syncOfflineQueue,
} from '../../lib/backgroundLocation';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function CheckInsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const { selectedProject } = useProjectsStore();
  const [today, setToday] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getUser();
      const userId = session.user?.id;
      const projectId = selectedProject?.id;
      const [t, r, a] = await Promise.all([
        getTodayCheckIns(userId, projectId),
        getRecentCheckIns(userId, projectId, 20),
        getActiveCheckInAPI(),
      ]);
      setToday(t);
      setRecent(r);
      setActive(a);
    } catch (e: any) {
      console.error('Check-ins fetch error:', e.message);
    }
  }, [selectedProject]);

  useEffect(() => {
    fetch();
    syncOfflineQueue();
    // Attempt to read GPS accuracy from a one-shot location request
    try {
      const { requestForegroundPermissionsAsync, getCurrentPositionAsync } = require('expo-location');
      requestForegroundPermissionsAsync().then((perm: any) => {
        if (perm.status === 'granted') {
          getCurrentPositionAsync({ accuracy: 1 }).then((loc: any) => {
            setGpsAccuracy(loc.coords.accuracy ?? null);
          });
        }
      });
    } catch {
      // expo-location may not be available in all environments
    }
  }, [fetch]);

  const handleCheckIn = async () => {
    try {
      setActionBusy(true);
      const { data: session } = await supabase.auth.getUser();
      const userId = session.user?.id;
      const projectId = selectedProject?.id;
      if (!userId) {
        Alert.alert('Sign in required', 'Please log in to check in.');
        return;
      }
      if (!projectId) {
        Alert.alert('No project selected', 'Select a project from the dashboard first.');
        return;
      }
      const res = await manualCheckIn(userId, projectId);
      setActive(res);
      await fetch();
    } catch (e: any) {
      Alert.alert('Check-in failed', e.message || 'Unknown error');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionBusy(true);
      const projectId = selectedProject?.id;
      if (!projectId) {
        Alert.alert('No project selected', 'Select a project to check out from.');
        return;
      }
      await manualCheckOut(projectId);
      setActive(null);
      await fetch();
    } catch (e: any) {
      Alert.alert('Check-out failed', e.message || 'Unknown error');
    } finally {
      setActionBusy(false);
    }
  };

  const durationText = () => {
    if (!active) return null;
    const diff = Math.max(0, Date.now() - new Date(active.checkInTime).getTime());
    const min = Math.floor(diff / 60000);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING['2xl'] }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: SPACING.sm }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: theme.text }}>
            Check-ins
          </Text>
        </View>

        {/* GPS indicator */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: gpsAccuracy != null && gpsAccuracy < 20 ? '#22c55e20' : '#f59e0b20',
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.xs,
            borderRadius: RADIUS.full,
            marginBottom: SPACING.md,
          }}
        >
          <Ionicons name="locate" size={14} color={gpsAccuracy != null && gpsAccuracy < 20 ? '#22c55e' : '#f59e0b'} />
          <Text
            style={{
              marginLeft: 6,
              fontSize: TYPOGRAPHY.small.fontSize,
              fontWeight: '600',
              color: gpsAccuracy != null && gpsAccuracy < 20 ? '#22c55e' : '#f59e0b',
            }}
          >
            {gpsAccuracy != null ? `GPS ±${Math.round(gpsAccuracy)}m` : 'GPS unavailable'}
          </Text>
        </View>

        {/* Project name */}
        <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: theme.textMuted, marginBottom: SPACING.sm }}>
          {selectedProject?.name || 'No project selected'}
        </Text>

        {/* Clock-in / Clock-out big buttons */}
        <View style={{ alignItems: 'center', marginVertical: SPACING.lg }}>
          <TouchableOpacity
            onPress={active ? handleCheckOut : handleCheckIn}
            disabled={actionBusy}
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: active ? '#ef4444' : '#22c55e',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {actionBusy ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Ionicons name={active ? 'log-out-outline' : 'log-in-outline'} size={36} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: TYPOGRAPHY.h3.fontSize, marginTop: SPACING.xs }}>
                  {active ? 'Clock Out' : 'Clock In'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {active && (
            <View style={{ marginTop: SPACING.md, alignItems: 'center' }}>
              <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: theme.textSecondary }}>
                Clocked in • {new Date(active.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: '700', color: theme.text, marginTop: SPACING.xs }}>
                {durationText()}
              </Text>
            </View>
          )}
        </View>

        {/* Today summary */}
        <View
          style={{
            backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
            marginBottom: SPACING.md,
          }}
        >
          <Text style={{ fontSize: TYPOGRAPHY.bodyMedium.fontSize, fontWeight: '600', color: theme.text, marginBottom: SPACING.sm }}>
            Today • {today.length} check-in{today.length !== 1 ? 's' : ''}
          </Text>
          {today.length === 0 ? (
            <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: theme.textMuted }}>
              No check-ins for today yet.
            </Text>
          ) : (
            today.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: theme.textSecondary }}>
                    {new Date(item.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    {item.checkOutTime
                      ? ` – ${new Date(item.checkOutTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                      : ' – active'}
                  </Text>
                  {item.durationMinutes != null && (
                    <Text style={{ fontSize: TYPOGRAPHY.small.fontSize, color: theme.textMuted, marginTop: 2 }}>
                      {item.durationMinutes} min • {item.distanceFromSite != null ? `${Math.round(item.distanceFromSite)}m from site` : 'no distance'}
                    </Text>
                  )}
                </View>
                {item.gpsVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                )}
              </View>
            ))
          )}
        </View>

        {/* Recent list */}
        <View
          style={{
            backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
          }}
        >
          <Text style={{ fontSize: TYPOGRAPHY.bodyMedium.fontSize, fontWeight: '600', color: theme.text, marginBottom: SPACING.sm }}>
            Recent
          </Text>
          {recent.length === 0 ? (
            <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: theme.textMuted }}>
              No recent check-ins.
            </Text>
          ) : (
            recent.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: item.checkOutTime ? '#64748b' : '#22c55e',
                    marginRight: SPACING.sm,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: theme.textSecondary }}>
                    {new Date(item.checkInTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: theme.textMuted, marginTop: 2 }}>
                    {item.checkOutTime ? `Checked out after ${item.durationMinutes ?? '?'} min` : 'Still checked in'}
                  </Text>
                </View>
                {item.gpsVerified && (
                  <Ionicons name="location-sharp" size={14} color={theme.textMuted} />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
