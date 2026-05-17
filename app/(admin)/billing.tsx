import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { useAdmin } from '../../hooks/useAdmin';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Ionicons } from '@expo/vector-icons';

export default function AdminBillingScreen() {
  const { width } = useWindowDimensions();
  const { isAdmin } = useAdmin();
  const isWide = width >= 768;

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-600 dark:text-gray-400">Access Denied</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {isWide && (
        <View className="flex-row flex-1">
          <View style={{ width: 220 }}>
            <AdminSidebar />
          </View>
          <View className="flex-1">
            <BillingContent />
          </View>
        </View>
      )}
      {!isWide && <BillingContent />}
    </View>
  );
}

function BillingContent() {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Billing
      </Text>

      <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
          </View>
          <View className="ml-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Free Plan — Fully Accessible</Text>
            <Text className="text-sm text-gray-500">All features available to every user</Text>
          </View>
        </View>

        <View className="space-y-2 mb-4">
          <FeatureRow icon="construct" label="Unlimited Projects" />
          <FeatureRow icon="people" label="Unlimited Team Members" />
          <FeatureRow icon="cloud-upload" label="Unlimited Storage" />
          <FeatureRow icon="bar-chart" label="Advanced Reports" />
          <FeatureRow icon="headset" label="Priority Support" />
          <FeatureRow icon="document-lock" label="Audit Logs" />
        </View>

        <Text className="text-sm text-gray-500 mt-4">
          No payment processing is configured. All users have full access to every feature.
        </Text>
      </View>
    </ScrollView>
  );
}

function FeatureRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={icon} size={16} color="#16a34a" />
      <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">{label}</Text>
    </View>
  );
}
