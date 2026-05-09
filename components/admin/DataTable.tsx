import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Column<T> {
  key: string;
  header: string;
  width?: number;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowPress?: (item: T) => void;
  emptyText?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  emptyText = 'No data available',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <View className="items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl">
        <Ionicons name="document-text-outline" size={32} color="#9ca3af" />
        <Text className="text-gray-500 mt-2">{emptyText}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header */}
        <View className="flex-row bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
          {columns.map((col) => (
            <View
              key={col.key}
              style={{ width: col.width || 120 }}
              className="mr-2"
            >
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {col.header}
              </Text>
            </View>
          ))}
        </View>

        {/* Rows */}
        {data.map((item, index) => (
          <Pressable
            key={keyExtractor(item)}
            onPress={() => onRowPress?.(item)}
            className={`flex-row px-4 py-3 ${
              index % 2 === 0
                ? 'bg-white dark:bg-gray-900'
                : 'bg-gray-50 dark:bg-gray-800/50'
            } ${index === data.length - 1 ? 'rounded-b-xl' : ''} ${
              onRowPress ? 'active:bg-gray-100 dark:active:bg-gray-700' : ''
            }`}
          >
            {columns.map((col) => (
              <View
                key={col.key}
                style={{ width: col.width || 120 }}
                className="mr-2"
              >
                {col.render ? (
                  col.render(item)
                ) : (
                  <Text className="text-sm text-gray-900 dark:text-gray-100">
                    {(item as Record<string, unknown>)[col.key] as string}
                  </Text>
                )}
              </View>
            ))}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
