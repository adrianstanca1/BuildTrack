import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SHADOWS } from '../../constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface FABProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export function FAB({ icon, onPress, size = 'md', variant = 'primary' }: FABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dims = size === 'lg' ? 64 : 56;
  const iconSize = size === 'lg' ? 28 : 24;
  const bg = variant === 'primary' ? '#2563eb' : '#64748b';

  return (
    <Animated.View style={[animatedStyle, { position: 'absolute', bottom: 24, right: 24 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={onPress}
        style={({ pressed }) => ({
          width: dims,
          height: dims,
          borderRadius: dims / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.9 : 1,
          ...SHADOWS.lg,
        })}
      >
        <Ionicons name={icon} size={iconSize} color="#ffffff" />
      </Pressable>
    </Animated.View>
  );
}
