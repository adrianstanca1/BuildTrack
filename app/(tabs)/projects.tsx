import { View, Text, TextInput, FlatList, Pressable, RefreshControl, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useProjectsStore } from '../../stores/projectsStore';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../constants/colors';

export default function ProjectsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { projects, fetchProjects, loading } = useProjectsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter projects by search
  const filteredProjects = searchQuery.trim()
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, [fetchProjects]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Projects</Text>
          <Pressable
            onPress={() => router.push('/(modals)/project-details')}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">New</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className={`flex-row items-center mb-4 p-3 rounded-xl ${
          isDark ? 'bg-zinc-900' : 'bg-white'
        }`}>
          <Ionicons name="search" size={18} color={colors.gray} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search projects..."
            placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
            className={`flex-1 ml-2 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.gray} />
            </Pressable>
          )}
        </View>

        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <Card className="mb-3">
              <Pressable
                onPress={() => router.push(`/project/${item.id}`)}
                className="p-4"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.location}</Text>
                  </View>
                  <StatusBadge status={item.status} />
                </View>

                <View className="flex-row mt-3 space-x-6">
                  <InfoRow icon="calendar" text={`Due ${new Date(item.endDate).toLocaleDateString()}`} />
                  <InfoRow icon="people" text={`${item.teamSize} workers`} />
                  <InfoRow icon="cash" text={`$${item.budget.toLocaleString()}`} />
                </View>

                <View className="mt-3">
                  <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-xs text-gray-500">Progress</Text>
                    <Text className="text-xs text-gray-500">{item.progress}%</Text>
                  </View>
                </View>
              </Pressable>
            </Card>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Ionicons name="construct-outline" size={48} color={colors.gray} />
              <Text className="text-gray-500 mt-4 text-center">
                {searchQuery ? 'No projects match your search' : 'No projects yet.\nTap "New" to create one.'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={icon} size={14} color={colors.gray} />
      <Text className="text-xs text-gray-500 ml-1">{text}</Text>
    </View>
  );
}
