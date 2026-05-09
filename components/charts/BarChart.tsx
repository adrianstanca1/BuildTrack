import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, RADIUS } from '@/constants/theme';

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

export function BarChart({
  data,
  maxValue,
  height = 200,
  barWidth = 32,
  horizontal = false,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value)) * 1.1;

  return (
    <View style={{ height, flexDirection: horizontal ? 'column' : 'row', justifyContent: 'space-around', alignItems: horizontal ? 'flex-start' : 'flex-end' }}>
      {data.map((item, index) => {
        const progress = useSharedValue(0);
        const percent = item.value / max;

        useEffect(() => {
          progress.value = withTiming(percent, { duration: 800 + index * 150 });
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
          [horizontal ? 'width' : 'height']: `${progress.value * 100}%`,
        }));

        if (horizontal) {
          return (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, width: '100%' }}>
              <Text style={{ width: 80, fontSize: 12, color: COLORS.light.textSecondary }} numberOfLines={1}>
                {item.label}
              </Text>
              <View style={{ flex: 1, height: barWidth, backgroundColor: COLORS.light.surface, borderRadius: RADIUS.sm, overflow: 'hidden', marginHorizontal: 8 }}>
                <Animated.View
                  style={[
                    { height: '100%', backgroundColor: item.color || COLORS.primary[500], borderRadius: RADIUS.sm },
                    animatedStyle,
                  ]}
                />
              </View>
              <Text style={{ width: 40, fontSize: 12, fontWeight: '600', color: COLORS.light.text }}>
                {item.value}
              </Text>
            </View>
          );
        }

        return (
          <View key={item.label} style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ height: height - 30, justifyContent: 'flex-end', width: barWidth }}>
              <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.light.surface, borderRadius: RADIUS.sm, overflow: 'hidden' }}>
                <Animated.View
                  style={[
                    { width: '100%', backgroundColor: item.color || COLORS.primary[500], borderRadius: RADIUS.sm },
                    animatedStyle,
                  ]}
                />
              </View>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.light.textMuted, marginTop: 6, textAlign: 'center' }} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
