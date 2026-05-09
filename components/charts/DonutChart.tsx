import React, { useEffect } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY } from '@/constants/theme';

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

function Segment({
  center,
  radius,
  strokeWidth,
  circumference,
  color,
  percent,
  startOffset,
  index,
}: {
  center: number;
  radius: number;
  strokeWidth: number;
  circumference: number;
  color: string;
  percent: number;
  startOffset: number;
  index: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1000 + index * 200,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const strokeDasharray = `${circumference * percent} ${circumference}`;
  const strokeDashoffset = -circumference * startOffset;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset - circumference * (1 - progress.value),
  }));

  return (
    <AnimatedCircle
      cx={center}
      cy={center}
      r={radius}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeDasharray={strokeDasharray}
      animatedProps={animatedProps}
      strokeLinecap="round"
    />
  );
}

export function DonutChart({
  data,
  size = 200,
  strokeWidth = 20,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

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
            stroke={c.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Segments */}
          {data.map((segment, index) => {
            const percent = total > 0 ? segment.value / total : 0;
            const startOffset = cumulativePercent;
            cumulativePercent += percent;

            return (
              <Segment
                key={segment.label}
                center={center}
                radius={radius}
                strokeWidth={strokeWidth}
                circumference={circumference}
                color={segment.color}
                percent={percent}
                startOffset={startOffset}
                index={index}
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
              fontWeight: TYPOGRAPHY.h1.weight,
              color: c.text,
            }}
          >
            {centerValue}
          </Text>
        )}
        {centerLabel && (
          <Text
            style={{
              fontSize: TYPOGRAPHY.small.size,
              color: c.textMuted,
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
            <Text style={{ fontSize: TYPOGRAPHY.small.size, color: c.textSecondary }}>
              {segment.label} ({total > 0 ? Math.round((segment.value / total) * 100) : 0}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
