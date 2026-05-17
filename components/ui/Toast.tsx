import React, { useEffect } from 'react';
import { Text, Pressable, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', visible, onDismiss, duration = 4000 }: ToastProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  const config = {
    success: {
      bg: isDark ? '#064e3b' : '#f0fdf4',
      border: COLORS.success,
      icon: 'checkmark-circle' as const,
      iconColor: COLORS.success,
    },
    error: {
      bg: isDark ? '#7f1d1d' : '#fef2f2',
      border: COLORS.danger,
      icon: 'alert-circle' as const,
      iconColor: COLORS.danger,
    },
    warning: {
      bg: isDark ? '#78350f' : '#fffbeb',
      border: COLORS.warning,
      icon: 'warning' as const,
      iconColor: COLORS.warning,
    },
    info: {
      bg: isDark ? '#172554' : '#eff6ff',
      border: COLORS.info,
      icon: 'information-circle' as const,
      iconColor: COLORS.info,
    },
  };

  const { bg, border, icon, iconColor } = config[type];

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 250 });

      const timer = setTimeout(() => {
        translateY.value = withTiming(100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)();
          }
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 24,
          left: 16,
          right: 16,
          backgroundColor: bg,
          borderRadius: RADIUS.md,
          borderLeftWidth: 4,
          borderLeftColor: border,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: 999,
        },
        animatedStyle,
      ]}
    >
      <Ionicons name={icon} size={22} color={iconColor} style={{ marginRight: 10 }} />
      <Text
        style={{
          flex: 1,
          fontSize: TYPOGRAPHY.caption.size,
          fontWeight: TYPOGRAPHY.captionMedium.weight,
          color: c.text,
          lineHeight: TYPOGRAPHY.caption.lineHeight,
        }}
      >
        {message}
      </Text>
      <Pressable onPress={onDismiss}>
        <Ionicons name="close" size={20} color={c.textMuted} />
      </Pressable>
    </Animated.View>
  );
}
