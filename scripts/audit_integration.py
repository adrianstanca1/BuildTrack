#!/usr/bin/env python3
"""Audit store integration status."""
import os

STORES_DIR = '/root/BuildTrack/stores'
TABLE_MAP = {
    'projectsStore.ts': 'projects', 'tasksStore.ts': 'tasks',
    'teamStore.ts': 'workers', 'materialsStore.ts': 'materials',
    'equipmentStore.ts': 'equipment', 'dailyReportsStore.ts': 'daily_reports',
    'timesheetsStore.ts': 'timesheets', 'meetingsStore.ts': 'meetings',
    'sitePhotosStore.ts': 'site_photos', 'permitsStore.ts': 'permits',
    'defectsStore.ts': 'defects', 'punchItemsStore.ts': 'punch_items',
    'rfisStore.ts': 'rfis', 'drawingsStore.ts': 'drawings',
    'drawingPinsStore.ts': 'drawing_pins', 'changeOrdersStore.ts': 'change_orders',
    'purchaseOrdersStore.ts': 'purchase_orders', 'invoicesStore.ts': 'invoices',
    'submittalsStore.ts': 'submittals', 'delayNotesStore.ts': 'delay_notes',
    'budgetStore.ts': 'budget_entries', 'billingStore.ts': 'billing_entries',
    'notificationsStore.ts': 'notifications',
}

skip = {'syncStore.ts', 'safetyStore.ts'}

total = 0
integrated = 0
missing = 0

print(f"{'Status':<6} {'Store':<25} {'Table':<20} {'Import':<6} {'QM':<4}")
print("-" * 65)

for filename, table in sorted(TABLE_MAP.items()):
    filepath = os.path.join(STORES_DIR, filename)
    if not os.path.exists(filepath):
        continue

    with open(filepath, 'r') as f:
        content = f.read()

    has_import = "import { useSyncStore } from './syncStore';" in content
    qm_count = content.count('queueMutation')
    total += 1

    status = "✅"
    if not has_import and qm_count == 0:
        status = "❌"
        missing += 1
    elif not has_import:
        status = "⚠️"
        missing += 1
    elif qm_count == 0:
        status = "🔄"
    else:
        integrated += 1

    print(f"{status:<6} {filename:<25} {table:<20} {'Yes' if has_import else 'No':<6} {qm_count:<4}")

print(f"\n{'─'*65}")
print(f"Total: {total} | Integrated: {integrated} | Missing: {missing}")
print(f"Coverage: {integrated/total*100:.0f}%")
