import { View, Text, Pressable , useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  count?: number;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
  count,
}: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  return (
    <View className="flex-row items-center justify-between py-3 px-1">
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text
            style={{
              fontSize: TYPOGRAPHY.h3.size,
              fontWeight: TYPOGRAPHY.h3.weight,
              color: c.text,
              lineHeight: TYPOGRAPHY.h3.lineHeight,
            }}
          >
            {title}
          </Text>
          {count !== undefined && (
            <View
              className="ml-2 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark ? COLORS.primary[700] : COLORS.primary[100],
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.small.size,
                  fontWeight: TYPOGRAPHY.small.weight,
                  color: isDark ? COLORS.primary[200] : COLORS.primary[700],
                }}
              >
                {count}
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text
            style={{
              fontSize: TYPOGRAPHY.caption.size,
              fontWeight: TYPOGRAPHY.caption.weight,
              color: c.textSecondary,
              lineHeight: TYPOGRAPHY.caption.lineHeight,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {action && onAction && (
        <Pressable
          onPress={onAction}
          className="flex-row items-center"
          style={{ marginLeft: 8 }}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.caption.size,
              fontWeight: TYPOGRAPHY.captionMedium.weight,
              color: COLORS.primary[500],
            }}
          >
            {action}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.primary[500]}
            style={{ marginLeft: -2 }}
          />
        </Pressable>
      )}
    </View>
  );
}
