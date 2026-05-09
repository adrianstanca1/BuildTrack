import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText, G } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

interface LinePoint {
  x: number;
  y: number;
  label?: string;
}

interface LineChartProps {
  data: LinePoint[];
  height?: number;
  width?: number;
  color?: string;
  fillArea?: boolean;
  showPoints?: boolean;
}

export function LineChart({
  data,
  height = 200,
  width = 350,
  color = COLORS.primary[500],
  fillArea = true,
  showPoints = true,
}: LineChartProps) {
  if (data.length < 2) return null;

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxY = Math.max(...data.map((d) => d.y)) * 1.1;
  const minY = Math.min(...data.map((d) => d.y)) * 0.9;
  const yRange = maxY - minY;

  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth;
  const yScale = (v: number) => padding.top + chartHeight - ((v - minY) / yRange) * chartHeight;

  // Build path
  let pathD = `M ${xScale(0)} ${yScale(data[0].y)}`;
  data.slice(1).forEach((point, i) => {
    pathD += ` L ${xScale(i + 1)} ${yScale(point.y)}`;
  });

  // Area path
  const areaD = `${pathD} L ${xScale(data.length - 1)} ${height - padding.bottom} L ${xScale(0)} ${height - padding.bottom} Z`;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.3} />
            <Stop offset="1" stopColor={color} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + chartHeight * t;
          const value = maxY - yRange * t;
          return (
            <G key={t}>
              <SvgText
                x={padding.left - 8}
                y={y + 4}
                fontSize={10}
                fill={COLORS.light.textMuted}
                textAnchor="end"
              >
                {Math.round(value)}
              </SvgText>
              <Path
                d={`M ${padding.left} ${y} L ${width - padding.right} ${y}`}
                stroke={COLORS.light.border}
                strokeWidth={0.5}
                strokeDasharray="4 4"
              />
            </G>
          );
        })}

        {/* Area fill */}
        {fillArea && <Path d={areaD} fill="url(#areaGradient)" />}

        {/* Line */}
        <Path
          d={pathD}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {showPoints &&
          data.map((point, i) => (
            <Circle
              key={i}
              cx={xScale(i)}
              cy={yScale(point.y)}
              r={5}
              fill={color}
              stroke={COLORS.light.bg}
              strokeWidth={2}
            />
          ))}

        {/* X-axis labels */}
        {data.map((point, i) => (
          <SvgText
            key={`label-${i}`}
            x={xScale(i)}
            y={height - 8}
            fontSize={10}
            fill={COLORS.light.textMuted}
            textAnchor="middle"
          >
            {point.label || String(i + 1)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
