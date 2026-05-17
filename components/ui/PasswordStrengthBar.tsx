import { View, Text , useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: c.border };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Weak', color: COLORS.danger };
    if (score <= 3) return { score, label: 'Fair', color: COLORS.warning };
    if (score <= 4) return { score, label: 'Good', color: '#22c55e' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  const strength = calculateStrength(password);
  const widthPercent = Math.min((strength.score / 5) * 100, 100);

  const animatedWidth = useAnimatedStyle(() => ({
    width: withSpring(`${widthPercent}%`, { damping: 15, stiffness: 100 }),
  }));

  if (!password) return null;

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', height: 4, backgroundColor: c.border, borderRadius: 2, overflow: 'hidden' }}>
        <Animated.View
          style={[
            { height: '100%', borderRadius: 2, backgroundColor: strength.color },
            animatedWidth,
          ]}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontSize: 11, color: c.textMuted }}>
          {password.length < 8 ? 'Use at least 8 characters' : `${strength.label} password`}
        </Text>
      </View>
    </View>
  );
}
