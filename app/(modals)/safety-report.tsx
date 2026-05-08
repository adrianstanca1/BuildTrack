import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafetyStore, IncidentSeverity, InspectionStatus } from '../../stores/safetyStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { colors } from '../../constants/colors';

export default function SafetyReportModal() {
  const router = useRouter();
  const { addIncident, addInspection } = useSafetyStore();
  const { projects } = useProjectsStore();

  const [reportType, setReportType] = useState<'incident' | 'inspection'>('incident');
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');

  // Incident fields
  const [severity, setSeverity] = useState<IncidentSeverity>('low');
  const [injuries, setInjuries] = useState('0');
  const [witnesses, setWitnesses] = useState('');

  // Inspection fields
  const [inspectionStatus, setInspectionStatus] = useState<InspectionStatus>('pending');
  const [inspector, setInspector] = useState('');
  const [findings, setFindings] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const selectedProject = projects.find(p => p.id === projectId);
    const baseData = {
      title: title.trim(),
      projectId: projectId || undefined,
      projectName: selectedProject?.name || 'General',
      description: description.trim(),
    };

    if (reportType === 'incident') {
      addIncident({
        ...baseData,
        severity,
        injuries: parseInt(injuries) || 0,
        witnesses: witnesses.split(',').map(w => w.trim()).filter(Boolean),
      });
    } else {
      addInspection({
        ...baseData,
        status: inspectionStatus,
        inspector: inspector.trim() || 'Unassigned',
        findings: findings.split('\n').map(f => f.trim()).filter(Boolean),
      });
    }

    Alert.alert('Success', `${reportType === 'incident' ? 'Incident' : 'Inspection'} recorded`);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Safety Report</Text>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </Pressable>
        </View>

        {/* Report Type Toggle */}
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          <Pressable
            onPress={() => setReportType('incident')}
            className={`flex-1 py-3 rounded-lg items-center ${reportType === 'incident' ? 'bg-red-600' : ''}`}
          >
            <Text className={reportType === 'incident' ? 'text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}>
              Incident
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setReportType('inspection')}
            className={`flex-1 py-3 rounded-lg items-center ${reportType === 'inspection' ? 'bg-blue-600' : ''}`}
          >
            <Text className={reportType === 'inspection' ? 'text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}>
              Inspection
            </Text>
          </Pressable>
        </View>

        <InputField label="Title *" value={title} onChangeText={setTitle} placeholder="Brief description..." />

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <Pressable
            onPress={() => setProjectId('')}
            className={`mr-2 px-4 py-2 rounded-full ${projectId === '' ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <Text className={projectId === '' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>General</Text>
          </Pressable>
          {projects.map(p => (
            <Pressable
              key={p.id}
              onPress={() => setProjectId(p.id)}
              className={`mr-2 px-4 py-2 rounded-full ${projectId === p.id ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Text className={projectId === p.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>{p.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Detailed description..."
          multiline
          numberOfLines={4}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 mb-4"
          textAlignVertical="top"
        />

        {reportType === 'incident' ? (
          <>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</Text>
            <View className="flex-row -mx-1 mb-4">
              {(['low', 'medium', 'high', 'critical'] as IncidentSeverity[]).map(s => (
                <Pressable
                  key={s}
                  onPress={() => setSeverity(s)}
                  className={`m-1 px-4 py-2 rounded-full ${severity === s ? 'bg-red-600' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  <Text className={severity === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <InputField label="Injuries" value={injuries} onChangeText={setInjuries} keyboardType="numeric" />
            <InputField label="Witnesses (comma-separated)" value={witnesses} onChangeText={setWitnesses} placeholder="John Smith, Jane Doe" />
          </>
        ) : (
          <>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</Text>
            <View className="flex-row -mx-1 mb-4">
              {(['pending', 'passed', 'failed'] as InspectionStatus[]).map(s => (
                <Pressable
                  key={s}
                  onPress={() => setInspectionStatus(s)}
                  className={`m-1 px-4 py-2 rounded-full ${inspectionStatus === s ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  <Text className={inspectionStatus === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <InputField label="Inspector" value={inspector} onChangeText={setInspector} placeholder="Inspector name" />
            <InputField label="Findings (one per line)" value={findings} onChangeText={setFindings} placeholder="PPE required\nGuardrails missing" />
          </>
        )}

        <Pressable
          onPress={handleSave}
          className={`p-4 rounded-xl items-center mt-2 ${reportType === 'incident' ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          <Text className="text-white font-semibold text-lg">
            {reportType === 'incident' ? 'Record Incident' : 'Log Inspection'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InputField({ label, value, onChangeText, placeholder, keyboardType = 'default' }: {
  label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
      />
    </View>
  );
}
