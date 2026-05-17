import { View, Text , useColorScheme } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({ variant = 'default', children, size = 'sm', dot = false }: BadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const variantBg: Record<BadgeVariant, string> = {
    default: isDark ? 'bg-gray-700' : 'bg-gray-100',
    primary: isDark ? 'bg-blue-900' : 'bg-blue-100',
    success: isDark ? 'bg-green-900' : 'bg-green-100',
    warning: isDark ? 'bg-amber-900' : 'bg-amber-100',
    danger: isDark ? 'bg-red-900' : 'bg-red-100',
    info: isDark ? 'bg-cyan-900' : 'bg-cyan-100',
  };

  const variantText: Record<BadgeVariant, string> = {
    default: isDark ? 'text-gray-300' : 'text-gray-700',
    primary: isDark ? 'text-blue-300' : 'text-blue-700',
    success: isDark ? 'text-green-300' : 'text-green-700',
    warning: isDark ? 'text-amber-300' : 'text-amber-700',
    danger: isDark ? 'text-red-300' : 'text-red-700',
    info: isDark ? 'text-cyan-300' : 'text-cyan-700',
  };

  const dotColor: Record<BadgeVariant, string> = {
    default: isDark ? '#9ca3af' : '#6b7280',
    primary: COLORS.primary[500],
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    info: COLORS.info,
  };

  const padding = size === 'md' ? { paddingVertical: 4, paddingHorizontal: 10 } : { paddingVertical: 2, paddingHorizontal: 8 };
  const fontSize = size === 'md' ? TYPOGRAPHY.caption.size : TYPOGRAPHY.small.size;

  return (
    <View
      className={`flex-row items-center rounded-full ${variantBg[variant]}`}
      style={padding}
    >
      {dot && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: dotColor[variant],
            marginRight: 4,
          }}
        />
      )}
      <Text style={{ fontSize, fontWeight: TYPOGRAPHY.small.weight, color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }} className={variantText[variant]}>
        {children}
      </Text>
    </View>
  );
}
