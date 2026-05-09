import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { useColorScheme } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  right?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  style?: any;
}

export function ListItem({
  title,
  subtitle,
  icon,
  iconColor = COLORS.primary[500],
  iconBg,
  onPress,
  onLongPress,
  right,
  selected = false,
  disabled = false,
  style,
}: ListItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const defaultIconBg = isDark ? COLORS.primary[900] : COLORS.primary[50];

  const content = (
    <View
      className="flex-row items-center py-3 px-1"
      style={[
        {
          opacity: disabled ? 0.5 : 1,
          borderRadius: RADIUS.md,
          backgroundColor: selected
            ? isDark
              ? COLORS.primary[900]
              : COLORS.primary[50]
            : 'transparent',
        },
        style,
      ]}
    >
      {icon && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: RADIUS.md,
            backgroundColor: iconBg || defaultIconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      )}
      <View className="flex-1">
        <Text
          style={{
            fontSize: TYPOGRAPHY.body.size,
            fontWeight: TYPOGRAPHY.bodyMedium.weight,
            color: selected ? COLORS.primary[500] : c.text,
            lineHeight: TYPOGRAPHY.body.lineHeight,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: TYPOGRAPHY.caption.size,
              fontWeight: TYPOGRAPHY.caption.weight,
              color: c.textSecondary,
              lineHeight: TYPOGRAPHY.caption.lineHeight,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right || (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={c.textMuted}
          style={{ marginLeft: 8 }}
        />
      )}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        android_ripple={{ color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderless: true }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
