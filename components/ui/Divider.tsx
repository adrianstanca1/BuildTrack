import { View, Text, type ViewStyle } from 'react-native';
import { useColorScheme } from 'react-native';
import { COLORS } from '../../constants/theme';

interface DividerProps {
  text?: string;
  style?: ViewStyle;
}

export function Divider({ text, style }: DividerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }, style]}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      {text && (
        <Text
          style={{
            marginHorizontal: 12,
            fontSize: 13,
            fontWeight: '500',
            color: c.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {text}
        </Text>
      )}
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
    </View>
  );
}
