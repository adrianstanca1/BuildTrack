import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface SocialAuthButtonProps {
  provider: 'google' | 'apple' | 'github' | 'microsoft';
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const providerConfig = {
  google: {
    icon: 'logo-google' as const,
    label: 'Continue with Google',
    bg: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
  },
  apple: {
    icon: 'logo-apple' as const,
    label: 'Continue with Apple',
    bg: '#000000',
    text: '#ffffff',
    border: '#000000',
  },
  github: {
    icon: 'logo-github' as const,
    label: 'Continue with GitHub',
    bg: '#24292f',
    text: '#ffffff',
    border: '#24292f',
  },
  microsoft: {
    icon: 'logo-microsoft' as const,
    label: 'Continue with Microsoft',
    bg: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
  },
};

export function SocialAuthButton({ provider, onPress, isLoading, disabled }: SocialAuthButtonProps) {
  const config = providerConfig[provider];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: config.border,
        backgroundColor: config.bg,
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Ionicons
        name={config.icon}
        size={20}
        color={config.text}
        style={{ marginRight: 10 }}
      />
      <Text
        style={{
          fontSize: TYPOGRAPHY.bodyMedium.size,
          fontWeight: TYPOGRAPHY.bodyMedium.weight,
          color: config.text,
        }}
      >
        {config.label}
      </Text>
    </Pressable>
  );
}
