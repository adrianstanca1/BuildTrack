import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

const LEGEND_ITEMS = [
  { label: 'Open', color: '#ef4444' },
  { label: 'In Progress', color: '#f59e0b' },
  { label: 'Resolved', color: '#22c55e' },
  { label: 'Rejected', color: '#94a3b8' },
];

export function PinLegend() {
  return (
    <View style={styles.container}>
      {LEGEND_ITEMS.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={styles.text}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: COLORS.dark.textSecondary,
    fontWeight: '500',
  },
});
