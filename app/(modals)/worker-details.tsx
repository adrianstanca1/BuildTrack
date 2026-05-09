import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../stores/teamStore';
import type { Worker, WorkerRole, WorkerStatus } from '../../types';
import { colors } from '../../constants/colors';

const WORKER_ROLES: WorkerRole[] = ['foreman', 'electrician', 'plumber', 'carpenter', 'mason', 'laborer', 'engineer', 'safety-officer'];
const WORKER_STATUSES: WorkerStatus[] = ['active', 'off-duty', 'on-leave'];

export default function WorkerModal() {
  const router = useRouter();
  const { addWorker } = useTeamStore();

  const [name, setName] = useState('');
  const [role, setRole] = useState<WorkerRole>('laborer');
  const [status, setStatus] = useState<WorkerStatus>('active');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('40');
  const [certifications, setCertifications] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Worker name is required');
      return;
    }

    addWorker({
      name: name.trim(),
      role,
      status,
      phone: phone.trim(),
      email: email.trim(),
      weeklyHours: parseInt(weeklyHours) || 40,
      certifications: certifications.split(',').map(c => c.trim()).filter(Boolean),
      projectAssignments: [],
    });

    Alert.alert('Success', `${name} added to the team`);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Add Worker</Text>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </Pressable>
        </View>

        <InputField label="Name *" value={name} onChangeText={setName} placeholder="John Smith" />

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {WORKER_ROLES.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              className={`mr-2 px-4 py-2 rounded-full ${
                role === r ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text className={role === r ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                {r.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</Text>
        <View className="flex-row -mx-1 mb-4">
          {WORKER_STATUSES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              className={`m-1 px-4 py-2 rounded-full ${
                status === s ? 'bg-green-600' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text className={status === s ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                {s.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </Pressable>
          ))}
        </View>

        <InputField label="Phone" value={phone} onChangeText={setPhone} placeholder="+44 123 456 7890" keyboardType="phone-pad" />
        <InputField label="Email" value={email} onChangeText={setEmail} placeholder="john@example.com" keyboardType="email-address" />
        <InputField label="Weekly Hours" value={weeklyHours} onChangeText={setWeeklyHours} placeholder="40" keyboardType="numeric" />
        <InputField label="Certifications (comma-separated)" value={certifications} onChangeText={setCertifications} placeholder="CSCS, First Aid, IPAF" />

        <Pressable onPress={handleSave} className="bg-blue-600 p-4 rounded-xl items-center mt-4">
          <Text className="text-white font-semibold text-lg">Add Worker</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InputField({ label, value, onChangeText, placeholder, keyboardType = 'default' }: {
  label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
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
