import { View, Text, Image } from 'react-native';
import { COLORS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarProps {
  uri?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
}

export function Avatar({ uri, initials, size = 'md', online = false }: AvatarProps) {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
  };

  const fontSizeMap = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 20,
    xl: 28,
  };

  const onlineSizeMap = {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 14,
  };

  const s = sizeMap[size];
  const fs = fontSizeMap[size];
  const os = onlineSizeMap[size];

  const getInitials = () => {
    if (initials) return initials.slice(0, 2).toUpperCase();
    return '?';
  };

  return (
    <View style={{ width: s, height: s }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: s, height: s, borderRadius: s / 2 }}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[COLORS.primary[400], COLORS.primary[600]]}
          style={{
            width: s,
            height: s,
            borderRadius: s / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: fs,
              fontWeight: '600',
              color: '#ffffff',
            }}
          >
            {getInitials()}
          </Text>
        </LinearGradient>
      )}
      {online && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: os,
            height: os,
            borderRadius: os / 2,
            backgroundColor: COLORS.success,
            borderWidth: 2,
            borderColor: COLORS.light.bg,
          }}
        />
      )}
    </View>
  );
}
