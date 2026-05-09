import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  isDisabled,
  iconLeft,
  iconRight,
  fullWidth = true,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const disabled = isLoading || isDisabled;

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: COLORS.primary[600],
    },
    secondary: {
      backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: COLORS.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: COLORS.danger,
    },
  };

  const textColors = {
    primary: '#ffffff',
    secondary: c.text,
    outline: COLORS.primary[500],
    ghost: COLORS.primary[500],
    danger: '#ffffff',
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14 },
    md: { paddingVertical: 14, paddingHorizontal: 20 },
    lg: { paddingVertical: 16, paddingHorizontal: 24 },
  };

  const textSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        {
          borderRadius: RADIUS.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          width: fullWidth ? '100%' : undefined,
        },
        variantStyles[variant],
        sizeStyles[size],
        style as ViewStyle,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <>
          {iconLeft && (
            <Ionicons
              name={iconLeft}
              size={textSizes[size]}
              color={textColors[variant]}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={{
              color: textColors[variant],
              fontSize: textSizes[size],
              fontWeight: TYPOGRAPHY.bodyMedium.weight,
              lineHeight: textSizes[size] + 4,
            }}
          >
            {children}
          </Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={textSizes[size]}
              color={textColors[variant]}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </Pressable>
  );
}
