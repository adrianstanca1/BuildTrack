import { View, Text , useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
}

export function EmptyState({ icon, title, description, action, actionLabel }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  return (
    <View className="items-center justify-center py-12 px-8">
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={36} color={c.textMuted} />
      </View>
      <Text
        style={{
          fontSize: TYPOGRAPHY.h3.size,
          fontWeight: TYPOGRAPHY.h3.weight,
          color: c.text,
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: TYPOGRAPHY.caption.size,
            fontWeight: TYPOGRAPHY.caption.weight,
            color: c.textSecondary,
            textAlign: 'center',
            lineHeight: TYPOGRAPHY.caption.lineHeight,
            marginBottom: 16,
          }}
        >
          {description}
        </Text>
      )}
      {action && actionLabel && (
        <Button variant="primary" onPress={action}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
