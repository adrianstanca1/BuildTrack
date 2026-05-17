import React, { useState } from 'react';
import { View, TextInput, Pressable , useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search...',
  autoFocus = false,
}: SearchInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  const [focused, setFocused] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: c.inputBg,
          borderRadius: RADIUS.lg,
          borderWidth: 1.5,
          borderColor: focused ? COLORS.primary[500] : c.inputBorder,
          paddingHorizontal: 14,
          paddingVertical: 10,
        },
        animatedStyle,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={c.textMuted}
        style={{ marginRight: 10 }}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={c.placeholder}
        autoFocus={autoFocus}
        onFocus={() => {
          setFocused(true);
          scale.value = withSpring(1.02, { damping: 15 });
        }}
        onBlur={() => {
          setFocused(false);
          scale.value = withSpring(1, { damping: 15 });
        }}
        returnKeyType="search"
        style={{
          flex: 1,
          fontSize: TYPOGRAPHY.body.size,
          fontWeight: TYPOGRAPHY.body.weight,
          color: c.text,
          lineHeight: TYPOGRAPHY.body.lineHeight,
        }}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={20} color={c.textMuted} />
        </Pressable>
      )}
    </Animated.View>
  );
}
