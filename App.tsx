import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">BuildTrack</Text>
      <Text className="text-gray-500 mt-2">Use Expo Router (app/ directory)</Text>
      <StatusBar style="auto" />
    </View>
  );
}
