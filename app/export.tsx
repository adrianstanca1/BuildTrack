import { View, Text, ScrollView, Pressable, Alert, useColorScheme, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useProjectsStore } from '../stores/projectsStore';
import { useTasksStore } from '../stores/tasksStore';
import { useSafetyStore } from '../stores/safetyStore';
import { useDelayNotesStore } from '../stores/delayNotesStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExportCategory {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  getData: () => any[];
  count: number;
}

export default function ExportDataScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';

  const { projects } = useProjectsStore();
  const { tasks } = useTasksStore();
  const { incidents, inspections } = useSafetyStore();
  const { delayNotes } = useDelayNotesStore();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  // Load last export date
  useState(() => {
    AsyncStorage.getItem('last_export_date').then((d) => {
      if (d) setLastExport(d);
    });
  });

  const categories: ExportCategory[] = [
    {
      key: 'projects',
      label: 'Projects',
      icon: 'briefcase',
      color: '#3b82f6',
      getData: () => projects,
      count: projects.length,
    },
    {
      key: 'tasks',
      label: 'Tasks',
      icon: 'checkbox',
      color: '#10b981',
      getData: () => tasks,
      count: tasks.length,
    },
    {
      key: 'incidents',
      label: 'Safety Incidents',
      icon: 'warning',
      color: '#ef4444',
      getData: () => incidents,
      count: incidents.length,
    },
    {
      key: 'inspections',
      label: 'Safety Inspections',
      icon: 'shield-checkmark',
      color: '#f59e0b',
      getData: () => inspections,
      count: inspections.length,
    },
    {
      key: 'delayNotes',
      label: 'Delay Notes',
      icon: 'time',
      color: '#8b5cf6',
      getData: () => delayNotes,
      count: delayNotes.length,
    },
  ];

  const toggleCategory = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleExport = useCallback(async () => {
    if (selected.size === 0) {
      Alert.alert('Select Categories', 'Choose at least one category to export.');
      return;
    }

    setExporting(true);
    try {
      const payload: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        appVersion: '1.1.0',
        categories: {},
      };

      for (const cat of categories) {
        if (selected.has(cat.key)) {
          payload.categories[cat.key] = {
            count: cat.count,
            data: cat.getData(),
          };
        }
      }

      const json = JSON.stringify(payload, null, 2);

      await Share.share({ message: json, title: 'BuildTrack Export' });
      await AsyncStorage.setItem('last_export_date', new Date().toISOString());
      setLastExport(new Date().toISOString());

      Alert.alert(
        'Export Ready',
        `${selected.size} category(s) exported as JSON. Share it via your preferred app.`,
        [
          { text: 'OK', onPress: () => router.back() },
        ]
      );
    } catch (e) {
      Alert.alert('Export Failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setExporting(false);
    }
  }, [selected, categories, router]);

  const selectAll = () => {
    setSelected(new Set(categories.map((c) => c.key)));
  };

  const clearAll = () => {
    setSelected(new Set());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>Export Data</Text>
            {lastExport && (
              <Text style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}>
                Last export: {new Date(lastExport).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Select controls */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Pressable onPress={selectAll} style={{ marginRight: 16 }}>
            <Text style={{ color: '#3b82f6', fontWeight: '600' }}>Select All</Text>
          </Pressable>
          <Pressable onPress={clearAll}>
            <Text style={{ color: mutedColor, fontWeight: '600' }}>Clear</Text>
          </Pressable>
        </View>

        {/* Categories */}
        <View style={{ marginBottom: 20 }}>
          {categories.map((cat) => {
            const isSelected = selected.has(cat.key);
            return (
              <Pressable
                key={cat.key}
                onPress={() => toggleCategory(cat.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: cardBg,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 2,
                  borderColor: isSelected ? cat.color : 'transparent',
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: cat.color + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={cat.icon} size={20} color={cat.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>{cat.label}</Text>
                  <Text style={{ fontSize: 13, color: mutedColor, marginTop: 2 }}>{cat.count} records</Text>
                </View>

                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? cat.color : '#d1d5db',
                    backgroundColor: isSelected ? cat.color : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Export button */}
        <Pressable
          onPress={handleExport}
          disabled={exporting}
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="download" size={20} color="white" />
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
                Export {selected.size} Category{selected.size !== 1 ? 's' : ''}
              </Text>
            </>
          )}
        </Pressable>

        <Text style={{ textAlign: 'center', color: mutedColor, fontSize: 12, marginTop: 12 }}>
          Exports as JSON via system share sheet
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
