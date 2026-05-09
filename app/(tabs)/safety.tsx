import { View, Text, FlatList, Pressable, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafetyStore } from '../../stores/safetyStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function SafetyScreen() {
  const router = useRouter();
  const { incidents, inspections, addIncident, getStats } = useSafetyStore();
  const [filter, setFilter] = useState<'all' | 'incidents' | 'inspections'>('all');

  const stats = getStats();

  const filteredItems = [
    ...incidents.map(i => ({ ...i, type: 'incident' as const })),
    ...inspections.map(i => ({ ...i, type: 'inspection' as const })),
  ].filter(item => filter === 'all' || (filter === 'incidents' ? item.type === 'incident' : item.type === 'inspection'))
   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Safety Management
        </Text>

        {/* Safety Stats */}
        <View className="flex-row -mx-2 mb-4">
          <SafetyStatCard 
            icon="shield-checkmark" 
            label="Days Safe" 
            value={stats.daysSinceIncident}
            color={colors.success}
          />
          <SafetyStatCard 
            icon="warning" 
            label="Incidents" 
            value={stats.totalIncidents}
            color={stats.totalIncidents > 0 ? colors.warning : colors.success}
          />
          <SafetyStatCard 
            icon="clipboard" 
            label="Inspections" 
            value={stats.totalInspections}
            color={colors.primary}
          />
        </View>

        {/* Filters */}
        <View className="flex-row mb-4">
          <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterChip label="Incidents" active={filter === 'incidents'} onPress={() => setFilter('incidents')} />
          <FilterChip label="Inspections" active={filter === 'inspections'} onPress={() => setFilter('inspections')} />
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <Card className="mb-3">
              <Pressable className="p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-row items-center">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                      item.type === 'incident' ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      <Ionicons 
                        name={item.type === 'incident' ? 'warning' : 'clipboard'} 
                        size={18} 
                        color={item.type === 'incident' ? colors.danger : colors.primary}
                      />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {item.projectName} • {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  {'severity' in item && (
                    <View className={`px-2 py-1 rounded-full ${
                      item.severity === 'critical' 
                        ? 'bg-red-100 dark:bg-red-900' 
                        : item.severity === 'high'
                        ? 'bg-orange-100 dark:bg-orange-900'
                        : 'bg-yellow-100 dark:bg-yellow-900'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        item.severity === 'critical' 
                          ? 'text-red-700 dark:text-red-300' 
                          : item.severity === 'high'
                          ? 'text-orange-700 dark:text-orange-300'
                          : 'text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {item.severity}
                      </Text>
                    </View>
                  )}
                  
                  {'status' in item && (
                    <View className={`px-2 py-1 rounded-full ${
                      item.status === 'passed'
                        ? 'bg-green-100 dark:bg-green-900'
                        : item.status === 'failed'
                        ? 'bg-red-100 dark:bg-red-900'
                        : 'bg-yellow-100 dark:bg-yellow-900'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        item.status === 'passed'
                          ? 'text-green-700 dark:text-green-300'
                          : item.status === 'failed'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {item.status}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </Card>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Ionicons name="shield-checkmark-outline" size={48} color={colors.gray} />
              <Text className="text-gray-500 mt-4 text-center">No safety records yet.</Text>
            </View>
          }
        />

        {/* Report Button */}
        <Pressable
          onPress={() => router.push('/(modals)/safety-report')}
          className="mt-4 bg-red-600 p-4 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Report Incident / Inspection</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SafetyStatCard({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string | number; color: string }) {
  return (
    <View className="w-1/3 px-2">
      <View className="bg-white dark:bg-gray-800 p-4 rounded-xl items-center">
        <Ionicons name={icon} size={24} color={color} />
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</Text>
        <Text className="text-xs text-gray-500 mt-1">{label}</Text>
      </View>
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable 
      onPress={onPress}
      className={`mr-2 px-4 py-2 rounded-full ${
        active 
          ? 'bg-blue-600' 
          : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <Text className={`text-sm ${active ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{label}</Text>
    </Pressable>
  );
}
