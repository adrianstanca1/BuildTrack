import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: object;
}

export function Input({
  label,
  error,
  hint,
  iconLeft,
  iconRight,
  isPassword,
  containerStyle,
  onChangeText,
  ...rest
}: InputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? COLORS.danger
    : isFocused
      ? COLORS.primary[500]
      : c.inputBorder;

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: TYPOGRAPHY.captionMedium.size,
            fontWeight: TYPOGRAPHY.captionMedium.weight,
            color: c.text,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: c.inputBg,
          borderWidth: 1.5,
          borderColor,
          borderRadius: RADIUS.lg,
          paddingHorizontal: 14,
          minHeight: 52,
        }}
      >
        {iconLeft && (
          <Ionicons
            name={iconLeft}
            size={20}
            color={isFocused ? COLORS.primary[500] : c.textMuted}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          style={{
            flex: 1,
            fontSize: TYPOGRAPHY.body.size,
            color: c.text,
            paddingVertical: 14,
            minHeight: 52,
          }}
          placeholderTextColor={c.placeholder}
          secureTextEntry={isPassword ? !showPassword : rest.secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          onChangeText={(text) => {
            onChangeText?.(text);
          }}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={c.textMuted}
            />
          </TouchableOpacity>
        )}
        {iconRight && !isPassword && (
          <Ionicons
            name={iconRight}
            size={20}
            color={c.textMuted}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
      {error ? (
        <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4, fontWeight: '500' }}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
