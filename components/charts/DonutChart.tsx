import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 200,
  strokeWidth = 20,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G transform={`rotate(-90 ${center} ${center})`}>
          {/* Background track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={COLORS.light.surface}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Segments */}
          {data.map((segment, index) => {
            const percent = segment.value / total;
            const strokeDasharray = `${circumference * percent} ${circumference}`;
            const strokeDashoffset = -circumference * cumulativePercent;
            cumulativePercent += percent;

            const progress = useSharedValue(0);
            const animatedProps = useAnimatedProps(() => ({
              strokeDashoffset: strokeDashoffset - circumference * (1 - progress.value),
            }));

            React.useEffect(() => {
              progress.value = withTiming(1, { duration: 1000 + index * 200 });
            }, []);

            return (
              <AnimatedCircle
                key={segment.label}
                cx={center}
                cy={center}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                animatedProps={animatedProps}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>

      {/* Center text */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {centerValue && (
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: COLORS.light.text,
            }}
          >
            {centerValue}
          </Text>
        )}
        {centerLabel && (
          <Text
            style={{
              fontSize: 12,
              color: COLORS.light.textMuted,
              marginTop: 2,
            }}
          >
            {centerLabel}
          </Text>
        )}
      </View>

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 16,
          gap: 12,
        }}
      >
        {data.map((segment) => (
          <View key={segment.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: segment.color,
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 12, color: COLORS.light.textSecondary }}>
              {segment.label} ({Math.round((segment.value / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
