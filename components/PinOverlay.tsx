import React, { useState, useCallback } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { BottomSheet } from './ui/BottomSheet';

export type DrawingPinStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';

export interface DrawingPinOverlayItem {
  id: string;
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  label?: string;
  description?: string;
  status: DrawingPinStatus;
  createdBy?: string;
  assignedTo?: string;
}

const PIN_COLORS: Record<DrawingPinStatus, string> = {
  open: '#ef4444',
  in_progress: '#f59e0b',
  resolved: '#22c55e',
  rejected: '#94a3b8',
};

interface PinOverlayProps {
  pins: DrawingPinOverlayItem[];
  width: number;
  height: number;
  onAddPin?: (pin: Omit<DrawingPinOverlayItem, 'id'>) => void;
  onUpdatePin?: (id: string, updates: Partial<DrawingPinOverlayItem>) => void;
  readOnly?: boolean;
  currentUserId?: string;
}

function PinDot({
  pin,
  width,
  height,
  onPress,
}: {
  pin: DrawingPinOverlayItem;
  width: number;
  height: number;
  onPress: (pin: DrawingPinOverlayItem) => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const left = pin.x * width;
  const top = pin.y * height;

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(1.3, { damping: 8 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 8 });
      }}
      onPress={() => onPress(pin)}
      style={{
        position: 'absolute',
        left: left - 10,
        top: top - 10,
        width: 20,
        height: 20,
        zIndex: 10,
      }}
    >
      <Animated.View
        style={[
          {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: PIN_COLORS[pin.status],
            borderWidth: 2,
            borderColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          },
          animatedStyle,
        ]}
      />
    </Pressable>
  );
}

export default function PinOverlay({
  pins,
  width,
  height,
  onAddPin,
  onUpdatePin,
  readOnly = false,
  currentUserId,
}: PinOverlayProps) {
  const [selectedPin, setSelectedPin] = useState<DrawingPinOverlayItem | null>(null);
  const [addingPin, setAddingPin] = useState<{ x: number; y: number } | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleImageTap = useCallback(
    (event: any) => {
      if (readOnly || !onAddPin) return;
      const { nativeEvent } = event;
      const x = nativeEvent.locationX / width;
      const y = nativeEvent.locationY / height;
      setAddingPin({ x, y });
      setNewLabel('');
      setNewDescription('');
    },
    [readOnly, onAddPin, width, height]
  );

  const handleSaveNewPin = useCallback(() => {
    if (!addingPin || !onAddPin) return;
    onAddPin({
      x: addingPin.x,
      y: addingPin.y,
      label: newLabel || 'Untitled Pin',
      description: newDescription,
      status: 'open',
      createdBy: currentUserId,
    });
    setAddingPin(null);
    setNewLabel('');
    setNewDescription('');
  }, [addingPin, newLabel, newDescription, onAddPin, currentUserId]);

  const handleStatusChange = useCallback(
    (pinId: string, status: DrawingPinStatus) => {
      onUpdatePin?.(pinId, { status });
      setSelectedPin((prev) => (prev ? { ...prev, status } : prev));
    },
    [onUpdatePin]
  );

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="box-none">
      {!readOnly && (
        <Pressable onPress={handleImageTap} style={[StyleSheet.absoluteFill]}>
          <View style={[StyleSheet.absoluteFill]} />
        </Pressable>
      )}

      {pins.map((pin) => (
        <PinDot
          key={pin.id}
          pin={pin}
          width={width}
          height={height}
          onPress={setSelectedPin}
        />
      ))}

      {/* Bottom sheet: Create pin */}
      <BottomSheet
        visible={!!addingPin}
        onClose={() => setAddingPin(null)}
        title="Add Pin"
      >
        <Text style={styles.label}>Label</Text>
        <TextInput
          value={newLabel}
          onChangeText={setNewLabel}
          placeholder="e.g. Beam crack near column A"
          placeholderTextColor={COLORS.dark.textMuted}
          style={styles.input}
        />
        <Text style={[styles.label, { marginTop: SPACING.md }]}>Description</Text>
        <TextInput
          value={newDescription}
          onChangeText={setNewDescription}
          placeholder="Optional details..."
          placeholderTextColor={COLORS.dark.textMuted}
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          multiline
        />
        <Pressable
          onPress={handleSaveNewPin}
          style={{
            marginTop: SPACING.lg,
            backgroundColor: COLORS.primary[600],
            paddingVertical: SPACING.md,
            borderRadius: RADIUS.md,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Save Pin</Text>
        </Pressable>
      </BottomSheet>

      {/* Bottom sheet: Pin details */}
      <BottomSheet
        visible={!!selectedPin}
        onClose={() => setSelectedPin(null)}
        title="Pin Detail"
      >
        {selectedPin && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: PIN_COLORS[selectedPin.status],
                  marginRight: SPACING.sm,
                }}
              />
              <Text style={{ fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, color: COLORS.dark.text }}>
                {selectedPin.label || 'Untitled Pin'}
              </Text>
            </View>
            {selectedPin.description ? (
              <Text style={{ color: COLORS.dark.textSecondary, marginBottom: SPACING.md }}>
                {selectedPin.description}
              </Text>
            ) : null}
            <Text style={[styles.label, { marginBottom: SPACING.sm }]}>Status</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {(['open', 'in_progress', 'resolved', 'rejected'] as DrawingPinStatus[]).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => handleStatusChange(selectedPin.id, s)}
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    borderRadius: RADIUS.md,
                    marginRight: SPACING.sm,
                    marginBottom: SPACING.sm,
                    backgroundColor: selectedPin.status === s ? PIN_COLORS[s] + '30' : COLORS.dark.elevated,
                    borderWidth: 1,
                    borderColor: selectedPin.status === s ? PIN_COLORS[s] : COLORS.dark.border,
                  }}
                >
                  <Text style={{ color: selectedPin.status === s ? PIN_COLORS[s] : COLORS.dark.textMuted, fontWeight: '600', fontSize: 12 }}>
                    {s.replace('_', ' ')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.dark.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.dark.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    color: COLORS.dark.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
  },
});
