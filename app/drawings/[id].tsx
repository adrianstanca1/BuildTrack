import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useDrawingsStore } from '../../stores/drawingsStore';
import { useDrawingPinsStore } from '../../stores/drawingPinsStore';
import { useProjectsStore } from '../../stores/projectsStore';
import PinOverlay from '../../components/PinOverlay';
import { PinLegend } from '../../components/PinLegend';
import { Card } from '../../components/ui/Card';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import type { DrawingPinOverlayItem } from '../../components/PinOverlay';

const { width: SCREEN_W } = Dimensions.get('window');

export default function DrawingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { drawings, updateDrawing, deleteDrawing } = useDrawingsStore();
  const { projects } = useProjectsStore();
  const { pins, fetchPins, createPin, updatePin } = useDrawingPinsStore();

  const drawing = drawings.find((d) => d.id === id);
  const [status, setStatus] = useState(drawing?.status || 'active');
  const [saving, setSaving] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: SCREEN_W, height: SCREEN_W });

  useEffect(() => {
    if (id) {
      fetchPins(id as string);
    }
  }, [id, fetchPins]);

  const imgScale = useSharedValue(1);
  const imgTranslateX = useSharedValue(0);
  const imgTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = Math.max(1, Math.min(event.scale, 5));
      imgScale.value = newScale;
    })
    .onEnd(() => {
      if (imgScale.value < 1) {
        imgScale.value = withSpring(1, { damping: 15 });
        imgTranslateX.value = withSpring(0, { damping: 15 });
        imgTranslateY.value = withSpring(0, { damping: 15 });
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onUpdate((event) => {
      if (imgScale.value > 1) {
        imgTranslateX.value = event.translationX;
        imgTranslateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (imgScale.value <= 1) {
        imgTranslateX.value = withSpring(0, { damping: 15 });
        imgTranslateY.value = withSpring(0, { damping: 15 });
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: imgTranslateX.value },
      { translateY: imgTranslateY.value },
      { scale: imgScale.value },
    ] as any,
  }));

  const project = projects.find((p) => p.id === drawing?.projectId);

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return '#22c55e';
      case 'superseded': return '#f97316';
      case 'archived': return COLORS.dark.textMuted;
      default: return COLORS.dark.textMuted;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as any);
    await updateDrawing(drawing!.id, { status: newStatus as any });
  };

  const handleDelete = () => {
    Alert.alert('Delete Drawing', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteDrawing(drawing!.id); router.back(); },
      },
    ]);
  };

  const handleAddPin = useCallback(
    async (pinData: Omit<DrawingPinOverlayItem, 'id'>) => {
      if (!drawing) return;
      setSaving(true);
      try {
        const result = await createPin({
          drawingId: drawing.id,
          x: pinData.x,
          y: pinData.y,
          title: pinData.label,
          description: pinData.description,
          type: 'note',
        });
        if (!result) {
          Alert.alert('Error', 'Failed to create pin');
        }
      } finally {
        setSaving(false);
      }
    },
    [createPin, drawing]
  );

  const handleUpdatePin = useCallback(
    async (pinId: string, updates: Partial<DrawingPinOverlayItem>) => {
      await updatePin(pinId, {
        status: updates.status,
        title: updates.label,
        description: updates.description,
      });
    },
    [updatePin]
  );

  if (!drawing) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background }} edges={['top']}>
        <Ionicons name="map-outline" size={48} color={COLORS.dark.textMuted} />
        <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.md }}>Drawing not found</Text>
      </SafeAreaView>
    );
  }

  const drawingPins = pins
    .filter((p) => p.drawingId === drawing.id)
    .map((p) => ({
      id: p.id,
      x: (p as any).x ?? 0.5,
      y: (p as any).y ?? 0.5,
      label: p.title || p.title || 'Untitled',
      description: p.description,
      status: (p as any as DrawingPinOverlayItem).status || 'open',
      createdBy: p.createdBy,
    }));

  const pinCounts = drawingPins.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xl }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg, paddingHorizontal: SPACING.md }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark.text} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.dark.text }}>Drawing Detail</Text>
          <View style={{ flexDirection: 'row' }}>
            <Pressable onPress={() => router.push(`/drawings/edit?id=${drawing.id}`)} style={{ padding: SPACING.sm, marginRight: SPACING.sm }}>
              <Ionicons name="create-outline" size={20} color={'#2563eb'} />
            </Pressable>
            <Pressable onPress={handleDelete} style={{ padding: SPACING.sm }}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        {/* Zoomable Image + Pins */}
        <View
          style={{
            marginHorizontal: SPACING.md,
            marginBottom: SPACING.lg,
            borderRadius: RADIUS.lg,
            overflow: 'hidden',
            backgroundColor: COLORS.dark.surface,
          }}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setContainerSize({ width, height });
          }}
        >
          <View style={{ width: SCREEN_W - SPACING.md * 2, height: SCREEN_W - SPACING.md * 2 }}>
            <GestureDetector gesture={composedGesture}>
              <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyle]}>
                {drawing.fileUrl ? (
                  <ImageFromUri uri={drawing.fileUrl} />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="image-outline" size={48} color={COLORS.dark.textMuted} />
                    <Text style={{ color: COLORS.dark.textMuted, marginTop: SPACING.sm }}>No image</Text>
                  </View>
                )}
              </Animated.View>
            </GestureDetector>

            <PinOverlay
              pins={drawingPins}
              width={containerSize.width}
              height={containerSize.height}
              onAddPin={handleAddPin}
              onUpdatePin={handleUpdatePin}
              readOnly={false}
              currentUserId={undefined}
            />
            {saving && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  padding: SPACING.sm,
                }}
              >
                <ActivityIndicator size="small" color={COLORS.primary[600]} />
              </View>
            )}
          </View>

          <View style={{ padding: SPACING.sm }}>
            <PinLegend />
            {Object.entries(pinCounts).length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm }}>
                {Object.entries(pinCounts).map(([s, count]) => (
                  <View
                    key={s}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: SPACING.md,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    <Text style={{ color: COLORS.dark.textMuted, fontSize: 12 }}>
                      {s.replace('_', ' ')}:
                    </Text>
                    <Text style={{ color: COLORS.dark.textSecondary, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                      {count}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Title & Status */}
        <View style={{ marginBottom: SPACING.lg, paddingHorizontal: SPACING.md }}>
          <Text style={{ fontSize: TYPOGRAPHY.h2.fontSize, fontWeight: TYPOGRAPHY.h2.fontWeight, color: COLORS.dark.text }}>
            {drawing.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm }}>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: statusColor(drawing.status) + '20' }}>
              <Text style={{ color: statusColor(drawing.status), fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {drawing.status}
              </Text>
            </View>
            <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.dark.elevated }}>
              <Text style={{ color: COLORS.dark.textSecondary, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {drawing.discipline}
              </Text>
            </View>
          </View>
        </View>

        {
            /* Details Card */
        }
        <Card style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg, marginHorizontal: SPACING.md, marginBottom: 16, padding: 16 }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Details</Text>
          <InfoRow icon="business" label="Project" value={project?.name || drawing.projectName || 'No Project'} />
          <InfoRow icon="git-branch" label="Revision" value={drawing.revision || 'N/A'} />
          <InfoRow icon="person" label="Uploaded By" value={drawing.uploadedBy || 'Unknown'} />
          <InfoRow icon="calendar" label="Created" value={new Date(drawing.createdAt).toLocaleDateString()} />
        </Card>

        {/* Status Actions */}
        <Card style={{ backgroundColor: COLORS.dark.surface, borderRadius: RADIUS.lg, marginHorizontal: SPACING.md, marginBottom: 16, padding: 16 }}>
          <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text, marginBottom: SPACING.md }}>Update Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {(['active', 'superseded', 'archived'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => handleStatusChange(s)}
                style={{
                  paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
                  borderRadius: RADIUS.md,
                  backgroundColor: status === s ? statusColor(s) + '30' : COLORS.dark.elevated,
                  borderWidth: 1, borderColor: status === s ? statusColor(s) : COLORS.dark.border,
                }}
              >
                <Text style={{ color: status === s ? statusColor(s) : COLORS.dark.textMuted, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function ImageFromUri({ uri }: { uri: string }) {
  return (
    <Animated.Image
      source={{ uri }}
      style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
    />
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm }}>
      <Ionicons name={icon} size={16} color={COLORS.dark.textMuted} />
      <Text style={{ fontSize: TYPOGRAPHY.caption.fontSize, color: COLORS.dark.textMuted, marginLeft: SPACING.sm, width: 90 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: TYPOGRAPHY.body.fontSize, color: COLORS.dark.text, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}
