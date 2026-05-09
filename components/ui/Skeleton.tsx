import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { RADIUS } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  circle?: boolean;
  count?: number;
  style?: any;
}

export function Skeleton({
  width = '100%',
  height = 16,
  circle = false,
  count = 1,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View>
      {items.map((i) => (
        <Animated.View
          key={i}
          style={[
            {
              width,
              height,
              borderRadius: circle ? height / 2 : RADIUS.sm,
              backgroundColor: '#e2e8f0',
              marginBottom: i < count - 1 ? 8 : 0,
            },
            animatedStyle,
            style,
          ]}
        />
      ))}
    </View>
  );
}
