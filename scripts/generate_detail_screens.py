import os

BASE = '/root/BuildTrack/app'

SCREENS = [
    {
        'feature': 'materials', 'store_name': 'MaterialsStore', 'item_name': 'Material',
        'table_name': 'materials', 'delete_method': 'deleteMaterial', 'icon': 'cube',
        'status_field': None,
        'name_expr': "item.name || 'Material'",
        'fields': [
            ('Name', 'name', 'cube-outline', None),
            ('Category', 'category', 'list-outline', None),
            ('Quantity', 'quantity', 'scale-outline', None),
            ('Unit', 'unit', 'resize-outline', None),
            ('Unit Price', 'unitPrice', 'cash-outline', 'currency'),
            ('Supplier', 'supplier', 'business-outline', None),
            ('Project', 'projectName', 'briefcase-outline', None),
            ('Created', 'createdAt', 'calendar-outline', 'date'),
        ]
    },
    {
        'feature': 'meetings', 'store_name': 'MeetingsStore', 'item_name': 'Meeting',
        'table_name': 'meetings', 'delete_method': 'deleteMeeting', 'icon': 'people',
        'status_field': 'status',
        'status_colors': {
            'scheduled': '#3b82f6', 'in_progress': '#f59e0b', 'completed': '#22c55e', 'cancelled': '#ef4444'
        },
        'name_expr': "item.title || 'Meeting'",
        'fields': [
            ('Title', 'title', 'text-outline', None),
            ('Type', 'type', 'list-outline', None),
            ('Date', 'date', 'calendar-outline', None),
            ('Time', 'time', 'time-outline', None),
            ('Location', 'location', 'location-outline', None),
            ('Attendees', 'attendees', 'people-outline', None),
            ('Notes', 'notes', 'document-text-outline', None),
            ('Project', 'projectName', 'briefcase-outline', None),
        ]
    },
    {
        'feature': 'punch-items', 'store_name': 'PunchItemsStore', 'item_name': 'PunchItem',
        'table_name': 'punchItems', 'delete_method': 'deletePunchItem', 'icon': 'hammer',
        'status_field': 'status',
        'status_colors': {
            'open': '#ef4444', 'in_progress': '#f59e0b', 'resolved': '#22c55e', 'closed': '#6b7280'
        },
        'name_expr': "item.title || 'Punch Item'",
        'fields': [
            ('Title', 'title', 'text-outline', None),
            ('Description', 'description', 'document-text-outline', None),
            ('Location', 'location', 'location-outline', None),
            ('Severity', 'severity', 'warning-outline', None),
            ('Assigned To', 'assignedTo', 'person-outline', None),
            ('Due Date', 'dueDate', 'calendar-outline', None),
            ('Project', 'projectName', 'briefcase-outline', None),
            ('Created', 'createdAt', 'calendar-outline', 'date'),
        ]
    },
    {
        'feature': 'purchase-orders', 'store_name': 'PurchaseOrdersStore', 'item_name': 'PurchaseOrder',
        'table_name': 'purchaseOrders', 'delete_method': 'deletePurchaseOrder', 'icon': 'cart',
        'status_field': 'status',
        'status_colors': {
            'draft': '#6b7280', 'sent': '#3b82f6', 'acknowledged': '#a855f7',
            'partially_delivered': '#f59e0b', 'delivered': '#22c55e', 'invoiced': '#06b6d4',
            'paid': '#16a34a', 'cancelled': '#ef4444'
        },
        'name_expr': "item.title || item.poNumber || 'Purchase Order'",
        'fields': [
            ('PO Number', 'poNumber', 'document-text-outline', None),
            ('Title', 'title', 'text-outline', None),
            ('Vendor', 'vendor', 'business-outline', None),
            ('Total', 'total', 'cash-outline', 'currency'),
            ('Delivery Date', 'deliveryDate', 'calendar-outline', None),
            ('Project', 'projectName', 'briefcase-outline', None),
            ('Notes', 'notes', 'document-text-outline', None),
            ('Created', 'createdAt', 'calendar-outline', 'date'),
        ]
    },
    {
        'feature': 'site-photos', 'store_name': 'SitePhotosStore', 'item_name': 'SitePhoto',
        'table_name': 'sitePhotos', 'delete_method': 'deleteSitePhoto', 'icon': 'camera',
        'status_field': None,
        'name_expr': "item.title || 'Site Photo'",
        'fields': [
            ('Title', 'title', 'text-outline', None),
            ('Description', 'description', 'document-text-outline', None),
            ('Category', 'category', 'list-outline', None),
            ('Taken By', 'takenBy', 'person-outline', None),
            ('Taken At', 'takenAt', 'calendar-outline', None),
            ('Project', 'projectName', 'briefcase-outline', None),
            ('Tags', 'tags', 'pricetag-outline', None),
            ('Created', 'createdAt', 'calendar-outline', 'date'),
        ]
    },
    {
        'feature': 'submittals', 'store_name': 'SubmittalsStore', 'item_name': 'Submittal',
        'table_name': 'submittals', 'delete_method': 'deleteSubmittal', 'icon': 'document-text',
        'status_field': 'status',
        'status_colors': {
            'draft': '#6b7280', 'submitted': '#3b82f6', 'under-review': '#f59e0b',
            'approved': '#22c55e', 'rejected': '#ef4444'
        },
        'name_expr': "item.title || 'Submittal'",
        'fields': [
            ('Title', 'title', 'text-outline', None),
            ('Spec Section', 'specSection', 'list-outline', None),
            ('Type', 'type', 'list-outline', None),
            ('Submitted By', 'submittedBy', 'person-outline', None),
            ('Submitted Date', 'submittedDate', 'calendar-outline', None),
            ('Due Date', 'dueDate', 'calendar-outline', None),
            ('Project', 'projectName', 'briefcase-outline', None),
            ('Notes', 'notes', 'document-text-outline', None),
        ]
    },
]

def fmt_value(key, fmt):
    """Return a JSX-safe expression string."""
    if fmt == 'currency':
        # Use a helper variable approach
        return 'fmtCurrency(item.%s)' % key
    elif fmt == 'date':
        return 'fmtDate(item.%s)' % key
    return 'item.%s || "N/A"' % key

def build_screen(screen):
    # Status function
    status_fn = ''
    status_badge = ''
    if screen.get('status_field'):
        colors = screen['status_colors']
        cases = '\n'.join(["      case '%s': return '%s';" % (k, v) for k, v in colors.items()])
        status_fn = """
  const statusColor = (status: string) => {
    switch (status) {
%s
      default: return '#6b7280';
    }
  };""" % cases
        sf = screen['status_field']
        status_badge = """        <View className="mt-2">
          <View className="self-start rounded-full px-3 py-1" style={{ backgroundColor: statusColor(item.%s) + '20' }}>
            <Text className="text-xs font-semibold uppercase" style={{ color: statusColor(item.%s) }}>
              {item.%s.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
""" % (sf, sf, sf)

    # Build fields
    field_lines = []
    for label, key, icon, fmt in screen['fields']:
        val = fmt_value(key, fmt)
        field_lines.append("""          <View className="flex-row items-center py-2">
            <Ionicons name="%s" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">%s</Text>
              <Text className="text-sm font-medium text-gray-900">{%s}</Text>
            </View>
          </View>""" % (icon, label, val))

    name_expr = screen['name_expr']
    has_currency = any(f[3] == 'currency' for f in screen['fields'])
    has_date = any(f[3] == 'date' for f in screen['fields'])

    helpers = []
    if has_currency:
        helpers.append("""  const fmtCurrency = (v?: number) => v != null ? '£' + v.toFixed(2) : 'N/A';""")
    if has_date:
        helpers.append("""  const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('en-GB') : 'N/A';""")
    helpers_str = '\n'.join(helpers)

    content = """import { View, Text, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { use%s } from '../../stores/%sStore';
import { Card } from '../../components/ui/Card';

export default function %sDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { %s, %s } = use%s();
%s

  const item = %s.find((e) => e.id === id);
%s
  if (!item) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="%s-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-400 mt-4">%s not found</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete %s',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await %s(item.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-4">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1" numberOfLines={1}>
            {%s}
          </Text>
          <Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>
%s
        <Card className="mt-4">
%s
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
""" % (
        screen['store_name'], screen['table_name'],
        screen['item_name'],
        screen['table_name'], screen['delete_method'], screen['store_name'],
        helpers_str,
        screen['table_name'],
        status_fn,
        screen['icon'], screen['item_name'],
        screen['item_name'],
        screen['delete_method'],
        name_expr,
        status_badge,
        '\n'.join(field_lines)
    )
    return content

count = 0
for screen in SCREENS:
    filepath = os.path.join(BASE, screen['feature'], '[id].tsx')
    content = build_screen(screen)
    with open(filepath, 'w') as f:
        f.write(content)
    count += 1
    print(f"Generated: {filepath} ({len(content)} bytes)")

print(f"\nGenerated {count} detail screens")
