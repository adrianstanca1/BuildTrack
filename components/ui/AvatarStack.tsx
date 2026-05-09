import { View, Text } from 'react-native';
import { Avatar } from './Avatar';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { useColorScheme } from 'react-native';

interface User {
  uri?: string;
  initials?: string;
  name?: string;
}

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarStack({ users, max = 3, size = 'sm' }: AvatarStackProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const displayUsers = users.slice(0, max);
  const overflowCount = users.length - max;

  const sizeMap = {
    sm: { avatar: 'xs' as const, overflow: 24, fontSize: 10 },
    md: { avatar: 'sm' as const, overflow: 32, fontSize: 12 },
  };

  const { avatar: avatarSize, overflow, fontSize } = sizeMap[size];

  return (
    <View className="flex-row items-center">
      {displayUsers.map((user, index) => (
        <View
          key={index}
          style={{
            marginLeft: index > 0 ? -8 : 0,
            zIndex: displayUsers.length - index,
          }}
        >
          <Avatar
            uri={user.uri}
            initials={user.initials}
            size={avatarSize}
          />
        </View>
      ))}
      {overflowCount > 0 && (
        <View
          style={{
            marginLeft: -8,
            width: overflow,
            height: overflow,
            borderRadius: overflow / 2,
            backgroundColor: isDark ? COLORS.dark.surface : COLORS.light.surface,
            borderWidth: 2,
            borderColor: isDark ? COLORS.dark.bg : COLORS.light.bg,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
          }}
        >
          <Text
            style={{
              fontSize: fontSize,
              fontWeight: '600',
              color: c.textSecondary,
            }}
          >
            +{overflowCount}
          </Text>
        </View>
      )}
    </View>
  );
}
