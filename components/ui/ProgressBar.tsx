import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { useColorScheme } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0–1
  color?: string;
  height?: number;
  showLabel?: boolean;
  labelPosition?: 'left' | 'right' | 'center';
}

export function ProgressBar({
  progress,
  color = COLORS.primary[500],
  height = 8,
  showLabel = false,
  labelPosition = 'right',
}: ProgressBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const clamped = Math.min(1, Math.max(0, progress));
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(clamped, { duration: 600 });
  }, [clamped]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  const label = `${Math.round(clamped * 100)}%`;

  return (
    <View className="flex-row items-center">
      <View
        style={{
          flex: 1,
          height,
          borderRadius: height / 2,
          backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: height / 2,
              backgroundColor: color,
            },
            fillStyle,
          ]}
        />
      </View>
      {showLabel && (
        <Text
          style={{
            marginLeft: labelPosition === 'right' ? 8 : 0,
            marginRight: labelPosition === 'left' ? 8 : 0,
            fontSize: TYPOGRAPHY.caption.size,
            fontWeight: TYPOGRAPHY.captionMedium.weight,
            color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary,
            minWidth: 36,
            textAlign: labelPosition === 'center' ? 'center' : 'right',
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
