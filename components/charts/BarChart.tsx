import React, { useEffect } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
  barWidth?: number;
  horizontal?: boolean;
}

function AnimatedBar({
  percent,
  color,
  index,
  horizontal,
}: {
  percent: number;
  color: string;
  index: number;
  horizontal: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percent, {
      duration: 800 + index * 150,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    [horizontal ? 'width' : 'height']: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View
      style={[
        {
          width: horizontal ? undefined : '100%',
          height: horizontal ? '100%' : undefined,
          backgroundColor: color,
          borderRadius: RADIUS.sm,
        },
        animatedStyle,
      ]}
    />
  );
}

export function BarChart({
  data,
  maxValue,
  height = 200,
  barWidth = 32,
  horizontal = false,
}: BarChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const max = maxValue || Math.max(...data.map((d) => d.value), 1) * 1.1;

  return (
    <View
      style={{
        height,
        flexDirection: horizontal ? 'column' : 'row',
        justifyContent: 'space-around',
        alignItems: horizontal ? 'flex-start' : 'flex-end',
      }}
    >
      {data.map((item, index) => {
        const percent = item.value / max;
        const barColor = item.color || COLORS.primary[500];

        if (horizontal) {
          return (
            <View
              key={item.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
                width: '100%',
              }}
            >
              <Text
                style={{
                  width: 80,
                  fontSize: TYPOGRAPHY.caption.size,
                  color: c.textSecondary,
                }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <View
                style={{
                  flex: 1,
                  height: barWidth,
                  backgroundColor: c.surface,
                  borderRadius: RADIUS.sm,
                  overflow: 'hidden',
                  marginHorizontal: 8,
                }}
              >
                <AnimatedBar
                  percent={percent}
                  color={barColor}
                  index={index}
                  horizontal={horizontal}
                />
              </View>
              <Text
                style={{
                  width: 40,
                  fontSize: TYPOGRAPHY.caption.size,
                  fontWeight: '600',
                  color: c.text,
                }}
              >
                {item.value}
              </Text>
            </View>
          );
        }

        return (
          <View key={item.label} style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ height: height - 30, justifyContent: 'flex-end', width: barWidth }}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  backgroundColor: c.surface,
                  borderRadius: RADIUS.sm,
                  overflow: 'hidden',
                }}
              >
                <AnimatedBar
                  percent={percent}
                  color={barColor}
                  index={index}
                  horizontal={horizontal}
                />
              </View>
            </View>
            <Text
              style={{
                fontSize: 11,
                color: c.textMuted,
                marginTop: 6,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
