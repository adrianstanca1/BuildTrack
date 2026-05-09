import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
}

export function BottomSheet({ visible, onClose, title, children, snapPoints = ['25%', '50%', '75%'] }: BottomSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: c.overlay,
            opacity: backdropOpacity,
          }}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: SCREEN_HEIGHT * 0.85,
          backgroundColor: c.elevated,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          transform: [{ translateY }],
        }}
        {...panResponder.panHandlers}
      >
        <View className="items-center pt-2 pb-1">
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border }} />
        </View>
        {title && (
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text style={{ fontSize: TYPOGRAPHY.h3.size, fontWeight: TYPOGRAPHY.h3.weight, color: c.text }}>
              {title}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={c.textSecondary} />
            </Pressable>
          </View>
        )}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
}
